param(
    [string]$Service,
    [string]$Action1,
    [string]$Action2
)
function Assert-Admin {
    $isAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
    ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if (-not $isAdmin) {
        Toast "权限不足" @("需要以管理员权限运行")
        exit 5
    }
}

Assert-Admin

# ===============================
# BurntToast
# ===============================
Import-Module BurntToast

# ===============================
# 工具函数
# ===============================

function Resolve-Service {
    param([string]$Name)

    Get-Service | Where-Object {
        $_.Name -ieq $Name -or $_.DisplayName -ieq $Name
    } | Select-Object -First 1
}

function Get-ServiceInfo {
    param([string]$Name)

    $svc = Get-Service $Name -ErrorAction Stop
    $cim = Get-CimInstance Win32_Service -Filter "Name='$Name'"

    [PSCustomObject]@{
        Name        = $svc.Name
        DisplayName = $svc.DisplayName
        Status      = $svc.Status
        StartType   = $cim.StartMode
    }
}

function Format-Action {
    param([string]$Action)

    if (-not $Action) { return $null }

    switch ($Action.ToLower()) {
        {$_ -in 'run', 'running', 'open', 'opening', 'start', 'starting'} { 'run' }
        {$_ -in 'stop','close','stopped'}                   { 'stop' }
        {$_ -in 'restart','re'}                             { 'restart' }
        {$_ -in 'pause','wait','waiting'}                   { 'pause' }
        {$_ -in 'resume', 'continue', 'go', 'cont','con'}   { 'resume' }
        {$_ -in 'a','auto'}                                 { 'auto' }
        {$_ -in 'manual', 'onhand', 'hand', 'h'}            { 'manual' }
        {$_ -in 'disabled', 'dis', 'disable','disabled'}    { 'disabled' }
        default { $Action.ToLower() }
    }
}

function Invoke-ServiceAction {
    param(
        [string]$Name,
        [string]$Action
    )

    switch ($Action) {
        'run'      { Start-Service $Name }
        'stop'     { Stop-Service $Name -Force }
        'restart'  { Restart-Service $Name -Force }
        'pause'    { Suspend-Service $Name }
        'resume'   { Resume-Service $Name }
        'auto'     { Set-Service $Name -StartupType Automatic }
        'manual'   { Set-Service $Name -StartupType Manual }
        'disabled' { Set-Service $Name -StartupType Disabled }
    }
}

# ===============================
# 主流程
# ===============================

$toastLines = @()

# 参数不足 → 交互
$parsedActions = @(
    Format-Action $Action1
    Format-Action $Action2
) | Where-Object { $_ }

$interactive = (-not $Service) -or ($parsedActions.Count -eq 0)

if (-not $Service) {
    $Service = Read-Host "请输入服务名称"
}

$svc = Resolve-Service $Service
if (-not $svc) {
    Toast "服务管理" @("未找到服务: $Service")
    exit 1
}

$info = Get-ServiceInfo $svc.Name

Write-Host "==============================="
Write-Host "服务名称   : $($info.Name)"
Write-Host "显示名称   : $($info.DisplayName)"
Write-Host "运行状态   : $($info.Status)"
Write-Host "启动类型   : $($info.StartType)"
Write-Host "==============================="

$toastLines += "状态: $($info.Status)"
$toastLines += "启动类型: $($info.StartType)"

if ($interactive) {

    Write-Host "1: 启动"
    Write-Host "2: 停止"
    Write-Host "3: 重启"
    Write-Host "4: 自动"
    Write-Host "5: 手动"
    Write-Host "6: 禁用"
    Write-Host "0: 退出"

    $map = @{
        '1'='run'; '2'='stop'; '3'='restart'
        '4'='auto'; '5'='manual'; '6'='disabled'
    }

    $input = Read-Host "请输入操作(可空格分隔)"
    $parsedActions = $input -split '\s+' | ForEach-Object { $map[$_] }
}

foreach ($act in $parsedActions) {
    try {
        Invoke-ServiceAction $svc.Name $act
        $toastLines += "执行: $act ✓"
    }
    catch {
        $toastLines += "执行: $act ✗ $($_.Exception.Message)"
    }
}

Write-Host $toastLines
$summary = ($toastLines -join "`n")
New-BurntToastNotification -Text "服务: $($info.DisplayName)", $summary
