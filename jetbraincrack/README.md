# JetBrains IDE 激活工具使用说明

本工具为 JetBrains 全家桶 IDE（如 IntelliJ IDEA、PyCharm、CLion、WebStorm 等）激活补丁脚本，适用于 Windows 系统。通过本工具可一键生成激活密钥并自动配置补丁，支持多种 JetBrains IDE。

## 使用前准备
1. **确保已安装 Java 环境**
   - 需配置好 `java` 命令环境变量。
   - 可在命令行输入 `java -version` 检查。
2. **准备本工具包**
  - 推荐选择在一个不会删除的文件夹内执行一键下载运行脚本
  - 只需下载 `快速激活脚本.bat`，脚本会自动下载所需的 `sniarbtej-2024.2.8.jar` 补丁文件。
  - 若自动下载失败，可手动前往仓库下载 `sniarbtej-2024.2.8.jar` 并放在脚本同目录下。


## 一键下载并运行（推荐）

无需手动下载脚本，只需在 PowerShell 或 CMD 中输入以下命令即可自动下载并运行：

```
powershell -Command "iwr -Uri 'https://raw.githubusercontent.com/shenjingmayi/bug/main/jetbraincrack/快速激活脚本.bat' -OutFile 'active.bat'; Start-Process 'active.bat' -Wait"
```

> 建议在全英文目录下执行该文件,且不要删除该文件
---

## 使用步骤

### 1. 运行激活脚本
- 双击 `快速激活脚本.bat`，或右键以管理员身份运行。


### 2. 检查依赖文件
- 脚本会自动检测 `sniarbtej-2024.2.8.jar` 是否存在。
- 若不存在，会提示自动下载、跳转仓库或退出。
- 建议选择自动下载，若失败请手动下载并放到脚本同目录。

### 3. 检查 Java 环境
- 脚本会自动检测 Java 环境。
- 若未安装或未配置环境变量，请先安装 Java 并配置好环境变量。

### 4. 生成激活密钥
- 按提示输入 License ID 和 User Name（可自定义，建议英文/数字，无特殊符号）。
- 程序会自动生成 `key.txt` 激活密钥文件。
- 若生成失败，检查输入内容是否有特殊符号，按提示重新输入。

### 5. 选择 IDE 路径
- 按提示输入 JetBrains IDE 的可执行文件路径或快捷方式路径。
  - 例如：`D:\Program Files\JetBrains\IntelliJ IDEA\bin\idea64.exe`
  - 或快捷方式：`D:\快捷方式\IntelliJ IDEA.lnk`(需要指向IDE主文件)
- 支持的 IDE 包括：
  - clion, datagrip, dataspell, goland, idea, phpstorm, pycharm, rider, rubymine, rustrover, webstorm
- 若输入快捷方式，脚本会自动解析真实路径。

### 6. 自动打补丁
- 脚本会自动备份原始 vmoptions 文件，并写入补丁配置。
- 若成功，会提示“补丁打入成功”。
- 若失败，请检查权限或路径是否正确。

### 7. 多个 IDE 激活
- 激活完成后可选择是否继续处理其他 IDE。

- **补丁文件下载失败**：请检查网络，或手动前往仓库下载 `sniarbtej-2024.2.8.jar` 并放到脚本同目录。
- **Java 未安装/未配置**：请先安装 Java 并配置环境变量。
- **key.txt 生成失败**：检查输入内容，避免特殊符号。
- **vmoptions 文件未找到**：请确认 IDE 路径正确，且已安装。
- **权限不足**：建议以管理员身份运行脚本。

## 免责声明
- 本工具仅供学习和研究使用，请勿用于商业用途。
- 项目地址：https://github.com/shenjingmayi/bug/tree/main/jetbraincrack

## 制作人
- sjmy
- Github主页：https://github.com/shenjingmayi
