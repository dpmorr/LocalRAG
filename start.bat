@echo off
REM AI Career Mentor - Windows Startup Script

echo.
echo ================================
echo  AI Career Mentor - Starting
echo ================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.simple .env
    echo Created .env file
    echo.
)

REM Determine profile (default to cpu)
set PROFILE=%1
if "%PROFILE%"=="" set PROFILE=cpu

if not "%PROFILE%"=="cpu" if not "%PROFILE%"=="gpu" if not "%PROFILE%"=="full" (
    echo Invalid profile: %PROFILE%
    echo Usage: start.bat [cpu^|gpu^|full]
    echo   cpu  - CPU-only mode no GPU required
    echo   gpu  - GPU mode requires NVIDIA GPU
    echo   full - Full stack with observability
    exit /b 1
)

echo Starting services with profile: %PROFILE%
echo.
echo This may take 5-10 minutes on first run downloading models...
echo.

REM Start Docker Compose
docker-compose -f docker-compose.simple.yml --profile %PROFILE% up -d

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak > nul

echo.
echo ================================
echo  Services Started!
echo ================================
echo.
echo Access the application:
echo   Frontend:  http://localhost:3000
echo   API Docs:  http://localhost:8080/docs
echo   Health:    http://localhost:8080/health
echo.

if "%PROFILE%"=="full" (
    echo Observability:
    echo   Jaeger:    http://localhost:16686
    echo   Grafana:   http://localhost:3001 admin/admin
    echo   Prometheus: http://localhost:9090
    echo.
)

echo Tips:
echo   - View logs: docker-compose -f docker-compose.simple.yml logs -f
echo   - Stop: docker-compose -f docker-compose.simple.yml down
echo.
echo Happy mentoring! 🚀
echo.
pause
