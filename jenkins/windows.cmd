@setlocal
@echo off

set buildroot=%~dp0..
rem // resolve to fully qualified path
for %%i in ("%buildroot%") do set buildroot=%%~fi

cd %buildroot%

call npm install
if errorlevel 1 goto :end

call node iothub-diagnostics.js %IOTHUB_CONNECTION_STRING%

:end
exit /b %errorlevel%