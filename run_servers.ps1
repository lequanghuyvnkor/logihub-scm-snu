# LogiHub local server launcher
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       Starting LogiHub local servers...          " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Start the FastAPI backend
Write-Host "[1/3] Starting FastAPI Backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Write-Host 'Starting LogiHub Backend...' -ForegroundColor Green; cd 'c:\Users\PC\Downloads\LogiHub_Project_Archive\logihub_application_code\backend'; python main.py"

# 2. Start the Next.js frontend
Write-Host "[2/3] Starting Next.js Frontend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Write-Host 'Starting LogiHub Frontend...' -ForegroundColor Green; cd 'c:\Users\PC\Downloads\LogiHub_Project_Archive\logihub_application_code\frontend'; npm.cmd run dev"

# 3. Wait and open the browser
Write-Host "[3/3] Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Opening LogiHub in your browser: http://localhost:3000" -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Servers are running! Keep the opened terminal" -ForegroundColor Yellow
Write-Host "windows active to keep the servers running." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
