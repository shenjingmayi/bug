#!/usr/bin/env python3
"""
find_duplicate_proxies.py
扫描 Clash YAML 的 `proxies` 列表，查找重复的代理条目（不把 name 计入判重）。
可选：删除重复数据并保存到文件。

用法：
    python find_duplicate_proxies.py -i "..\node\node_reordered.yaml" [--remove-duplicates] [--output "..\node\node_reordered_cleaned.yaml"]

输出：在控制台列出每个重复组：出现次数、每个条目的索引（从 0 开始）和 name 字段。
如果使用 --remove-duplicates 选项，则会删除重复数据并保存到文件。
"""
import argparse
import yaml
import json
from collections import defaultdict

# 这些字段视为易变的统计或不影响连接唯一性的字段，会在比对时忽略
SKIP_KEYS = {'name', 'delay', 'down', 'up', 'recv-window', 'recv_window_conn', 'auth-str', 'auth_str',
             'client-fingerprint', 'country', 'xudp', 'tfo', 'username', 'password', 'ping', 'speed', 'comment'}


# 有些嵌套结构里也可能包含易变字段，例如 ws-opts.headers 中的 User-Agent，
# 这里只不过滤顶层字段；如果需要可以扩展为更细粒度的规则。


def canonicalize(obj):
  """递归把结构转换为可比较的原始 Python 类型，并剔除 SKIP_KEYS（仅对 dict 的顶层键起效）。"""
  if isinstance(obj, dict):
    # 只在顶层过滤 skip keys，当 obj 作为整个代理条目时有用；
    # 对于嵌套 dict 我们仍保留原样（你可以扩展此逻辑）。
    items = []
    for k in sorted(obj.keys()):
      if k in SKIP_KEYS:
        continue
      v = obj[k]
      items.append((k, canonicalize(v)))
    return tuple(items)
  elif isinstance(obj, list):
    return tuple(canonicalize(i) for i in obj)
  else:
    return obj


def fingerprint(proxy):
  # 生成一个字符串指纹，便于作为 dict key
  can = canonicalize(proxy)
  return json.dumps(can, ensure_ascii=False, sort_keys=True)


def find_duplicates(path, remove_duplicates=False, output_path=None):
  with open(path, 'r', encoding='utf-8') as f:
    data = yaml.safe_load(f)

  proxies = data.get('proxies')
  if not isinstance(proxies, list):
    print('未在文件中找到 proxies 列表')
    return 1

  fmap = defaultdict(list)
  for idx, p in enumerate(proxies):
    fp = fingerprint(p)
    fmap[fp].append((idx, p.get('name')))

  duplicates = {k: v for k, v in fmap.items() if len(v) > 1}

  if not duplicates:
    print('未发现重复代理节点（排除 name 字段后）。')
    if remove_duplicates:
      print('没有重复数据需要删除。')
    return 0

  print('发现重复代理节点（排除 name 字段后）：')
  for i, (fp, entries) in enumerate(duplicates.items(), start=1):
    print(f'组 {i}: 出现 {len(entries)} 次')
    for idx, name in entries:
      print(f'  - 索引 {idx}, name: {name}')
    print('  fingerprint:', fp)
    print()

  if remove_duplicates:
    print('正在删除重复数据...')
    # 创建一个集合，包含所有需要删除的索引
    indices_to_remove = set()
    for entries in duplicates.values():
      # 保留第一个出现的条目，删除其余的
      for idx, name in entries[1:]:
        indices_to_remove.add(idx)
    # 按索引降序排序，这样删除时不会影响前面元素的索引
    for idx in sorted(indices_to_remove, reverse=True):
      del proxies[idx]
    # 确定输出路径
    if output_path is None:
      output_path = path

    # 保存修改后的数据
    with open(output_path, 'w', encoding='utf-8') as f:
      yaml.dump(data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
    print(f'已删除 {len(indices_to_remove)} 个重复代理节点，结果已保存到: {output_path}')
    return 0

  return 0


if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('-i', '--input', required=True, help='输入 Clash YAML 文件路径')
  parser.add_argument('--remove-duplicates', action='store_true', help='删除重复数据')
  parser.add_argument('--output', help='输出文件路径（如果不指定，则覆盖原文件）')
  args = parser.parse_args()
  exit(find_duplicates(args.input, args.remove_duplicates, args.output))
