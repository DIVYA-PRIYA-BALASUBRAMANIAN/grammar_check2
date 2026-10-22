@echo off
title Zenve Vet Backend - Node 3 (:8082)
echo ==============================================================================
echo  Starting Zenve Vet Spring Boot Backend Node 3 on Port 8082
echo ==============================================================================
cd /d "%~dp0..\server"
call .\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=8082"
pause
