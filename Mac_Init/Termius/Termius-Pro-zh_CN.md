原项目：[ArcSurge/Termius-Pro-zh_CN](https://github.com/ArcSurge/Termius-Pro-zh_CN)
# Termius 中文汉化及功能增强脚本

## 🎉 简介与说明

- [Termius][termius] 汉化脚本。
- 大家可以在官方[功能请求][consideration]进行反馈，让官方尽快支持[中文][localization]。

## ✨ 功能特性

- **一键汉化** - 自动化界面汉化
- **试用功能激活** - 解锁高级特性
- **多平台支持** - Windows/macOS/Linux
- **安全机制** - 自动备份

## 🚀 快速开始

### 📦 前置要求

- Python
- Node.js (用于安装asar)

```bash
npm install -g @electron/asar
```

### 🧑‍💻 基础使用

```bash
# 默认执行汉化操作
python lang.py
```

### 🪄 高级功能

```bash
# 汉化+试用+样式修改
python lang.py --localize --trial --style

# 仅激活试用功能
python lang.py --trial

# 还原到初始状态
python lang.py --restore

# 搜索特定字符串
python lang.py --find "term1" "term2"
```

## 🔬 参数详解

| 参数                | 简写   | 功能说明     | 示例                                  |
|-------------------|------|----------|-------------------------------------|
| `--localize`      | `-l` | 汉化操作(默认) | `python lang.py`                    |
| `--trial`         | `-t` | 激活试用功能   | `python lang.py -lt`                |
| `--skip-login`    | `-k` | 跳过登录验证   | `python lang.py -lk`                |
| `--style`         | `-s` | 样式修改     | `python lang.py -ls`                |
| `--restore`       | `-r` | 还原操作     | `python lang.py -r`                 |
| `--find <关键词...>` | `-f` | 多条件联合搜索  | `python lang.py -f "term1" "term2"` |
| `--find extract` | 无 | 提取所有可能的字符串 | `python lang.py --find extract` |

## 📂 规则文件结构

```markdown
rules/
├── trial.txt      # 试用功能规则(-t/--trial时加载)
├── localize.txt   # 汉化规则(-l/--localize时加载)
├── skip_login.txt # 登录跳过规则(-k/--skip-login时加载)
└── style.txt      # 样式修改规则(-s/--style时加载)
extract/
├── app.asar.unpack #解包出的所有文件
└── allstring.txt   #所有可能的字符串
```

## 🤷 手动汉化

如果没有相关环境，可以手动汉化。

1. 前往 [Releases][releases] 下载对应版本的 `app.asar` 文件。
2. 找到 Termius 安装目录，通常位置为:
    - **Windows**: `C:\Users\你的用户名\AppData\Local\Programs\Termius`。
    - **Linux**: `/opt/Termius`。
    - **MacOS**: `/Applications/Termius.app/Contents`。
3. 将下载的 `app.asar` 文件覆盖 `resources` 文件夹下的 `app.asar` 文件。
   -  **注意**，macOS 替换后需要运行 [osxfix.sh](macos/osxfix.sh) 重新计算文件 hash 后方可使用。
4. 如果你不想自动更新，请删除 `app-update.yml` 文件。
5. 最后，如果没有想要的版本，可在 [Fork][fork] 本项目后前往仓库的 **Settings > Secrets and variables > Actions > Variables** 页面定义变量:
   - **Name**: `RELEASE_LIST`
   - **Value**: `l,lk,lt`
   - 默认`l,lk,lt`，代表生成三个版本，l为汉化，lt为汉化+试用，lk为汉化+跳过登录。可自行修改，通过逗号分隔。

## 📱 关于安卓版
- 目前只有汉化功能，暂无其他功能。并且部分词条在源码中，暂未汉化。
- 由于手机端和桌面端版本号不同，因此安卓版本不会发布在 `Releases` 中，而是暂时托管在 [Actions][localize-android]。[Actions][localize-android] 每天运行一次，请自行查找对应版本进行下载。注意，这个是需要**登录**才可以下载的。
- 若你计划 [Fork][fork] 此项目，请在 [Fork][fork] 后前往仓库的 **Settings > Secrets and variables > Actions > Secrets** 页面，点击 <kbd>New repository secret</kbd> 定义私密变量。
  - **Name**: `APK_SIGN_PROPERTIES`
  - **Value**: 填写 [apk.sign.properties.example](android/apk.sign.properties.example) 文件内容（请根据需要修改文件内容）

- 可选配置（`Github Action`）：
  - 添加自定义签名文件，可以覆盖安装 apk
  - 首先通过命令生成一个.jks签名文件
      ```bash
    # 然后通过命令编码成一个 Base64 的文件
    base64 -w 0 Termius_zh.jks > Termius_zh_base64.txt
      ```
  - 后前往仓库的 **Settings > Secrets and variables > Actions > Secrets** 页面，点击 <kbd>New repository secret</kbd> 定义私密变量。
  
  - **Name**: `SIGNING_KEY`
  - **Value**: 填写 [Termius_zh_base64.txt](Base64生成的文件) 文件内容（请根据需要修改文件内容）

### 🤖 关于脚本
- 安卓相关资源均存放在 [android](android) 目录下。
- 所需工具：
  - python（运行环境）
  - zipalign（对齐工具 `sudo apt install -y zipalign` 安装）
  - apksigner（签名工具 `sudo apt install -y apksigner` 安装）
  - keytool（密钥生成工具，集成在 JDK 中）
- 运行：
   ```bash
   # 进入安卓目录
   cd android
   # 配置签名信息（请自行修改内容）
   mv apk.sign.properties.example apk.sign.properties
   # 安装依赖
   pip install -r requirements.txt
   # 运行脚本
   python apktools.py
   ```

## 📖 常见问题

1. ModuleNotFoundError: No module named 'tkinter'
    - 缺少 tkinter 模块，请确保已安装 tkinter 模块。
2. PermissionError: [Errno 13] Permission denied: '***/resources/app.asar.bak'
    - 请检查权限，确保当前用户有`resources`目录写入权限。

## 🔔 注意事项

- 该项目仅适用于本地学习和测试，不支持在线功能。
- 使用汉化包可能会影响 Termius 软件的正常更新。
- 在执行任何操作之前，请确保备份 Termius 的相关文件。

## 📜 免责声明

- 本仓库包括发布页内的所有文件仅供学习和交流，请勿用于任何非法用途，严禁二次出售，请在下载后的24小时内删除！如有侵权请联系删除！
- 用于测试和学习研究，禁止用于商业用途，不能保证其合法性、准确性、完整性和有效性，请根据情况自行判断。
- 本人对任何问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害，使用即表示知晓风险。
- 保留随时终止项目的权利。


<!-- LINK -->
[termius]: https://termius.com
[consideration]: https://ideas.termius.com/tabs/1-under-consideration
[localization]: https://ideas.termius.com/c/82-chinese-localization
[releases]: https://github.com/ArcSurge/Termius-Pro-zh_CN/releases
[fork]: https://github.com/ArcSurge/Termius-Pro-zh_CN/fork
[secrets]: https://github.com/ArcSurge/Termius-Pro-zh_CN/settings/secrets/actions
[variables]: https://github.com/ArcSurge/Termius-Pro-zh_CN/settings/variables/actions
[actions]: https://github.com/ArcSurge/Termius-Pro-zh_CN/actions
[localize-android]: https://github.com/ArcSurge/Termius-Pro-zh_CN/actions/workflows/localize-android.yml