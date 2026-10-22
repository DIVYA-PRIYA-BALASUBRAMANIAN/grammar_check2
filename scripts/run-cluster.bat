@echo off
REM ==============================================================================
REM Zenve Vet - One-Click Production Load Balanced Cluster Launcher (300k Scale)
REM ==============================================================================

echo [Zenve Vet] Checking Docker environment...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo To run locally without Docker, launch multiple Spring Boot instances using:
    echo   Terminal 1: mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=8080"
    echo   Terminal 2: mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
    echo   Terminal 3: mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=8082"
    pause
    exit /b 1
)

echo [Zenve Vet] Building React frontend static bundle...
cd ..\client
call npm run build
cd ..

echo [Zenve Vet] Starting 3x Spring Boot Cluster + Nginx Load Balancer + Redis + MySQL...
docker-compose up --build -d

echo.
echo ==============================================================================
echo [SUCCESS] Zenve Vet High-Scale Cluster is now running!
echo  - Nginx Load Balancer: http://localhost:80
echo  - Backend Nodes: Clustered (backend-1, backend-2, backend-3)
echo  - Redis Distributed Cache: localhost:6379
echo  - MySQL Scaled Instance: localhost:3306
echo ==============================================================================
echo.
pause
