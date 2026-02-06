import json
import os

CONFIG_FILE = "vbsConfig.json"
OUTPUT_BASE_DIR = "./vbs"
SLEEP_LINE = "WScript.Sleep 3000"


def main():
  with open(CONFIG_FILE, "r", encoding="utf-8") as f:
    config = json.load(f)

  action_types = config["actionType"]
  file_list = config["fileList"]

  # actionType 以 id 为索引快速查找
  action_map = {a["id"]: a for a in action_types}

  for file_item in file_list:
    group_name = file_item["name"]
    actions_list = file_item["actionsList"]
    service_list = file_item["serviceList"]

    # 创建目录 ./vbs/xxx
    output_dir = os.path.join(OUTPUT_BASE_DIR, group_name)
    os.makedirs(output_dir, exist_ok=True)

    for action_id in actions_list:
      action = action_map.get(action_id)
      if not action:
        continue

      action_name = action["name"]
      action_cmd = action["action"]

      # vbs 文件名
      vbs_filename = f"{group_name}-{action_name}.vbs"
      vbs_path = os.path.join(output_dir, vbs_filename)

      lines = []

      for idx, service in enumerate(service_list):
        # 构造参数

        args = f"..\\..\\check.py {service} {action_cmd}"
        shell_line = (
          'CreateObject("Shell.Application").ShellExecute '
          f'"python", "{args}", "", "runas"{", 0" if action_id != 0 else ""}'
        )

        lines.append(shell_line)

        # 非最后一条命令，插入 Sleep
        if idx != len(service_list) - 1:
          lines.append(SLEEP_LINE)

      # 写入 vbs 文件
      with open(vbs_path, "w", encoding="utf-8") as vbs_file:
        vbs_file.write("\n".join(lines))

      print(f"生成: {vbs_path}")


if __name__ == "__main__":
  main()
