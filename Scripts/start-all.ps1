Write-Host "Starting Soma..."

Start-Process powershell -ArgumentList "cd ../Apps/web; npm start"

Start-Process powershell -ArgumentList "cd ../Apps/api/soma-api; npm run start:dev"

Start-Process powershell -ArgumentList "cd ../Apps/ai; .\.venv\Scripts\Activate.ps1; uvicorn main:app --reload"

Write-Host ""
Write-Host "All services started."