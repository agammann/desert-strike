@echo off
cd /d "%~dp0"
if exist "Desert-Strike.html" (
  start "" "Desert-Strike.html"
) else if exist "dist\Desert-Strike.html" (
  start "" "dist\Desert-Strike.html"
) else (
  start "" "index.html"
)
