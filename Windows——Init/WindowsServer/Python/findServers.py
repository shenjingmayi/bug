import win32service
import win32serviceutil


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
  }.get(status_code, default)


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
  result = []
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
          result.append(service[0])
    finally:
      # 关闭服务管理器句柄
      win32service.CloseServiceHandle(hscm)
  except win32service.error as e:
    print(f"检测服务名称时出错: {e}")
  print(f"最终的结果 : {result}")
  return result



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


def main():
  input_name =  input("请输入服务名称 : ")
  # input_name = 'AVCTP 服务'
  service_name_list = check_service_name(input_name)
  for service_name in service_name_list:
    service_info = get_service_info(service_name)
    print_service_info(service_info)


while True:
  main()
