使用说明 — reorder_proxies.py

目的
将 Clash 配置文件（YAML）中 `proxies` 列表里每个代理条目的 `name` 键移动到该条目的第一行，改善可读性并统一格式。脚本不改变除顺序外的其他字段和值。

先决条件
- Python 3.8+
- 安装 PyYAML：
  pip install pyyaml

用法示例（PowerShell）

# 在脚本目录下运行：
python .\reorder_proxies.py -i ..\node\node copy.yaml -o ..\node\node_reordered.yaml

说明
- 脚本会把输出写到你指定的输出文件，不会直接覆盖原文件。确认没问题后可以手动替换原文件或通过 PowerShell 复制覆盖。
- 输出保留 Unicode（emoji）以及其它字段。
