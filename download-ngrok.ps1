# Script para baixar o ngrok oficial para Windows
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BAIXANDO NGROK OFICIAL PARA WINDOWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$downloadPath = "$env:TEMP\ngrok.zip"
$extractPath = "$env:TEMP\ngrok"
$finalPath = "$PSScriptRoot\ngrok.exe"

Write-Host "Baixando ngrok..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $ngrokUrl -OutFile $downloadPath -UseBasicParsing
    
    Write-Host "Extraindo..." -ForegroundColor Yellow
    if (Test-Path $extractPath) {
        Remove-Item $extractPath -Recurse -Force
    }
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    
    Write-Host "Copiando para pasta do projeto..." -ForegroundColor Yellow
    Copy-Item "$extractPath\ngrok.exe" -Destination $finalPath -Force
    
    Write-Host ""
    Write-Host "✅ ngrok instalado com sucesso em:" -ForegroundColor Green
    Write-Host "   $finalPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Agora você pode executar:" -ForegroundColor Yellow
    Write-Host "   .\ngrok.exe http 8000" -ForegroundColor White
    Write-Host ""
    
    # Limpar arquivos temporários
    Remove-Item $downloadPath -ErrorAction SilentlyContinue
    Remove-Item $extractPath -Recurse -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao baixar ngrok:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Você pode baixar manualmente:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://ngrok.com/download" -ForegroundColor Cyan
    Write-Host "2. Baixe a versão Windows" -ForegroundColor Cyan
    Write-Host "3. Extraia ngrok.exe na pasta do projeto" -ForegroundColor Cyan
}


