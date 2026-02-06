
param(
  [Parameter(Mandatory = $true)]
  [string]$ServiceName,

  [Parameter(Mandatory = $true)]
  [ValidateSet("start", "stop", "restart")]
  [string]$Action
)

try {
  switch ($Action) {
    "start" { 
      Write-Host "正在启动服务: $ServiceName" -ForegroundColor Yellow
      Start-Service -Name $ServiceName -ErrorAction Stop
      Write-Host "服务启动成功" -ForegroundColor Green
    }
    "stop" { 
      Write-Host "正在停止服务: $ServiceName" -ForegroundColor Yellow
      Stop-Service -Name $ServiceName -Force -ErrorAction Stop
      Write-Host "服务停止成功" -ForegroundColor Green
    }
    "restart" { 
      Write-Host "正在重启服务: $ServiceName" -ForegroundColor Yellow
      Restart-Service -Name $ServiceName -Force -ErrorAction Stop
      Write-Host "服务重启成功" -ForegroundColor Green
    }
  }
} catch {
  Write-Host "操作失败: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Get-Service -Name $ServiceName