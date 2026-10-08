@echo off
setlocal
cd /d "%~dp0" || exit /b 1
if exist "Desert-Strike.html" (
  start "" "%~dp0Desert-Strike.html"
) else if exist "dist\Desert-Strike.html" (
  start "" "%~dp0dist\Desert-Strike.html"
) else (
  echo Desert-Strike.html is missing. Extract the complete offline ZIP.
  echo From source, run node scripts\build.mjs before using Play.cmd.
  exit /b 1
)
exit /b 0
