#!/usr/bin/env python3
"""
count_yaml_nodes.py
统计 Clash YAML 文件中的代理节点总数。

用法：
    python count_yaml_nodes.py -i "..\node\node_reordered.yaml"
"""

import argparse
import yaml


def count_nodes(path):
  try:
    with open(path, 'r', encoding='utf-8') as f:
      data = yaml.safe_load(f)
    proxies = data.get('proxies')
    if not isinstance(proxies, list):
      print('未在文件中找到 proxies 列表')
      return 1

    node_count = len(proxies)
    print(f'YAML 文件中共有 {node_count} 个代理节点')
    return 0

  except FileNotFoundError:
    print(f'错误：文件 {path} 不存在')
    return 1
  except yaml.YAMLError as e:
    print(f'YAML 解析错误: {e}')
    return 1
  except Exception as e:
    print(f'发生错误: {e}')
    return 1


if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('-i', '--input', required=True, help='输入 Clash YAML 文件路径')
  args = parser.parse_args()
  exit(count_nodes(args.input))
