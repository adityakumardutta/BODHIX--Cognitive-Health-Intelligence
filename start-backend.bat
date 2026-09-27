@echo off
REM BODHIX — start the Spring Boot backend for LOCAL development.
REM Run this from anywhere; it always starts the backend that sits next to this file.
REM
REM Configuration lives in backend\.env (gitignored): application.properties imports it
REM automatically via spring.config.import=optional:file:.env[.properties], so the
REM DB_* / JWT_SECRET / CORS variables no longer need to be set here.
REM The port must match the Vite dev-server fallback (http://localhost:8081/api).

SET JAVA_HOME=C:\Users\ADITYA\.jdks\ms-17.0.20
SET MVN_HOME=C:\Users\ADITYA\maven\apache-maven-3.9.6
SET PATH=%JAVA_HOME%\bin;%MVN_HOME%\bin;%PATH%
SET PORT=8081

echo.
echo =========================================
echo   BODHIX Backend Starting...
echo   Java:   %JAVA_HOME%
echo   Maven:  %MVN_HOME%
echo   Config: backend\.env  (local MySQL)
echo   Port:   %PORT%
echo =========================================
echo.

cd /d "%~dp0backend"
mvn spring-boot:run
