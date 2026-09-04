@echo off
REM DementiaScreen Backend Startup Script
REM Run this from anywhere to start the Spring Boot backend

SET JAVA_HOME=C:\Users\ADITYA\.jdks\ms-17.0.20
SET MVN_HOME=C:\Users\ADITYA\maven\apache-maven-3.9.6
SET PATH=%JAVA_HOME%\bin;%MVN_HOME%\bin;%PATH%

SET DB_HOST=localhost
SET DB_PORT=3306
SET DB_NAME=dementia_screen
SET DB_USER=root
SET DB_PASSWORD=Root@123
SET JWT_SECRET=DementiaScreenSecretKey2024_MinimumThirtyTwoCharsRequired!
SET JWT_EXPIRATION_MS=28800000
SET CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
SET SERVER_PORT=8080

echo.
echo =========================================
echo   DementiaScreen Backend Starting...
echo   Java:  %JAVA_HOME%
echo   Maven: %MVN_HOME%
echo   DB:    %DB_HOST%:%DB_PORT%/%DB_NAME%
echo   Port:  %SERVER_PORT%
echo =========================================
echo.

cd /d "C:\Users\ADITYA\Downloads\dementia-screen\dementia-screen\backend"
mvn spring-boot:run
