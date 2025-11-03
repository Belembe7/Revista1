@echo off
chcp 65001 >nul
echo ========================================
echo    EXPOE BACKEND NA INTERNET COM NGROK
echo ========================================
echo.

REM Verificar se ngrok.exe existe na pasta atual
if exist "ngrok.exe" (
    echo Usando ngrok.exe local...
    echo.
    echo Aguarde enquanto o ngrok inicia...
    echo Após iniciar, você verá a URL pública!
    echo.
    echo Pressione Ctrl+C para parar
    echo.
    ngrok.exe http 8000
    goto :end
)

REM Tentar usar npx
echo Tentando usar ngrok via npx...
echo.
npx --yes ngrok@latest http 8000
goto :end

:end
pause
