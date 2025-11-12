@echo off
echo ====================================
echo   SERVER GESTIONE ORE DIPENDENTI
echo ====================================
echo.
echo Avvio del server...
echo.

cd /d "%~dp0"

echo Il server sara' disponibile su:
echo http://localhost:8080
echo.
echo Per condividere con i telefoni sulla stessa WiFi:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    echo http://%%a:8080
)
echo.
echo Premi CTRL+C per fermare il server
echo.

python -m http.server 8080 2>nul || (
    echo Python non trovato. Provo con PHP...
    php -S 0.0.0.0:8080 2>nul || (
        echo.
        echo ERRORE: Nessun server trovato!
        echo.
        echo Installa Python da: https://www.python.org/downloads/
        echo Oppure usa l'estensione "Live Server" in VS Code
        pause
    )
)
