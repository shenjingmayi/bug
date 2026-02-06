# Windows 服务管理工具集

这是一个用于管理 Windows 服务的 Python 工具集，包含服务查询、状态控制、批量操作等功能。

## 依赖

```bash
pip install pywin32 winotify
```

## 工具说明

### 1. check.py - 服务查询与管理工具

**功能：**
- 查询 Windows 服务的运行状态和启动类型
- 控制服务的运行状态（启动、停止、重启、暂停、恢复）
- 修改服务的启动类型（自动、手动、禁用）
- 支持交互式菜单操作
- 支持命令行参数操作
- 操作结果通过系统通知显示

**使用方法：**

#### 命令行模式
```bash
# 查询服务状态
python check.py <服务名称>

# 启动服务
python check.py <服务名称> run

# 停止服务
python check.py <服务名称> stop

# 重启服务
python check.py <服务名称> restart

# 设置为自动启动
python check.py <服务名称> auto

# 设置为手动启动
python check.py <服务名称> manual

# 禁用服务
python check.py <服务名称> disabled

# 组合操作（例如：设置为自动并启动）
python check.py <服务名称> auto run

# 查看帮助
python check.py --help
```

#### 交互式模式
```bash
python check.py
```
运行后会提示输入服务名称，然后显示操作菜单供选择。

**支持的操作类型：**
- **状态操作：** run/running/open/start, stop/stopped/close, restart/re, pause/wait, resume/continue/go/cont
- **启动类型操作：** a/auto, manual/onhand/hand/h, disabled/dis/disable

**示例：**
```bash
# 启动 MySQL 服务并设置为自动启动
python check.py mysql90 auto run

# 停止 Xbox 相关服务并设置为手动
python check.py XblGameSave manual stop

# 重启 Tailscale 服务
python check.py Tailscale restart
```

### 2. findServers.py - 服务查找工具

**功能：**
- 根据服务名称（显示名或内部名）查找所有匹配的服务
- 显示服务的详细信息（名称、状态、启动类型）
- 支持模糊匹配

**使用方法：**
```bash
python findServers.py
```
运行后输入服务名称，工具会列出所有匹配的服务及其状态信息。

**示例：**
```bash
# 查找所有包含 "edge" 的服务
输入服务名称: edge

# 查找所有包含 "xbox" 的服务
输入服务名称: xbox
```

### 3. createVbsFile.py - VBS 脚本生成工具

**功能：**
- 根据配置文件自动生成 VBS 脚本
- 批量管理多个服务
- 以管理员权限执行服务操作
- 支持延迟执行（避免服务冲突）

**配置文件：** `vbsConfig.json`

**使用方法：**
```bash
python createVbsFile.py
```

**生成的 VBS 脚本位置：** `./vbs/` 目录下

**配置说明：**

`vbsConfig.json` 文件结构：
- `actionType`: 定义可执行的操作类型（ID、名称、命令）
- `fileList`: 定义要生成的脚本文件组
  - `name`: 分组名称（对应 vbs 子目录）
  - `actionsList`: 要生成的操作类型 ID 列表
  - `serviceList`: 要管理的服务列表

**示例配置：**
```json
{
  "actionType": [
    {"id": 0, "name": "自定义操作", "action": ""},
    {"id": 2, "name": "自动并运行", "action": "auto run"},
    {"id": 11, "name": "禁用并停止", "action": "stop disabled"}
  ],
  "fileList": [
    {
      "name": "Edge更新服务",
      "actionsList": [0, 2, 11],
      "serviceList": ["edgeupdate", "edgeupdatem"]
    }
  ]
}
```

**生成的 VBS 脚本示例：**
```vb
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdate auto run", "", "runas", 0
WScript.Sleep 3000
CreateObject("Shell.Application").ShellExecute "python", "..\..\check.py edgeupdatem auto run", "", "runas", 0
```

## VBS 脚本目录结构

生成的 VBS 脚本按服务分组存储在 `./vbs/` 目录下：

## 工作流程

1. **修改配置：** 编辑 `vbsConfig.json` 文件，添加或修改要管理的服务和操作类型
2. **生成脚本：** 运行 `python createVbsFile.py` 生成 VBS 脚本
3. **执行脚本：** 双击生成的 VBS 脚本执行服务操作
4. **查询状态：** 使用 `check.py` 或 `findServers.py` 查询服务状态

## 注意事项

1. **管理员权限：** VBS 脚本会以管理员权限运行，需要确认 UAC 提示
2. **服务名称：** 使用服务的内部名称（如 `mysql90`），而不是显示名称（如 `MySQL 服务`）
3. **延迟执行：** VBS 脚本中设置了 3 秒延迟，避免服务操作冲突
4. **依赖库：** 需要安装 `pywin32` 和 `winotify` 库
5. **系统通知：** `check.py` 会通过系统通知显示操作结果

## 常见服务名称

- **MySQL:** `mysql90`
- **Edge 更新服务:** `edgeupdate`, `edgeupdatem`, `edgeupdate1db8fc699f9368b`, `edgeupdate1dbf14fa58159f6`
- **Xbox:** `XblGameSave`, `XboxNetApiSvc`, `XblAuthManager`, `XboxGipSvc`
- **Tailscale:** `Tailscale`
- **Listary:** `ListaryServiceV2`
- **VMware:** `VmwareAutostartService`
- **手机服务:** `PhoneSvc`
- **抖音:** `DouyinElevationService`

## 扩展功能

可以根据需要修改 `vbsConfig.json` 文件来添加新的服务分组和操作类型，然后重新运行 `createVbsFile.py` 生成新的 VBS 脚本。
