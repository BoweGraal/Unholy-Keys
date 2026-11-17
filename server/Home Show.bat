@echo off
rem Double-click to host a show from this computer. Keep the window open during the show.
cd /d "%~dp0"
if not exist node_modules (
  echo Installing the server for the first time...
  call npm install
)
node home-show.js
pause
