$ErrorActionPreference = "Stop"

Write-Host "--- Starting Build Process ---" -ForegroundColor Green

$ScriptPath = $PSScriptRoot
$RootPath = $ScriptPath
$FrontendPath = Join-Path $RootPath "Frontend"
$BackendPath = Join-Path $RootPath "Backend\src\AplikacjaVisualData.Backend"
$ElectronPath = Join-Path $RootPath "Electron"
$BuildResourcesPath = Join-Path $ElectronPath "build_resources"

# 1. CLEANUP
Write-Host "1. Cleaning up..." -ForegroundColor Yellow
if (Test-Path "$ElectronPath\dist") { Remove-Item "$ElectronPath\dist" -Recurse -Force }
if (Test-Path "$ElectronPath\release") { Remove-Item "$ElectronPath\release" -Recurse -Force }
if (Test-Path "$ElectronPath\release-packager") { Remove-Item "$ElectronPath\release-packager" -Recurse -Force }
if (Test-Path $BuildResourcesPath) { Remove-Item $BuildResourcesPath -Recurse -Force }

New-Item -ItemType Directory -Force -Path "$BuildResourcesPath\backend" | Out-Null
New-Item -ItemType Directory -Force -Path "$ElectronPath\dist\frontend" | Out-Null

# 2. BUILD FRONTEND
Write-Host "2. Building Frontend..." -ForegroundColor Yellow
Push-Location $FrontendPath
# Ensure we have dependencies
if (-not (Test-Path "node_modules")) { npm install }
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed" }
Pop-Location

# Copy Frontend to Electron/dist/frontend
Write-Host "   Copying Frontend to Electron..."
Copy-Item "$FrontendPath\dist\*" "$ElectronPath\dist\frontend" -Recurse -Force

# 3. PUBLISH BACKEND
Write-Host "3. Publishing Backend..." -ForegroundColor Yellow
Push-Location $BackendPath
# Publish as self-contained executable for Windows x64
dotnet publish -c Release -r win-x64 --self-contained true -o "$BuildResourcesPath\backend"
if ($LASTEXITCODE -ne 0) { Write-Error "Backend publish failed" }
Pop-Location

# 4. PACKAGE ELECTRON (WITH BUILDER)
Write-Host "4. Packaging Electron..." -ForegroundColor Yellow
Push-Location $ElectronPath
if (-not (Test-Path "node_modules")) { npm install }

# Compile TypeScript
npm run build 
if ($LASTEXITCODE -ne 0) { Write-Error "Electron TSC build failed" }

# Build Installer (triggers electron-packager)
Write-Host "   Running electron-packager..."
npx electron-packager . --platform=win32 --arch=x64 --out=dist-packager --overwrite --extra-resource="build_resources/backend"
if ($LASTEXITCODE -ne 0) { Write-Error "Electron packaging failed" }

Pop-Location

Write-Host "--- Build Complete! ---" -ForegroundColor Green
Write-Host "Executable Installer is at: $ElectronPath\release"

