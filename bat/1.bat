@echo off
chcp 936 >nul

:: NOTE: To avoid opening a new elevated window, please run this script
:: from an Administrator shell if you need elevated permissions.
:: Example: Right-click PowerShell -> Run as Administrator, then run this script.

setlocal EnableDelayedExpansion

set "ROOT=%~1"
if "%ROOT%"=="" (
  set /p "ROOT=Enter root folder path: "
)

echo You entered: %ROOT%
pause
:: 规范并验证路径，支持 D:/ 或使用正斜杠的输入
pushd "%ROOT%" >nul 2>&1
if errorlevel 1 (
  echo Specified folder does not exist: %ROOT%
  pause
  exit /b 1
)
set "ROOT=%CD%"
popd >nul

set "MAXDEPTH=5"
set "BACKUP=1"
if /I "%~2"=="nobackup" set "BACKUP=0"

echo Processing: %ROOT%
call :ProcessFolder "%ROOT%" 1
echo Done.
pause
exit /b

:ProcessFolder
set "FOLDER=%~1"
set "DEP=%~2"
if %DEP% GTR %MAXDEPTH% goto :eof

echo Processing folder: %FOLDER% (depth %DEP%)

if exist "%FOLDER%\desktop.ini" (
  call :ProcessFile "%FOLDER%\desktop.ini" "%FOLDER%"
)

for /D %%D in ("%FOLDER%\*") do (
  set /a NEXTDEP=%DEP%+1
  call :ProcessFolder "%%~fD" !NEXTDEP!
)
goto :eof

:ProcessFile
set "FILE=%~1"
set "FOLDER=%~2"
echo Found file: %FILE%

if "%BACKUP%"=="1" (
  copy /Y "%FILE%" "%FILE%.bak" >nul 2>&1
  if %errorlevel% EQU 0 (
    echo Backup succeeded: %FILE%.bak
  ) else (
    echo Backup failed: %FILE%.bak
  )
) else (
  echo Skipping backup
)

:: 使用 PowerShell 以 ANSI (Default) 编码读取与写入，并替换 IconResource 中的当前文件夹前缀
$for /f "usebackq tokens=1* delims=:" %%A in (`powershell -NoProfile -Command ^
[Console]::OutputEncoding=[Text.Encoding]::GetEncoding(936); ^
$path='%FILE%';$folder='%FOLDER%';$lines=Get-Content -LiteralPath $path -Encoding Default; $changed=$false; ^
for($i=0;$i -lt $lines.Length;$i++){ if($lines[$i] -match '^IconResource=(.*)$'){ $val=$matches[1]; Write-Output ('FOUND_ICON:' + $val); $nf1=($folder.TrimEnd('\','/') + '\'); $nf2=($folder.TrimEnd('\','/') + '/'); $newval=[regex]::Replace($val,[regex]::Escape($nf1),''); $newval=[regex]::Replace($newval,[regex]::Escape($nf2),''); $lines[$i]='IconResource=' + $newval; $changed=$true }}; if($changed){ Set-Content -LiteralPath $path -Encoding Default -Value $lines; Write-Output 'MODIFIED:True' } else { Write-Output 'NOTFOUND' }`) do (
  if "%%A"=="FOUND_ICON" echo Found icon config: %%B
  if "%%A"=="MODIFIED" echo Modified and saved
  if "%%A"=="NOTFOUND" echo Icon config not found in file
)

goto :eof
