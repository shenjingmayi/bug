@echo off
setlocal enabledelayedexpansion

title JetBrains IDE �����

:: ������ɫ
color 0A

echo ===================================================
echo             JetBrains IDE �����
echo      ����ѧϰ����ʹ��,�������غ�24Сʱ֮��ɾ��
echo ===================================================
echo.

:: ��ȡ��ǰĿ¼
set "CURRENT_DIR=%~dp0"
set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"
set "JAR_FILE=%CURRENT_DIR%\sniarbtej-2024.2.8.jar"

:: �����㣺����Ƿ��Ѿ��޲�������
if exist "%CURRENT_DIR%\key.txt" (
    echo ��⵽�����ѱ��޲����Ƿ������޲���
    choice /c YN /m "ѡ�� Y(��) �� N(��)��"
    if errorlevel 2 (
        echo �����޲����裬ֱ�ӽ��벽����...
        echo.
        goto step_four
    ) else (
        echo �����½����޲�...
        echo.
    )
) else (
    echo δ�޲��������޲�...
    echo.
)

:: ����һ�����Java����
echo ���ڼ��Java����...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ����: Java�汾�����ڣ���δΪ�����û���������
    echo �밲װJava�����û��������������д˽ű���
    echo.
    pause
    exit /b 1
)

:: �޸�Java�汾��ʾ����
for /f "tokens=* usebackq" %%a in (`java -version 2^>^&1 ^| findstr /i "version"`) do (
    set "JAVA_VERSION_LINE=%%a"
)
set "JAVA_VERSION=%JAVA_VERSION_LINE:*version =%"
set "JAVA_VERSION=%JAVA_VERSION:"=%"
echo ��⵽Java�汾: %JAVA_VERSION%
echo.

:: ����������ɼ�����Կ
:generate_key
echo ������License ID��User Name�����ɼ�����Կ
set /p "LICENSE_ID=License ID: "
set /p "USER_NAME=User Name: "

echo.
echo �����޲�����ing....
java -jar "%JAR_FILE%" -genkey -id=%LICENSE_ID% -user=%USER_NAME% > "%CURRENT_DIR%\key.txt"

:: ������������Ƿ�������key.txt�ļ�
if not exist "%CURRENT_DIR%\key.txt" (
    echo �޲�ʧ�ܣ�δ������key.txt�ļ���
    goto generate_key
)

:: ���key.txt�Ƿ�Ϊ��
for %%F in ("%CURRENT_DIR%\key.txt") do if %%~zF equ 0 (
    del "%CURRENT_DIR%\key.txt"
    echo �޲�ʧ�ܣ������������License ID��User Name��ֵ����������ţ���ɾȥ������ź��������롣
    goto generate_key
)

echo �����޲��ɹ���
echo.

:: �����ģ�����IDE�����ļ�
:step_four
:process_ide
echo ������IDE��ִ���ļ����ݷ�ʽ������·��
echo ����: D:\Program Files\JetBrains\IntelliJ IDEA\bin\idea64.exe
echo ����: D:\��ݷ�ʽ\IntelliJ IDEA.lnk
echo.
set /p "IDE_PATH=·��: "

:: ��������·�����ܴ��е�����
set "IDE_PATH=%IDE_PATH:"=%"

if not exist "%IDE_PATH%" (
    echo ����: �ļ������ڣ�����·�������ԡ�
    echo.
    goto process_ide
)

:: ����Ƿ��ǿ�ݷ�ʽ
set "ext=%IDE_PATH:~-4%"
set "TARGET_PATH=%IDE_PATH%"

if /i "%ext%"==".lnk" (
    echo ��⵽��ݷ�ʽ�����ڽ���...
    
    :: ������ʱVBS�ű���������ݷ�ʽ
    echo On Error Resume Next > "%temp%\resolvelnk.vbs"
    echo Set objShell = CreateObject("WScript.Shell") >> "%temp%\resolvelnk.vbs"
    echo Set objLink = objShell.CreateShortcut("%IDE_PATH%") >> "%temp%\resolvelnk.vbs"
    echo If Err.Number ^<^> 0 Then >> "%temp%\resolvelnk.vbs"
    echo   WScript.Echo "ERROR:" ^& Err.Description >> "%temp%\resolvelnk.vbs"
    echo   WScript.Quit >> "%temp%\resolvelnk.vbs"
    echo End If >> "%temp%\resolvelnk.vbs"
    echo WScript.Echo objLink.TargetPath >> "%temp%\resolvelnk.vbs"
    echo WScript.Echo objLink.WorkingDirectory >> "%temp%\resolvelnk.vbs"
    
    :: ����VBS�ű���������
    set "error="
    for /f "tokens=*" %%a in ('cscript //nologo "%temp%\resolvelnk.vbs" 2^>^&1') do (
        set "line=%%a"
        if "!line:~0,6!"=="ERROR:" (
            set "error=!line:~6!"
        ) else if not defined TARGET_PATH (
            set "TARGET_PATH=%%a"
        )
    )
    
    :: ɾ����ʱVBS�ű�
    del "%temp%\resolvelnk.vbs" > nul 2>&1
    
    if defined error (
        echo ����: !error!
        goto process_ide
    )
    
    echo ��ݷ�ʽָ��: "!TARGET_PATH!"
    echo.
)

:: ��ȡ�ļ�����Ŀ¼
for %%F in ("!TARGET_PATH!") do (
    set "FILE_NAME=%%~nxF"
    set "TARGET_DIR=%%~dpF"
)

:: ����Ƿ���֧�ֵ�JetBrains IDE
set "SUPPORTED=0"
set "VMOPTIONS_FILE="

for %%I in (clion64.exe datagrip64.exe dataspell64.exe goland64.exe idea64.exe phpstorm64.exe pycharm64.exe rider64.exe rubymine64.exe rustrover64.exe webstorm64.exe) do (
    if /i "!FILE_NAME!"=="%%I" (
        set "SUPPORTED=1"
        set "VMOPTIONS_FILE=!TARGET_DIR!%%I.vmoptions"
    )
)

if "!SUPPORTED!"=="0" (
    echo ����: ��֧�ֵ�JetBrains IDE����ȷ��ѡ�����JetBrains IDE�Ŀ�ִ���ļ���
    echo ֧�ֵ��ļ���: clion64.exe, datagrip64.exe, dataspell64.exe, goland64.exe, idea64.exe, 
    echo               phpstorm64.exe, pycharm64.exe, rider64.exe, rubymine64.exe, rustrover64.exe, webstorm64.exe
    echo.
    goto process_ide
)

:: ���vmoptions�ļ��Ƿ����
if not exist "!VMOPTIONS_FILE!" (
    echo ����: δ�ҵ�vmoptions�ļ�: !VMOPTIONS_FILE!
    echo ��ȷ��IDE����ȷ��װ��
    echo.
    goto process_ide
)

:: ����vmoptions�ļ�
if not exist "!VMOPTIONS_FILE!.bak" (
    copy "!VMOPTIONS_FILE!" "!VMOPTIONS_FILE!.bak" > nul
    echo �ѱ���ԭʼvmoptions�ļ�Ϊ: !VMOPTIONS_FILE!.bak
)

:: �����ļ��������µ�vmoptions�ļ�
echo ���������µ�vmoptions�ļ�...

:: ��ȡ�ļ�����������չ����
for %%F in ("!FILE_NAME!") do set "IDE_NAME=%%~nF"

:: ������ʱ�ļ�
set "TEMP_FILE=%TEMP%\vmoptions_temp.txt"

:: ����IDE����ѡ���Ӧ���������ݲ�д����ʱ�ļ�
if /i "!IDE_NAME!"=="clion64" (
    (
        echo -Xms256m
        echo -Xss2m
        echo -XX:NewSize=128m
        echo -XX:MaxNewSize=128m
        echo -Xmx2048m
        echo -XX:+HeapDumpOnOutOfMemoryError
        echo -XX:-OmitStackTraceInFastThrow
        echo -XX:+IgnoreUnrecognizedVMOptions
        echo -ea
        echo -Dsun.io.useCanonCaches=false
        echo -Dsun.java2d.metal=true
        echo -Djbr.catch.SIGABRT=true
        echo -Djdk.http.auth.tunneling.disabledSchemes=""
        echo -Djdk.attach.allowAttachSelf=true
        echo -Djdk.module.illegalAccess.silent=true
        echo -Dkotlinx.coroutines.debug=off
        echo -XX:CICompilerCount=2
        echo -XX:ReservedCodeCacheSize=512m
        echo -XX:+UnlockDiagnosticVMOptions
        echo -XX:TieredOldPercentage=100000
        echo -javaagent:!JAR_FILE!
    ) > "%TEMP_FILE%"
) else if /i "!IDE_NAME!"=="datagrip64" (
    (
        echo -Xms256m
        echo -Xmx750m
        echo -XX:+HeapDumpOnOutOfMemoryError
        echo -XX:-OmitStackTraceInFastThrow
        echo -XX:+IgnoreUnrecognizedVMOptions
        echo -ea
        echo -Dsun.io.useCanonCaches=false
        echo -Dsun.java2d.metal=true
        echo -Djbr.catch.SIGABRT=true
        echo -Djdk.http.auth.tunneling.disabledSchemes=""
        echo -Djdk.attach.allowAttachSelf=true
        echo -Djdk.module.illegalAccess.silent=true
        echo -Dkotlinx.coroutines.debug=off
        echo -XX:CICompilerCount=2
        echo -XX:ReservedCodeCacheSize=512m
        echo -XX:+UnlockDiagnosticVMOptions
        echo -XX:TieredOldPercentage=100000
        echo -javaagent:!JAR_FILE!
    ) > "%TEMP_FILE%"
) else if /i "!IDE_NAME!"=="dataspell64" (
    (
        echo -Xms256m
        echo -Xmx2048m
        echo -XX:+HeapDumpOnOutOfMemoryError
        echo -XX:-OmitStackTraceInFastThrow
        echo -XX:+IgnoreUnrecognizedVMOptions
        echo -ea
        echo -Dsun.io.useCanonCaches=false
        echo -Dsun.java2d.metal=true
        echo -Djbr.catch.SIGABRT=true
        echo -Djdk.http.auth.tunneling.disabledSchemes=""
        echo -Djdk.attach.allowAttachSelf=true
        echo -Djdk.module.illegalAccess.silent=true
        echo -Dkotlinx.coroutines.debug=off
        echo -XX:CICompilerCount=2
        echo -XX:ReservedCodeCacheSize=512m
        echo -XX:+UnlockDiagnosticVMOptions
        echo -XX:TieredOldPercentage=100000
        echo -javaagent:!JAR_FILE!
    ) > "%TEMP_FILE%"
) else if /i "!IDE_NAME!"=="rubymine64" (
    (
        echo -Xss2m
        echo -Xms128m
        echo -Xmx2048m
        echo -XX:+HeapDumpOnOutOfMemoryError
        echo -XX:-OmitStackTraceInFastThrow
        echo -XX:+IgnoreUnrecognizedVMOptions
        echo -ea
        echo -Dsun.io.useCanonCaches=false
        echo -Dsun.java2d.metal=true
        echo -Djbr.catch.SIGABRT=true
        echo -Djdk.http.auth.tunneling.disabledSchemes=""
        echo -Djdk.attach.allowAttachSelf=true
        echo -Djdk.module.illegalAccess.silent=true
        echo -Dkotlinx.coroutines.debug=off
        echo -XX:CICompilerCount=2
        echo -XX:ReservedCodeCacheSize=512m
        echo -XX:+UnlockDiagnosticVMOptions
        echo -XX:TieredOldPercentage=100000
        echo -javaagent:!JAR_FILE!
    ) > "%TEMP_FILE%"
) else (
    (
        echo -Xms128m
        echo -Xmx2048m
        echo -XX:+HeapDumpOnOutOfMemoryError
        echo -XX:-OmitStackTraceInFastThrow
        echo -XX:+IgnoreUnrecognizedVMOptions
        echo -ea
        echo -Dsun.io.useCanonCaches=false
        echo -Dsun.java2d.metal=true
        echo -Djbr.catch.SIGABRT=true
        echo -Djdk.http.auth.tunneling.disabledSchemes=""
        echo -Djdk.attach.allowAttachSelf=true
        echo -Djdk.module.illegalAccess.silent=true
        echo -Dkotlinx.coroutines.debug=off
        echo -XX:CICompilerCount=2
        echo -XX:ReservedCodeCacheSize=512m
        echo -XX:+UnlockDiagnosticVMOptions
        echo -XX:TieredOldPercentage=100000
        echo -javaagent:!JAR_FILE!
    ) > "%TEMP_FILE%"
)

:: ʹ��PowerShell��UTF-8���븴���ļ�
powershell -Command "Get-Content -Path '%TEMP_FILE%' -Encoding UTF8 | Set-Content -Path '!VMOPTIONS_FILE!' -Encoding UTF8"

:: ɾ����ʱ�ļ�
del "%TEMP_FILE%" > nul 2>&1

:: ����ļ��Ƿ�ɹ�����
if exist "!VMOPTIONS_FILE!" (
    echo ��������ɹ����뾡����ˣ�ɣ�
    echo ���޸������ļ�: !VMOPTIONS_FILE!
) else (
    echo ����: �޷�����vmoptions�ļ���
    echo ��ȷ�������㹻��Ȩ�ޡ�
)

echo.
echo �Ƿ������������IDE��
choice /c YN /m "ѡ�� Y(��) �� N(��)"
if errorlevel 2 goto end
if errorlevel 1 goto process_ide

:end
echo.
echo ��лʹ��JetBrains IDE����ߣ�
echo �����ˣ�sjmy
echo ����ѧϰ����ʹ��,�������غ�24Сʱ֮��ɾ��
echo Github��ҳhttps://github.com/shenjingmayi
echo ����Ŀ��ַ��https://github.com/shenjingmayi/bug/jetbraincrack
echo ===================================================
pause
exit /b 0