# EdgeUpdateLock

一个简单的 macOS 脚本，用于禁用 Microsoft Edge 的自动更新。

## 功能

该脚本通过在 Edge 更新程序路径创建不可变文件（immutable file）来阻止 Edge 自动下载和安装更新。

- **锁定更新**：删除 EdgeUpdater 文件夹并创建一个带 `schg` 标志的同名空文件。
- **解锁更新**：解除文件锁定并删除，允许 Edge 恢复正常的更新逻辑。
- **状态检测**：显示当前更新程序的锁定状态。

## 使用方法

1. 打开终端。
2. 运行脚本：
   - **交互模式**：
     ```bash
     bash EdgeupdateLock.sh
     ```
   - **快速锁定**：
     ```bash
     bash EdgeupdateLock.sh lock
     ```
   - **快速解锁**：
     ```bash
     bash EdgeupdateLock.sh unlock
     ```
3. 如果使用交互模式，请根据提示选择操作。

## 注意事项

- 脚本需要 `sudo` 权限来修改文件标志（chflags）。
- 锁定后，Edge 将无法通过内置机制自动更新。

## 路径

目标路径：`~/Library/Application Support/Microsoft/EdgeUpdater`
