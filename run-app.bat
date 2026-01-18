@echo off
echo Starting App-Project...

:: Start Backend
start "Backend" /D "Backend\src\AplikacjaVisualData.Backend" dotnet run

:: Start Frontend
start "Frontend" /D "Frontend" npm run dev

:: Wait for servers to warm up
timeout /t 5 >nul

:: Start Electron
cd Electron
npm start
