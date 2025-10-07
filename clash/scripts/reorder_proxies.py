#!/usr/bin/env python3
"""
reorder_proxies.py
将 Clash YAML 文件中 `proxies` 列表内每个节点的 `name` 键提前，放到该节点映射的第一项。

用法：
    python reorder_proxies.py -i "..\node copy.yaml" -o "..\node_reordered.yaml"

依赖：PyYAML
    pip install pyyaml

注意：脚本会保留其他键的相对顺序，只是把 name 提到首位。
"""
import argparse
import yaml
from collections import OrderedDict


def reorder_name_first(item):
    # item 是一个 dict (代表单个代理配置)
    if not isinstance(item, dict):
        return item
    if 'name' not in item:
        return item
    # 保持原有键的顺序但把 name 放到最前
    new = OrderedDict()
    new['name'] = item['name']
    for k, v in item.items():
        if k == 'name':
            continue
        new[k] = v
    return new


def process(in_path, out_path):
    with open(in_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict) or 'proxies' not in data:
        raise ValueError('输入文件中未找到顶层的 proxies 字段')

    proxies = data.get('proxies')
    if not isinstance(proxies, list):
        raise ValueError('proxies 字段不是列表')

    new_proxies = []
    for p in proxies:
        # 有些条目是简写（内联），例如 {name: 地点, server: ...}
        # safe_load 会将其解析为 dict；处理同样适用
        new_proxies.append(reorder_name_first(p))

    data['proxies'] = new_proxies

    # PyYAML 在某些环境下无法直接序列化 OrderedDict，
    # 这里递归把所有 OrderedDict 转成原生 dict 再写出。
    def to_builtin(o):
        if isinstance(o, OrderedDict):
            return {k: to_builtin(v) for k, v in o.items()}
        elif isinstance(o, dict):
            return {k: to_builtin(v) for k, v in o.items()}
        elif isinstance(o, list):
            return [to_builtin(i) for i in o]
        else:
            return o

    data_to_dump = to_builtin(data)

    # 写回文件
    with open(out_path, 'w', encoding='utf-8') as f:
        yaml.safe_dump(data_to_dump, f, allow_unicode=True, sort_keys=False, default_flow_style=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--input', required=True, help='输入 YAML 文件路径')
    parser.add_argument('-o', '--output', required=True, help='输出 YAML 文件路径')
    args = parser.parse_args()
    process(args.input, args.output)
