# 移动云盘优化脚本说明

本脚本为 139 移动云盘（yun.139.com）用户提供网页端体验优化，适用于油猴（Tampermonkey）等用户脚本管理器。

## 功能列表

- 自动移除右上角会员广告及推广元素，界面更清爽
- 实时监听页面 DOM 变化，动态广告出现也能自动清除
- 支持页面 hash 路径变化时自动重新清理广告
- 无需手动刷新，广告元素出现即自动移除

## 使用方法

1. 安装油猴（Tampermonkey）等用户脚本管理器
2. 打开脚本源文件：[移动云盘优化.js](https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/139yun/移动云盘优化.js)
3. 新建脚本并粘贴代码，或直接通过脚本管理器导入
4. 访问 yun.139.com 网盘页面，脚本自动生效

## 适用范围
- 仅作用于 `yun.139.com/w/*` 网页

## 反馈与支持
- 作者：sjmy
- 项目主页：https://github.com/shenjingmayi/bug
- 问题反馈：https://github.com/shenjingmayi/bug/issues

## 许可协议
- Apache License 2.0
