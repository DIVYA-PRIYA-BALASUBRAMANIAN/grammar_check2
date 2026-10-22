// ==============================================================================
// Zenve Vet Native Load Balancer (Zero-Dependency Node.js Gateway)
// Runs on Windows/Mac/Linux without requiring Docker or Nginx
// Balances traffic across Spring Boot worker instances (8080, 8081, 8082)
// ==============================================================================

const http = require('http');
const net = require('net');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.LB_PORT || 8000;
const FRONTEND_TARGET = 'http://localhost:5173';
const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');

// Cluster Worker Backend Nodes
const NODES = [
  { id: 1, host: 'localhost', port: 8080, healthy: true, activeRequests: 0, totalRequests: 0, lastCheck: null },
  { id: 2, host: 'localhost', port: 8081, healthy: true, activeRequests: 0, totalRequests: 0, lastCheck: null },
  { id: 3, host: 'localhost', port: 8082, healthy: true, activeRequests: 0, totalRequests: 0, lastCheck: null }
];

let roundRobinIndex = 0;

// Periodic Health Checker (Runs every 3 seconds)
function checkNodeHealth(node) {
  const req = http.request({
    host: node.host,
    port: node.port,
    path: '/api/v1/stories',
    method: 'GET',
    timeout: 2500
  }, (res) => {
    node.healthy = (res.statusCode >= 200 && res.statusCode < 500);
    node.lastCheck = new Date();
  });

  req.on('error', () => {
    node.healthy = false;
    node.lastCheck = new Date();
  });

  req.on('timeout', () => {
    req.destroy();
    node.healthy = false;
  });

  req.end();
}

function runHealthChecks() {
  NODES.forEach(checkNodeHealth);
}
setInterval(runHealthChecks, 3000);
runHealthChecks();

// Selection Algorithm: Least Connections among Healthy Nodes
function getNextHealthyNode() {
  const healthy = NODES.filter(n => n.healthy);
  if (healthy.length === 0) {
    // If all health checks failed (e.g. during boot), fallback to first node
    return NODES[0];
  }

  // Least connections selection
  healthy.sort((a, b) => a.activeRequests - b.activeRequests);
  return healthy[0];
}

// MIME types for static uploads
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.json': 'application/json'
};

// Main HTTP Proxy Server
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, 'http://localhost');
  const pathname = parsedUrl.pathname || '';

  // 1. Direct Static Uploads Offloading (Zero JVM Overhead!)
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(UPLOADS_DIR, filename);

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      const stat = fs.statSync(filePath);

      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=86400, no-transform',
        'Access-Control-Allow-Origin': '*'
      });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // 2. Health & Cluster Status Dashboard endpoint
  if (pathname === '/lb-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      loadBalancerPort: PORT,
      timestamp: new Date().toISOString(),
      nodes: NODES.map(n => ({
        id: n.id,
        target: `http://${n.host}:${n.port}`,
        status: n.healthy ? 'HEALTHY' : 'DOWN',
        activeConnections: n.activeRequests,
        totalRequestsHandled: n.totalRequests
      }))
    }, null, 2));
  }

  // 3. API Requests: Balance across Spring Boot Worker Cluster
  if (pathname.startsWith('/api/') || pathname.startsWith('/actuator/')) {
    const targetNode = getNextHealthyNode();
    targetNode.activeRequests++;
    targetNode.totalRequests++;

    const start = Date.now();
    const proxyReq = http.request({
      host: targetNode.host,
      port: targetNode.port,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        'host': req.headers.host || `${targetNode.host}:${targetNode.port}`,
        'x-forwarded-for': req.socket.remoteAddress,
        'x-forwarded-proto': 'http',
        'x-zenve-node-id': String(targetNode.id)
      }
    }, (proxyRes) => {
      targetNode.activeRequests = Math.max(0, targetNode.activeRequests - 1);
      const latency = Date.now() - start;

      // Add cluster header so developers can inspect which node handled the request
      const headers = { ...proxyRes.headers, 'x-handled-by-node': `Node-${targetNode.id}:${targetNode.port}` };
      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);

      const color = proxyRes.statusCode < 400 ? '\x1b[32m' : '\x1b[31m';
      console.log(`[LB] ${req.method} ${pathname} -> \x1b[36mNode-${targetNode.id}\x1b[0m (:808${targetNode.id - 1}) ${color}${proxyRes.statusCode}\x1b[0m (${latency}ms) [Active: ${targetNode.activeRequests}]`);
    });

    proxyReq.on('error', (err) => {
      targetNode.activeRequests = Math.max(0, targetNode.activeRequests - 1);
      targetNode.healthy = false;
      console.error(`[LB ERROR] Node-${targetNode.id} failed:`, err.message);

      // Attempt automatic failover to another healthy node
      const fallbackNode = NODES.find(n => n.id !== targetNode.id && n.healthy);
      if (fallbackNode) {
        console.log(`[LB FAILOVER] Retrying on Node-${fallbackNode.id}...`);
        const retryReq = http.request({
          host: fallbackNode.host,
          port: fallbackNode.port,
          path: req.url,
          method: req.method,
          headers: req.headers
        }, (retryRes) => {
          res.writeHead(retryRes.statusCode, retryRes.headers);
          retryRes.pipe(res);
        });
        retryReq.on('error', () => {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end('Bad Gateway: Upstream cluster unreachable');
        });
        req.pipe(retryReq);
      } else {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end('Service Unavailable: All backend worker nodes are down');
      }
    });

    req.pipe(proxyReq);
    return;
  }

  // 4. Client SPA Frontend: Proxy to Vite dev server (port 5173) or static dist
  const viteParsed = new URL(FRONTEND_TARGET);
  const viteProxy = http.request({
    host: viteParsed.hostname,
    port: viteParsed.port || 5173,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (viteRes) => {
    res.writeHead(viteRes.statusCode, viteRes.headers);
    viteRes.pipe(res);
  });

  viteProxy.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`<h3>Vite dev server not running on ${FRONTEND_TARGET}. Start client with: npm run dev</h3>`);
  });

  req.pipe(viteProxy);
});

// WebSocket Protocol Upgrade Handling (/ws/**)
server.on('upgrade', (req, socket, head) => {
  const targetNode = getNextHealthyNode();

  const proxySocket = net.connect(targetNode.port, targetNode.host, () => {
    proxySocket.write(`${req.method} ${req.url} HTTP/1.1\r\n`);
    for (const [key, value] of Object.entries(req.headers)) {
      proxySocket.write(`${key}: ${value}\r\n`);
    }
    proxySocket.write('\r\n');
    proxySocket.write(head);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
    console.log(`[LB WS] WebSocket upgraded -> Node-${targetNode.id} (:808${targetNode.id - 1})`);
  });

  proxySocket.on('error', (err) => {
    socket.destroy();
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n\x1b[33m[Notice] Port ${PORT} is already in use by an active Zenve Vet Load Balancer instance.\x1b[0m`);
    console.log(`\x1b[32mThe load balancer is already running and accessible at http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[36mLive stats: http://localhost:${PORT}/lb-status\x1b[0m\n`);
    process.exit(0);
  }
  console.error('\x1b[31m[LB Server Error]\x1b[0m', err.message);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log('\n======================================================================');
  console.log(' ZENVE VET NATIVE LOAD BALANCER ACTIVE');
  console.log(` Listening on:        \x1b[32mhttp://localhost:${PORT}\x1b[0m`);
  console.log(` Cluster Nodes:       http://localhost:8080, :8081, :8082`);
  console.log(` Live Cluster Stats:  \x1b[36mhttp://localhost:${PORT}/lb-status\x1b[0m`);
  console.log(` Algorithm:           Least Connections + Automatic Failover`);
  console.log('======================================================================\n');
});
