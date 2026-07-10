Write-Host ""
Write-Host "================================="
Write-Host "Setting up AI Service..."
Write-Host "================================="
Write-Host ""

Set-Location ../Apps/ai

Write-Host "Creating virtual environment..."

python -m venv .venv

Write-Host "Activating virtual environment..."

& .\.venv\Scripts\Activate.ps1

Write-Host ""

Write-Host "Upgrading pip..."

python -m pip install --upgrade pip

Write-Host ""

if (Test-Path requirements.txt) {

    Write-Host "Installing requirements..."

    pip install -r requirements.txt

}
else {

    Write-Host "requirements.txt not found."

}

Write-Host ""

Write-Host "AI setup complete!"