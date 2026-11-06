Set-Location ../Apps/api/soma-api

Write-Host "Generating Prisma Client..."

npx prisma generate

Write-Host ""

Write-Host "Running migrations..."

npx prisma migrate dev

Write-Host ""

Write-Host "Done."