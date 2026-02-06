# 导入 BurntToast 模块
Import-Module BurntToast

param (
  [string[]]$processes = @( ),
  [string]$appPath = "",
  [string]$imgPath = "",
  [string]$appName = "应用名称"
)

# 初始化通知消息容器
$notifyLog = @()

# 遍历并关闭进程
foreach ($procName in $processes) {
  try {
    Stop-Process -Name $procName -Force -ErrorAction Stop
    Write-Host "✅ 已关闭 $procName" -ForegroundColor Green
    $notifyLog += "✅ 已关闭 $procName"
  } catch {
    Write-Host "ℹ️ $procName 未运行或已关闭。" -ForegroundColor Yellow
    $notifyLog += "ℹ️ $procName 未运行或已关闭"
  }
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
