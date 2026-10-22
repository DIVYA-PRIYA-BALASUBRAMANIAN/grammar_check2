@echo off
title Zenve Vet Backend - Node 2 (:8081)
echo ==============================================================================
echo  Starting Zenve Vet Spring Boot Backend Node 2 on Port 8081
echo ==============================================================================
cd /d "%~dp0..\server"
call .\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
pause
