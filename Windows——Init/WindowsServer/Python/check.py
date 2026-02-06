import argparse
import re
import sys

import win32service
import win32serviceutil
from winotify import Notification, audio

toast_config = {
  'app_id': 'Windows服务快速调整工具',
  'title': "",
  'msg': ["状态:", "启动类型:"],
}


def show_toast():
  if isinstance(toast_config['msg'], list): toast_config['msg'] = '\n'.join(toast_config['msg'])
  toast = Notification(**toast_config)
  toast.set_audio(audio.Mail, loop=False)
  print(toast_config)
  # toast.add_actions(label='确定', launch='')
  toast.show()


def exit(code):
  show_toast()
  sys.exit(code)


def type2cn(type_code, default=None):
  return {
    None: '数据为空,无法判断类型',
    2: "自动",
    3: "手动",
    4: "禁用"
  }.get(type_code, default)


def status2cn(status_code, default=None):
  return {
    None: '数据为空,无法判断状态',
    win32service.SERVICE_STOPPED: "已停止",  # 1
    win32service.SERVICE_START_PENDING: "正在启动",  # 2
    win32service.SERVICE_STOP_PENDING: "正在停止",  # 3
    win32service.SERVICE_RUNNING: "正在运行",  # 4
    win32service.SERVICE_CONTINUE_PENDING: "继续中",  # 5
    win32service.SERVICE_PAUSE_PENDING: "暂停中",  # 6
    win32service.SERVICE_PAUSED: "已暂停"  # 7
  }.get(status_code, default if not default else status_code)


def get_service_status(service_name):
  """
  获取服务的当前状态

  参数:
      service_name (str): 服务名称

  返回:
      str: 服务状态code
  """
  try:
    status = win32serviceutil.QueryServiceStatus(service_name)
    return status[1]
  except Exception as e:
    print(f"获取状态失败: {e}")
    return None


def get_service_type(service_name):
  try:
    # 获取服务启动类型（需要通过服务配置查询）
    hscm = win32service.OpenSCManager(None, None, win32service.SC_MANAGER_CONNECT)
    try:
      hs = win32service.OpenService(hscm, service_name, win32service.SERVICE_QUERY_CONFIG)
      try:
        config = win32service.QueryServiceConfig(hs)
        print(config)
        start_type_code = config[1]
      finally:
        win32service.CloseServiceHandle(hs)
    finally:
      win32service.CloseServiceHandle(hscm)

    return start_type_code
  except win32service.error as e:
    # 错误码1060表示服务不存在
    if e.winerror == 1060:
      print(f"服务不存在")
      return None
    else:
      raise


def get_service_info(service_name):
  """
  查询Windows服务的名称、运行状态、启动类型
  :param service_name: 服务名称（不是显示名）
  :return: 服务信息字典，若不存在返回None
  """
  try:
    status_code = get_service_status(service_name)
    start_type_code = get_service_type(service_name)
    toast_config['msg'][0] = f"服务状态 : {status2cn(status_code)}"
    toast_config['msg'][1] = f"启动类型 : {type2cn(start_type_code)}"
    return {
      "name": service_name,
      "status": status_code,
      "start_type": start_type_code
    }
  except win32service.error as e:
    # 错误码1060表示服务不存在
    if e.winerror == 1060:
      return None
    else:
      raise


def check_service_name(display_name):
  """
  检测名称服务是否存在,并且显示名称转化成内部名称
  :param display_name: 服务名称
  :return: 服务内部名称，如果未找到返回None
  """
  try:
    hscm = win32service.OpenSCManager(None, None, win32service.SC_MANAGER_ENUMERATE_SERVICE)
    try:
      # 枚举所有服务
      services = win32service.EnumServicesStatus(hscm)
      # print(len(services))
      for service in services:
        # print(service)
        # service[1] 是显示名称，service[0] 是内部名称
        if service[0].lower() == display_name.lower() or service[1].lower() == display_name.lower():
          return service[0]
    finally:
      win32service.CloseServiceHandle(hscm)
  except win32service.error as e:
    print(f"检测服务名称时出错: {e}")
  return None


def control_service(service_info, action):
  """
  控制 Windows 服务的运行状态

  参数:
      service_name (str): 服务名称
      action (str): 操作类型，可选值: 'run', 'stop', 'restart', 'pause', 'resume', 'auto', 'manual', 'disabled'

  返回:
      bool: 操作是否成功
  """
  service_name = service_info["name"]
  action = action.lower()
  try:
    if action == 'run':
      win32serviceutil.StartService(service_name)
      print(f"服务 '{service_name}' 启动成功")
      toast_config['msg'][0] += f" -> run"
      return True
    elif action == 'stop':
      win32serviceutil.StopService(service_name)
      print(f"服务 '{service_name}' 停止成功")
      toast_config['msg'][0] += f" -> stop"
      return True
    elif action == 'restart':
      win32serviceutil.RestartService(service_name)
      print(f"服务 '{service_name}' 重启成功")
      toast_config['msg'][0] += f" -> restart"
      return True
    elif action == 'pause' or action == 'resume':
      # 暂停服务
      hscm = win32service.OpenSCManager(None, None, win32service.SC_MANAGER_CONNECT)
      try:
        hs = win32service.OpenService(hscm, service_name, win32service.SERVICE_PAUSE_CONTINUE)
        win32service.ControlService(hs, {
          "pause": win32service.SERVICE_CONTROL_PAUSE,
          "resume": win32service.SERVICE_CONTROL_CONTINUE,
        }.get(action, win32service.SERVICE_NO_CHANGE))
        win32service.CloseServiceHandle(hs)
        print(f"服务 '{service_name}' {"暂停成功" if action == "pause" else "恢复成功"}")
        toast_config['msg'][0] += f" -> {action}"
        return True
      finally:
        win32service.CloseServiceHandle(hscm)
    elif action == 'auto' or action == 'manual' or action == 'disabled':
      hs = win32service.OpenSCManager(None, None, win32service.SC_MANAGER_ALL_ACCESS)
      try:
        hscm = win32service.OpenService(hs, service_name, win32service.SERVICE_CHANGE_CONFIG)
        try:
          win32service.ChangeServiceConfig(hscm, win32service.SERVICE_NO_CHANGE,  # serviceType
             {
               "auto": win32service.SERVICE_AUTO_START,
               "manual": win32service.SERVICE_DEMAND_START,
               "disabled": win32service.SERVICE_DISABLED,
             }.get(action, win32service.SERVICE_NO_CHANGE),  # startType
             win32service.SERVICE_NO_CHANGE,  # errorControl
             None, None, 0, None, None, None, None
             )
        finally:
          win32service.CloseServiceHandle(hscm)
      finally:
        win32service.CloseServiceHandle(hs)
      print(
        f"服务 '{service_name}' 启动类型切换为{"自动" if action == "auto" else "手动" if action == "manual" else "禁用"}成功")
      toast_config['msg'][1] += f" -> {action}"
      return True
    else:
      print(f"不支持的操作: {action}")
      return False

  except Exception as e:
    code, action, msg = e.args
    msg = {
      5: "没有权限",
      1056: "重复启动",
      1058: "已禁用服务无法启动",
      1060: "服务不存在",
      1062: "重复暂停",
    }.get(code, msg)
    toast_config['msg'][0] += f" -> {msg}"
    print(f"错误码: {code}, 操作: {action}, 消息: {msg}")
    return False


def print_help():
  """打印使用方法"""
  print("""
使用方法:
    脚本 服务 [操作] [类型]

参数说明:
    脚本    脚本文件路径
    服务    服务名称

    操作    (可选) 对服务的操作
            run/Running/open  开启服务
            Stop/Stopped/close 关闭服务
            (空字符串/不匹配) 不执行任何操作

    类型    (可选) 设置服务的触发类型
            a/Auto           设置为自动执行
            Manual/onhand/h  设置为手动
            Disabled/dis     禁用服务
            (空字符串/不匹配) 不执行任何操作

示例:
    script.py service run auto
    script.py service stop manual
    script.py service
    script.py --help
    """)


def print_service_info(service_info):
  try:
    # 输出格式化结果
    print(f"服务名称   : {service_info['name']}")

    status_cn = status2cn(service_info["status"], f"未知运行状态{service_info["status"]}")
    print(f"状态       : {status_cn}")

    start_type_cn = type2cn(service_info['start_type'])
    print(f"启动类型   : {start_type_cn}")
  except Exception as e:
    return f"打印服务信息失败: {e}"


def init_argv():
  """
  解析命令行参数，返回包含服务名称和操作数组的字典
  示例:
    python script.py service run auto
  返回字典格式:
  {
      'service': 服务名称,

      'actions': 操作 (['run', 'stop', 'restart', 'pause', 'resume', 'auto', 'manual', 'disabled']),
  }
  """
  parser = argparse.ArgumentParser(
    description='服务管理脚本',
    add_help=False  # 禁用默认的 -h/--help，手动处理
  )

  # 添加参数
  parser.add_argument('service', nargs='?', help='服务名称')
  parser.add_argument('status', nargs='?', help='操作: run/stop')
  parser.add_argument('type', nargs='?', help='类型: auto/manual/disabled')

  # 解析参数
  try:
    args = parser.parse_args()
  except SystemExit:
    # 如果解析失败，打印帮助信息
    print_help()
    return None

  # 检查是否需要打印帮助
  if args.service and args.service.lower() in ['--h', '-h', '--help', '-help']:
    print_help()
    return None

  # 初始化结果字典
  result = {
    'service': None,
    'actions': [],
  }

  # 处理服务名称
  if args.service:
    result['service'] = args.service

  # 处理操作 (不区分大小写)
  formated = format_action(args.status) if args.status else None
  if formated: result['actions'].append(formated)
  # 处理类型 (不区分大小写)
  formated = format_action(args.type) if args.type else None
  if formated: result['actions'].append(formated)

  # if ('start' in result["actions"] or 'restart' in result["actions"]) and "disabled" in result["actions"]:
  #   print("不能在禁止服务启动的情况下运行服务!")
  #   result['actions'] = []
  print(f"操作1: {result['actions']}")
  return result


def format_action(action=''):
  action_lower = action.lower()
  if action_lower in ['run', 'running', 'open', 'opening', 'start', 'starting']:
    return 'run'
  elif action_lower in ['stop', 'stopped', 'close','closed']:
    return 'stop'
  elif action_lower in ['restart', 're']:
    return 'restart'
  elif action_lower in ['pause', 'wait', 'waiting']:
    return 'pause'
  elif action_lower in ['resume', 'continue', 'go', 'cont','con']:
    return 'resume'
  elif action_lower in ['a', 'auto']:
    return 'auto'
  elif action_lower in ['manual', 'onhand', 'hand', 'h']:
    return 'manual'
  elif action_lower in ['disabled', 'dis', 'disable','disabled']:
    return 'disabled'
  else:
    return None  # 不匹配则不执行任何操作


def menu_change(service_info, actions=None):
  if service_info:
    print_service_info(service_info)
    print(f"操作2: {actions}")
    service_name = service_info['name']
    if not actions:
      print("======更改类型======")
      print("1: 启动-status (run)")
      print("2: 停止-status (stop)")
      print("3: 重启-status (restart)")
      print("4: 自动启动-type (auto)")
      print("5: 手动启动-type (manual)")
      print("6: 禁用-type (disabled)")
      print("0: 返回上一级")
      print("其他任意字符: 退出")
      nextAction = input(f"请输入对 {service_name} 的操作(可用空格分割多个操作) : ").strip()

      L = list(filter(None, re.split(r"[^0-6qb]+", nextAction)))
      actions = [
        'run' if action == '1' else
        'stop' if action == '2' else
        'restart' if action == '3' else
        'auto' if action == '4' else
        'manual' if action == '5' else
        'disabled' if action == '6' else
        'back' if action == '0' or action == 'b' else
        'quit' if action == 'q' else
        action
        for action in L
      ]
    print(f"操作3: {actions}")
    for action in actions:
      match action:
        case 'run' | 'stop' | 'restart' | 'auto' | 'manual' | 'disabled':
          control_service(service_info, action)
        case 'back':
          # 返回上一级（重新输入服务名称）
          print("返回上一级")
          # break
        case 'quit':
          print("退出程序")
          exit(0)
        case _:
          print("无效的输入")

  else:
    print(f"未找到服务")
    exit(1)


def main():
  argvs = init_argv()
  print(argvs)
  # 支持从命令行传参，比如：python script.py 服务名
  input_name = argvs['service'] if argvs['service'] else input("请输入服务名称 : ")
  # input_name = 'AVCTP 服务'
  # input_name = "BthAvctpSvc"
  service_name = check_service_name(input_name)
  if service_name:
    toast_config['title'] += f"服务名称 : {service_name}"
    service_info = get_service_info(service_name)
    menu_change(service_info, argvs['actions'])
  else:
    toast_config['title'] += f"服务名称 : {input_name}"
    toast_config['msg'] = f"未找到服务 {input_name}"
    print(f"未找到服务 {input_name}")
    exit(1)
  exit(0)


main()
