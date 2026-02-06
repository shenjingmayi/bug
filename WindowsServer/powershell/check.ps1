param(
  [Parameter(Mandatory = $true)]
  [string]$ServiceName
)

$svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($null -eq $svc) {
  Write-Output "未找到$($ServiceName)服务"
  exit 1
}
$name = $svc.Name
$status = $svc.Status
$startType = (Get-CimInstance Win32_Service -Filter "Name='$($name)'").StartMode
Write-Output "Name        : $($name)"
Write-Output "Status      : $(
    if($status -eq "Running") {"运行中" }
    elseif($status -eq "Stopped") {"已停止" }
    else {"未知运行状态$($status)" }
  )"
# 运行中: Running
# 已停止: Stopped
Write-Output "StartType   : $(
    if($startType -eq "Auto") {"自动" }
    elseif($startType -eq "Manual") {"手动" }
    elseif($startType -eq "Disabled") {"禁用" }
    else {"未知启动类型$($startType)" }
  )"
# 自动: Auto
# 手动: Manual
# 手动(触发器启动): Manual
# 禁用: Disabled
