#!/bin/bash

set -e

USER_NAME=$(whoami)
TARGET_DIR="/Users/$USER_NAME/Library/Application Support/Microsoft"
TARGET_PATH="$TARGET_DIR/EdgeUpdater"

echo "👉 当前用户: $USER_NAME"
echo "👉 检测路径: $TARGET_PATH"
echo "----------------------------------"

print_flags() {
  if [ -e "$TARGET_PATH" ]; then
    ls -ldO "$TARGET_PATH"
  else
    echo "❌ EdgeUpdater 不存在"
    echo "可能是未安装Edge，或文件已删除，打开Edge更新页面会自动下载。"
  fi
}
send_notification() {
  local title="$1"
  local message="$2"
  osascript -e "display notification \"$message\" with title \"$title\" sound name \"Crystal\""
}

unlock_target() {
  echo "🔓 尝试解除Edge更新锁定..."
  sudo chflags noschg nouchg "$TARGET_PATH" 2>/dev/null || true
  sudo rm -rf "$TARGET_PATH"
}

do_lock() {
  echo "🗑️ 正在删除 EdgeUpdater..."
  unlock_target
  echo "✅ 已删除"
  echo "🔒 创建占位文件，禁用自动恢复..."
  sudo mkdir -p "$TARGET_DIR"
  sudo touch "$TARGET_PATH"
  sudo chflags schg "$TARGET_PATH"
  echo "✅ 已禁用（创建不可变文件）"
  send_notification "🔒 禁用 Edge 更新" "Edge 更新禁用成功 🚀"
}

do_unlock() {
  echo "🔓 正在解锁 Edge 更新..."
  unlock_target
  echo "✅ 已解锁（恢复文件夹模式）"
  send_notification "🔓 解锁 Edge 更新" "Edge 更新解锁成功 🚀"
}

# 1️⃣ 处理命令行参数
if [ -n "$1" ]; then
  case "$1" in
    "lock")
      do_lock
      exit 0
      ;;
    "unlock")
      do_unlock
      exit 0
      ;;
    *)
      echo "❌ 未知参数: $1"
      echo "用法:"
      echo "  $0         - 进入交互模式"
      echo "  $0 lock    - 快速锁定更新"
      echo "  $0 unlock  - 快速解锁更新"
      exit 1
      ;;
  esac
fi

# 2️⃣ 初始检测 (交互模式)
if [ ! -e "$TARGET_PATH" ]; then
  echo "✅ EdgeUpdater 当前不存在"
  exit 0
fi

# 类型判断
if [ -d "$TARGET_PATH" ]; then
  TYPE="dir"
  echo "📁 EdgeUpdater 是一个【文件夹】"
elif [ -f "$TARGET_PATH" ]; then
  TYPE="file"
  echo "📄 EdgeUpdater 是一个【文件】"
else
  echo "⚠️ EdgeUpdater 是未知类型"
  exit 1
fi

echo
echo "----------------------------------"

# ===============================
# 🧩 文件类型处理
# ===============================
if [ "$TYPE" = "file" ]; then
  echo "⚙️ 发现 EdgeUpdater 为文件，当前以禁用Edge更新"
  echo "请选择操作："
  echo "  1) 🔓 恢复Edge更新：解锁并删除该文件"
  echo "  2) 🔒 重新上锁：解锁后重新创建并上锁（禁止恢复）"
  echo "  3) ⏭️ 什么都不做"
  read -p "请输入选项 [1-3]: " FILE_CHOICE

  case "$FILE_CHOICE" in
    1)
      unlock_target
      echo "🗑️ 删除文件..."
      ;;
    2)
      unlock_target
      do_lock
      ;;
    *)
      echo "⏭️ 跳过处理"
      ;;
  esac

  echo
  echo "----------------------------------"
  echo "📊 最终状态检测："
  print_flags
  echo "----------------------------------"
  exit 0
fi

# ===============================
# 📁 文件夹处理逻辑
# ===============================

read -p "❓ 是否禁止 EdgeUpdater（创建不可变文件）？(y/N，默认禁用更新): " BLOCK_CONFIRM
if [[ "$BLOCK_CONFIRM" =~ ^[Nn]$ ]]; then
  echo "⏭️ 未设置禁止Edge更新，打开Edge后会自动创建该文件夹"
else
  do_lock
fi

echo
echo "----------------------------------"
echo "📊 最终状态检测："
print_flags
echo "----------------------------------"
echo "🎉 执行完成"
