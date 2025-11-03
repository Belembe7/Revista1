@echo off
echo ========================================
echo    EXPOE BACKEND NA INTERNET COM NGROK
echo ========================================
echo.
echo Aguarde enquanto o ngrok inicia...
echo A URL publica sera mostrada abaixo:
echo.
cd /d %~dp0
ngrok http 8000
pause


