$ErrorActionPreference = "Stop"

Write-Host "Starting Backend..." -ForegroundColor Green
Start-Process -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory "..\Backend\src\AplikacjaVisualData.Backend" -NoNewWindow
Start-Sleep -Seconds 5

Write-Host "Starting Frontend (Vite)..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "..\Frontend" -PassThru -NoNewWindow
Start-Sleep -Seconds 5

Write-Host "Starting Electron..." -ForegroundColor Green
Set-Location "..\Electron"
npm start
