@echo off
REM Kongu Event Management System - Windows Setup Script

echo 🎓 Kongu College Event Management System - Setup
echo =================================================

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
) else (
    echo [SUCCESS] Node.js found
)

REM Check if npm is installed
echo [INFO] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
) else (
    echo [SUCCESS] npm found
)

echo.
echo [INFO] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Backend dependencies installed

echo.
echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend dependencies installed

echo.
echo [INFO] Setting up environment files...

REM Setup backend environment
cd backend
if not exist .env (
    copy .env.example .env >nul 2>&1
    if %errorlevel% neq 0 (
        echo NODE_ENV=development> .env
        echo PORT=5000>> .env
        echo MONGODB_URI=mongodb://localhost:27017/kongu-event-management>> .env
        echo JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_complex>> .env
        echo FRONTEND_URL=http://localhost:3000>> .env
        echo CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name>> .env
        echo CLOUDINARY_API_KEY=your_cloudinary_api_key>> .env
        echo CLOUDINARY_API_SECRET=your_cloudinary_api_secret>> .env
        echo ADMIN_EMAIL=admin@kongu.edu>> .env
        echo ADMIN_PASSWORD=admin123456>> .env
    )
    echo [SUCCESS] Created backend .env file
) else (
    echo [INFO] Backend .env file already exists
)
cd ..

REM Setup frontend environment
cd frontend
if not exist .env (
    echo VITE_API_BASE_URL=http://localhost:5000/api> .env
    echo VITE_SOCKET_URL=http://localhost:5000>> .env
    echo [SUCCESS] Created frontend .env file
) else (
    echo [INFO] Frontend .env file already exists
)
cd ..

echo.
echo [INFO] Default Admin Account Information:
echo   Email: admin@kongu.edu
echo   Password: admin123456
echo [WARNING] Please change these credentials after first login!

echo.
echo 🚀 Setup Complete! Next Steps:
echo ==============================
echo [INFO] 1. Update environment variables:
echo    - Backend: backend\.env
echo    - Frontend: frontend\.env
echo.
echo [INFO] 2. Configure Cloudinary (for image uploads):
echo    - Sign up at https://cloudinary.com
echo    - Add credentials to backend\.env
echo.
echo [INFO] 3. Start the development servers:
echo    Backend:  cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm run dev
echo.
echo [INFO] 4. Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:5000
echo    - Admin Panel: http://localhost:3000/admin
echo.
echo [SUCCESS] Setup completed successfully! 🎉

pause
