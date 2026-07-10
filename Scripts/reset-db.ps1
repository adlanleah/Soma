Set-Location ../Apps/api/soma-api

Write-Host "Resetting database..."

npx prisma migrate reset

Write-Host ""

Write-Host "Database reset complete."