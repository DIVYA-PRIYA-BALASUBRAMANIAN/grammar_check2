# ==============================================================================
# Zenve Vet High-Concurrency Load Balancing Benchmark Tool
# Simulates traffic spikes to measure throughput, latency, and load distribution
# ==============================================================================

param(
    [string]$TargetUrl = "http://localhost:8080/api/v1/stories",
    [int]$TotalRequests = 500,
    [int]$Concurrency = 25
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " ZENVE VET LOAD BALANCING & HIGH CONCURRENCY BENCHMARK TOOL" -ForegroundColor Cyan
Write-Host " Target URL: $TargetUrl" -ForegroundColor Yellow
Write-Host " Total Requests: $TotalRequests | Concurrency Level: $Concurrency" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

$startTime = [System.Diagnostics.Stopwatch]::StartNew()
$successCount = 0
$failCount = 0
$latencies = [System.Collections.Generic.List[double]]::new()

$scriptBlock = {
    param($url)
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $req = [System.Net.HttpWebRequest]::Create($url)
        $req.Method = "GET"
        $req.Timeout = 5000
        $resp = $req.GetResponse()
        $resp.Close()
        $sw.Stop()
        return @{ Success = $true; LatencyMs = $sw.Elapsed.TotalMilliseconds; StatusCode = 200 }
    } catch {
        $sw.Stop()
        return @{ Success = $false; LatencyMs = $sw.Elapsed.TotalMilliseconds; StatusCode = 500 }
    }
}

# Run concurrent thread pool
$runspacePool = [runspacefactory]::CreateRunspacePool(1, $Concurrency)
$runspacePool.Open()

$tasks = @()
for ($i = 0; $i -lt $TotalRequests; $i++) {
    $powershell = [powershell]::Create()
    $powershell.RunspacePool = $runspacePool
    [void]$powershell.AddScript($scriptBlock).AddArgument($TargetUrl)
    $tasks += @{
        Pipe = $powershell
        Async = $powershell.BeginInvoke()
    }
}

Write-Host "Sending $TotalRequests requests with $Concurrency concurrent workers..." -ForegroundColor Green

foreach ($task in $tasks) {
    $result = $task.Pipe.EndInvoke($task.Async)
    $task.Pipe.Dispose()
    if ($result.Success) {
        $successCount++
        $latencies.Add($result.LatencyMs)
    } else {
        $failCount++
    }
}

$runspacePool.Close()
$runspacePool.Dispose()
$startTime.Stop()

$totalSeconds = $startTime.Elapsed.TotalSeconds
$rps = [math]::Round($successCount / [math]::Max(0.001, $totalSeconds), 2)
$sortedLatencies = $latencies | Sort-Object
$avgLatency = [math]::Round(($latencies | Measure-Object -Average).Average, 2)
$p50 = if ($sortedLatencies.Count -gt 0) { [math]::Round($sortedLatencies[[math]::Floor($sortedLatencies.Count * 0.50)], 2) } else { 0 }
$p95 = if ($sortedLatencies.Count -gt 0) { [math]::Round($sortedLatencies[[math]::Floor($sortedLatencies.Count * 0.95)], 2) } else { 0 }
$p99 = if ($sortedLatencies.Count -gt 0) { [math]::Round($sortedLatencies[[math]::Floor($sortedLatencies.Count * 0.99)], 2) } else { 0 }

Write-Host "`n--- BENCHMARK RESULTS ---" -ForegroundColor Cyan
Write-Host "Total Time:            $([math]::Round($totalSeconds, 2)) seconds"
Write-Host "Successful Requests:   $successCount / $TotalRequests ($([math]::Round(($successCount/$TotalRequests)*100, 1))%)" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host "Failed Requests:       $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host "Throughput:            $rps Requests/Second (RPS)" -ForegroundColor Yellow
Write-Host "Average Latency:       $avgLatency ms"
Write-Host "50th Percentile (p50): $p50 ms"
Write-Host "95th Percentile (p95): $p95 ms"
Write-Host "99th Percentile (p99): $p99 ms"
Write-Host "======================================================================" -ForegroundColor Cyan
