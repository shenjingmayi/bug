# 导入 BurntToast 模块（如未安装则自动安装）
Import-Module BurntToast

# 设置变量
$mainProcess = "Listary"
$serviceProcess = "Listary.Service"
$appPath = "D:\Tools\LittleTools\Listary\Listary.exe"
$imgPath = "D:\Tools\LittleTools\Listary\Listary.ico"
$appName = "Listary"

# 初始化通知消息容器
$notifyLog = @()

# 关闭主程序
try {
    Stop-Process -Name $mainProcess -Force -ErrorAction Stop
    Write-Host "✅ 已关闭 $mainProcess" -ForegroundColor Green
    $notifyLog += "✅ 已关闭 $mainProcess"
} catch {
    Write-Host "ℹ️ $mainProcess 未运行或已关闭。" -ForegroundColor Yellow
    $notifyLog += "ℹ️ $mainProcess 未运行或已关闭"
}

# 关闭服务进程
try {
    Stop-Process -Name $serviceProcess -Force -ErrorAction Stop
    Write-Host "✅ 已关闭 $serviceProcess" -ForegroundColor Green
    $notifyLog += "✅ 已关闭 $serviceProcess"
} catch {
    Write-Host "ℹ️ $serviceProcess 未运行或已关闭。" -ForegroundColor Yellow
    $notifyLog += "ℹ️ $serviceProcess 未运行或已关闭"
}

# 启动主程序
if (Test-Path $appPath) {
    Start-Process -FilePath $appPath
    Write-Host "✅ 已启动 $appName" -ForegroundColor Cyan
    $notifyLog += "✅ 已启动 $appName"
} else {
    Write-Host "❌ 找不到程序文件 $appPath" -ForegroundColor Red
    $notifyLog += "❌ 启动失败：未找到 $appPath"
}

# 汇总通知
$summary = ($notifyLog -join "`n")
New-BurntToastNotification -AppLogo $imgPath -Text "📋 $appName 重启脚本已执行", $summary
