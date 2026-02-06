# sjmy
---

当垃圾场了，找点东西就往里面扔。

- 加速CDN
```html
https://cdn.jsdelivr.net/gh/shenjingmayi/sjmy@main/文件路径
https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/文件路径
```

- 保证识别中文环境
```pwsh
cd D:\Code\GitProjects\sjmy\WindowsServer

# 读取文件内容（使用 UTF-8 编码）
$content = Get-Content -Path "check.ps1" -Encoding UTF8

# 保存为 UTF-8 with BOM
$content | Out-File -FilePath "check.ps1" -Encoding UTF8
```

## 许可证

本项目采用保留部分权利的许可证：

- ✅ 允许使用、复制、分发
- ✅ 允许修改以满足个人需求
- ❌ 禁止修改后重新发布（需要作者授权）

如需修改后发布，请联系作者获得授权。
