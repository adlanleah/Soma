Write-Host ""
Write-Host "================================="
Write-Host "Setting up NestJS Backend..."
Write-Host "================================="
Write-Host ""

Set-Location ../Apps/api/soma-api

Write-Host "Installing npm packages..."
npm install

Write-Host ""

Write-Host "Generating Prisma Client..."
npx prisma generate

Write-Host ""

Write-Host "Backend setup complete!"