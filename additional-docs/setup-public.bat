@echo off
REM SMM Panel - Public Deployment Setup for Windows
REM This batch script helps you quickly set up SMM Panel for public access

echo.
echo ===============================================================
echo    SMM Panel - Public Deployment Setup
echo ===============================================================
echo.

setlocal enabledelayedexpansion

set /p DOMAIN="Enter your domain name (e.g., yourdomain.com): "

if "%DOMAIN%"=="" (
    echo Domain cannot be empty!
    exit /b 1
)

set API_DOMAIN=api.%DOMAIN%

echo.
echo Domain set to: %DOMAIN%
echo API endpoint: %API_DOMAIN%
echo.

echo Creating production .env files...

REM Create backend .env
(
echo # Production Configuration
echo MONGODB_URI=mongodb+srv://mahi24bcon1954_db_user:smmpannel.2204@smm.tcklhvn.mongodb.net/
echo PORT=5000
echo NODE_ENV=production
echo SERVER_URL=https://%API_DOMAIN%
echo FRONTEND_URL=https://%DOMAIN%
echo.
echo # JWT Secret - Change this!
echo JWT_SECRET=your_strong_random_key_here_at_least_32_characters
echo JWT_EXPIRE=7d
echo.
echo # Redis
echo REDIS_URL=redis://localhost:6379
echo.
echo # CORS
echo ALLOWED_ORIGINS=https://%DOMAIN%,https://www.%DOMAIN%
echo.
echo # SSL Paths
echo SSL_CERT_PATH=/etc/letsencrypt/live/%DOMAIN%/fullchain.pem
echo SSL_KEY_PATH=/etc/letsencrypt/live/%DOMAIN%/privkey.pem
) > backend\.env

echo Created: backend\.env

REM Create frontend .env.production
(
echo NEXT_PUBLIC_API_URL=https://%API_DOMAIN%
echo NEXT_PUBLIC_APP_URL=https://%DOMAIN%
echo NEXT_PUBLIC_ENV=production
) > frontend\.env.production

echo Created: frontend\.env.production

echo.
echo ===============================================================
echo Setup Complete!
echo ===============================================================
echo.
echo Next Steps:
echo.
echo 1. Update MongoDB URI in backend\.env
echo    MONGODB_URI=mongodb+srv://mahi24bcon1954_db_user:smmpannel.2204@smm.tcklhvn.mongodb.net/smm_panp
echo.
echo 2. Update Redis URL if not local
echo    REDIS_URL=redis://:password@server.com:6379
echo.
echo 3. Read the full deployment guide:
echo    docs\PUBLIC_DEPLOYMENT.md
echo.
echo 4. Deploy backend:
echo    cd backend
echo    npm install
echo    npm start
echo.
echo 5. Deploy frontend (in new terminal):
echo    cd frontend
echo    npm install
echo    npm run build
echo    npm start
echo.
echo 6. Point your domain DNS to your server IP
echo.
echo Configuration files ready in:
echo   Backend:  backend\.env
echo   Frontend: frontend\.env.production
echo.
