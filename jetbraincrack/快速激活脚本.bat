@echo off
setlocal enabledelayedexpansion

title JetBrains IDE 激活工具

:: 设置颜色
color 0A

echo ===================================================
echo             JetBrains IDE 激活工具
echo      仅供学习交流使用,请在下载后24小时之内删除
echo ===================================================
echo.

:: 获取当前目录
set "CURRENT_DIR=%~dp0"
set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"
set "JAR_FILE=%CURRENT_DIR%\sniarbtej-2024.2.8.jar"

:: 步骤零：检查是否已经修补过环境
if exist "%CURRENT_DIR%\key.txt" (
    echo 检测到环境已被修补，是否重新修补？
    choice /c YN /m "选择 Y(是) 或 N(否)："
    if errorlevel 2 (
        echo 跳过修补步骤，直接进入步骤四...
        echo.
        goto step_four
    ) else (
        echo 将重新进行修补...
        echo.
    )
) else (
    echo 未修补，即将修补...
    echo.
)

:: 步骤一：检查Java环境
echo 正在检查Java环境...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Java版本不存在，或未为其配置环境变量。
    echo 请安装Java并配置环境变量后再运行此脚本。
    echo.
    pause
    exit /b 1
)

:: 修复Java版本显示问题
for /f "tokens=* usebackq" %%a in (`java -version 2^>^&1 ^| findstr /i "version"`) do (
    set "JAVA_VERSION_LINE=%%a"
)
set "JAVA_VERSION=%JAVA_VERSION_LINE:*version =%"
set "JAVA_VERSION=%JAVA_VERSION:"=%"
echo 检测到Java版本: %JAVA_VERSION%
echo.

:: 步骤二：生成激活密钥
:generate_key
echo 请输入License ID和User Name以生成激活密钥
set /p "LICENSE_ID=License ID: "
set /p "USER_NAME=User Name: "

echo.
echo 正在修补补丁ing....
java -jar "%JAR_FILE%" -genkey -id=%LICENSE_ID% -user=%USER_NAME% > "%CURRENT_DIR%\key.txt"

:: 步骤三：检查是否生成了key.txt文件
if not exist "%CURRENT_DIR%\key.txt" (
    echo 修补失败，未能生成key.txt文件。
    goto generate_key
)

:: 检查key.txt是否为空
for %%F in ("%CURRENT_DIR%\key.txt") do if %%~zF equ 0 (
    del "%CURRENT_DIR%\key.txt"
    echo 修补失败，可能是输入的License ID和User Name的值存在特殊符号，请删去特殊符号后重新输入。
    goto generate_key
)

echo 补丁修补成功！
echo.

:: 步骤四：处理IDE配置文件
:step_four
:process_ide
echo 请输入IDE可执行文件或快捷方式的完整路径
echo 例如: D:\Program Files\JetBrains\IntelliJ IDEA\bin\idea64.exe
echo 或者: D:\快捷方式\IntelliJ IDEA.lnk
echo.
set /p "IDE_PATH=路径: "

:: 处理输入路径可能带有的引号
set "IDE_PATH=%IDE_PATH:"=%"

if not exist "%IDE_PATH%" (
    echo 错误: 文件不存在，请检查路径并重试。
    echo.
    goto process_ide
)

:: 检查是否是快捷方式
set "ext=%IDE_PATH:~-4%"
set "TARGET_PATH=%IDE_PATH%"

if /i "%ext%"==".lnk" (
    echo 检测到快捷方式，正在解析...
    
    :: 创建临时VBS脚本来解析快捷方式
    echo On Error Resume Next > "%temp%\resolvelnk.vbs"
    echo Set objShell = CreateObject("WScript.Shell") >> "%temp%\resolvelnk.vbs"
    echo Set objLink = objShell.CreateShortcut("%IDE_PATH%") >> "%temp%\resolvelnk.vbs"
    echo If Err.Number ^<^> 0 Then >> "%temp%\resolvelnk.vbs"
    echo   WScript.Echo "ERROR:" ^& Err.Description >> "%temp%\resolvelnk.vbs"
    echo   WScript.Quit >> "%temp%\resolvelnk.vbs"
    echo End If >> "%temp%\resolvelnk.vbs"
    echo WScript.Echo objLink.TargetPath >> "%temp%\resolvelnk.vbs"
    echo WScript.Echo objLink.WorkingDirectory >> "%temp%\resolvelnk.vbs"
    
    :: 运行VBS脚本并捕获结果
    set "error="
    for /f "tokens=*" %%a in ('cscript //nologo "%temp%\resolvelnk.vbs" 2^>^&1') do (
        set "line=%%a"
        if "!line:~0,6!"=="ERROR:" (
            set "error=!line:~6!"
        ) else if not defined TARGET_PATH (
            set "TARGET_PATH=%%a"
        )
    )
    
    :: 删除临时VBS脚本
    del "%temp%\resolvelnk.vbs" > nul 2>&1
    
    if defined error (
        echo 错误: !error!
        goto process_ide
    )
    
    echo 快捷方式指向: "!TARGET_PATH!"
    echo.
)

:: 提取文件名和目录
for %%F in ("!TARGET_PATH!") do (
    set "FILE_NAME=%%~nxF"
    set "TARGET_DIR=%%~dpF"
)

:: 检查是否是支持的JetBrains IDE
set "SUPPORTED=0"
set "VMOPTIONS_FILE="

for %%I in (clion64.exe datagrip64.exe dataspell64.exe goland64.exe idea64.exe phpstorm64.exe pycharm64.exe rider64.exe rubymine64.exe rustrover64.exe webstorm64.exe) do (
    if /i "!FILE_NAME!"=="%%I" (
        set "SUPPORTED=1"
        set "VMOPTIONS_FILE=!TARGET_DIR!%%I.vmoptions"
    )
)

if "!SUPPORTED!"=="0" (
    echo 错误: 不支持的JetBrains IDE。请确保选择的是JetBrains IDE的可执行文件。
    echo 支持的文件名: clion64.exe, datagrip64.exe, dataspell64.exe, goland64.exe, idea64.exe, 
    echo               phpstorm64.exe, pycharm64.exe, rider64.exe, rubymine64.exe, rustrover64.exe, webstorm64.exe
    echo.
    goto process_ide
)

:: 检查vmoptions文件是否存在
if not exist "!VMOPTIONS_FILE!" (
    echo 错误: 未找到vmoptions文件: !VMOPTIONS_FILE!
    echo 请确保IDE已正确安装。
    echo.
    goto process_ide
)

:: 备份vmoptions文件
if not exist "!VMOPTIONS_FILE!.bak" (
    copy "!VMOPTIONS_FILE!" "!VMOPTIONS_FILE!.bak" > nul
    echo 已备份原始vmoptions文件为: !VMOPTIONS_FILE!.bak
)

:: 根据文件名生成新的vmoptions文件
echo 正在生成新的vmoptions文件...

:: 提取文件名（不含扩展名）
for %%F in ("!FILE_NAME!") do set "IDE_NAME=%%~nF"

:: 创建临时文件
set "TEMP_FILE=%TEMP%\vmoptions_temp.txt"

:: 根据IDE名称选择对应的配置内容并写入临时文件
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

:: 使用PowerShell以UTF-8编码复制文件
powershell -Command "Get-Content -Path '%TEMP_FILE%' -Encoding UTF8 | Set-Content -Path '!VMOPTIONS_FILE!' -Encoding UTF8"

:: 删除临时文件
del "%TEMP_FILE%" > nul 2>&1

:: 检查文件是否成功创建
if exist "!VMOPTIONS_FILE!" (
    echo 补丁打入成功，请尽情玩耍吧！
    echo 已修改配置文件: !VMOPTIONS_FILE!
) else (
    echo 错误: 无法创建vmoptions文件。
    echo 请确保您有足够的权限。
)

echo.
echo 是否继续处理其他IDE？
choice /c YN /m "选择 Y(是) 或 N(否)"
if errorlevel 2 goto end
if errorlevel 1 goto process_ide

:end
echo.
echo 感谢使用JetBrains IDE激活工具！
echo 制作人：sjmy
echo 仅供学习交流使用,请在下载后24小时之内删除
echo Github主页https://github.com/shenjingmayi
echo 该项目地址：https://github.com/shenjingmayi/bug/jetbraincrack
echo ===================================================
pause
exit /b 0