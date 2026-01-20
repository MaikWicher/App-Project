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

# 4. PACKAGE ELECTRON
Write-Host "4. Packaging Electron..." -ForegroundColor Yellow
Push-Location $ElectronPath
if (-not (Test-Path "node_modules")) { npm install }

# Compile TypeScript
npm run build 
if ($LASTEXITCODE -ne 0) { Write-Error "Electron TSC build failed" }

# Package with electron-packager
# Ignoring source files to keep package clean (optional but good practice)
$IgnorePattern = "^/(src|tsconfig\.json|build\.log|build_debug\.log|.*\.map)$"

# Run packager
npx electron-packager . "VisualData App" --platform=win32 --arch=x64 --out=release-packager --overwrite --ignore=$IgnorePattern
if ($LASTEXITCODE -ne 0) { Write-Error "Electron packaging failed" }

# 5. COPY BACKEND RESOURCES
Write-Host "5. Copying Backend to resources..." -ForegroundColor Yellow
$PackagedAppPath = "$ElectronPath\release-packager\VisualData App-win32-x64"
$ResourcesPath = "$PackagedAppPath\resources\backend"

New-Item -ItemType Directory -Force -Path $ResourcesPath | Out-Null
Copy-Item "$BuildResourcesPath\backend\*" $ResourcesPath -Recurse -Force

Pop-Location

Write-Host "--- Build Complete! ---" -ForegroundColor Green
Write-Host "Executable is at: $PackagedAppPath\VisualData App.exe"

