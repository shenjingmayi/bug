// ==UserScript==
// @name         123云盘解锁
// @author       sjmy
// @namespace    https://github.com/shenjingmayi/bug/tree/main/js
// @version      20250823
// @description  专业的123云盘增强脚本 - 完美解锁会员功能、突破下载限制、去广告、支持自定义用户信息。支持个人网盘与分享页面，可在线配置，界面精美，功能强大，让你的123云盘体验更美好！
// @license      Apache Licence 2.0
// @match        *://*.123pan.com/*
// @match        *://*.123pan.cn/*
// @match        *://*.123684.com/*
// @match        *://*.123865.com/*
// @match        *://*.123952.com/*
// @match        *://*.123912.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        GM_getResourceText
// @grant        GM_info
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?sz=64&domain=123pan.com
// @supportURL   https://github.com/shenjingmayi/bug/issues
// @updateURL    https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/123pan/123pan.js
// @downloadURL  https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/123pan/123pan.js

// ==/UserScript==

(function() {
  'use strict';

  // 从存储中读取配置,如果没有存储过则使用默认值
  var user = {
    vip: GM_getValue('vip', 1), // 开启会员修改（总开关）
    svip: GM_getValue('svip', 1), // 显示为超级会员
    pvip: GM_getValue('pvip', 1), // 显示为长期会员
    ad: GM_getValue('ad', 1), // 关闭广告
    name: GM_getValue('name', "sjmy"), // 自定义用户名
    photo: GM_getValue('photo', "https://storage.live.com/users/0x664057f0c496b12a/myprofile/expressionprofile/profilephoto:UserTileStatic/p?ck=1&ex=720&sid=226E2F34B2706ECB354B397AB3B26F79&fofoff=1"), // 自定义头像
    mail: GM_getValue('mail', ""), // 邮箱
    phone: GM_getValue('phone', ""), // 手机号
    id: GM_getValue('id', ""), // 用户ID
    level: GM_getValue('level', 128), // 成长容量等级
    endtime: GM_getValue('endtime', 253402185600), // 会员过期时间
    debug: GM_getValue('debug', 0), // 调试模式
    bg: GM_getValue('bg', 1), // 屏蔽背景图功能 (1为显示背景，0为屏蔽背景)
  }

  // 保存原始的XMLHttpRequest和fetch方法
  const originalXHR = unsafeWindow.XMLHttpRequest;
  const originalFetch = unsafeWindow.fetch;

  // 创建新的XMLHttpRequest类
  function CustomXHR() {
    const xhr = new originalXHR();

    // 保存原始方法的引用并绑定正确的this上下文
    const originalOpen = xhr.open.bind(xhr);
    const originalSetRequestHeader = xhr.setRequestHeader.bind(xhr);

    // 重写open方法
    xhr.open = function(method, url, ...args) {
      try {
        url = new URL(url, location.origin).href;
        xhr.url = url;

        // 检查是否需要拦截请求
        if (url.includes('web_logs') || url.includes('metrics')) {
          throw new Error('【123 云盘解锁】已屏蔽此数据收集器');
        }

        return originalOpen(method, url, ...args);
      } catch (e) {
        console.error('XHR open error:', e);
        throw e;
      }
    };

    // 重写setRequestHeader方法
    xhr.setRequestHeader = function(header, value) {
      try {
        let info = reddem();
        let headers = {
          "user-agent": info.ua,
          "platform": info.os.toLowerCase(),
          "app-version": info.version,
          "x-app-version": info.versionX
        };

        if (header.toLowerCase() in headers) {
          value = headers[header.toLowerCase()];
        }

        return originalSetRequestHeader(header, value);
      } catch (e) {
        console.error('XHR setRequestHeader error:', e);
        return originalSetRequestHeader(header, value);
      }
    };

    // 添加响应拦截
    xhr.addEventListener('readystatechange', function() {
      if (this.readyState === 4) {
        try {
          handleResponse(xhr);
        } catch (e) {
          console.error('XHR response handler error:', e);
        }
      }
    });

    return xhr;
  }

  // 处理响应数据
  function handleResponse(xhr) {
    if (!xhr.url) return;

    let res;
    try {
      res = JSON.parse(xhr.responseText);
    } catch (e) {
      return;
    }

    if (xhr.url.includes('api/user/info') && user.vip === 1) {
      modifyUserInfo(res);
    } else if (xhr.url.includes('file/download_info') ||
      xhr.url.includes('share/download_info') ||
      xhr.url.includes('file/batch_download_info')) {
      modifyDownloadInfo(res, xhr.url);
    } else if (xhr.url.includes('user/report/info') && user.vip === 1) { // Added this check for user report info
      if (res && res.data) {
        // Ensure vipType, vipSub, developSub are consistent with the displayed VIP level
        res.data.vipType = user.pvip ? 3 : (user.svip ? 2 : 1);
        res.data.vipSub = user.pvip ? 3 : (user.svip ? 2 : 1);
        res.data.developSub = user.pvip ? 3 : (user.svip ? 2 : 1);
      }
    }


    // 更新响应
    if (res) {
      if (!xhr._responseModified) {
        xhr._responseModified = true;
        const responseText = JSON.stringify(res);

        // Re-define response and responseText properties to return the modified content
        Object.defineProperties(xhr, {
          'response': {
            configurable: true,
            enumerable: true,
            get: () => responseText
          },
          'responseText': {
            configurable: true,
            enumerable: true,
            get: () => responseText
          }
        });
      }
    }
  }

  // 修改用户信息
  function modifyUserInfo(res) {
    if (!res.data) return;

    res.data.Vip = true;
    // Corrected VipLevel logic
    res.data.VipLevel = user.pvip === 1 ? 3 : (user.svip === 1 ? 2 : 1);

    if (user.ad === 1) res.data.IsShowAdvertisement = false;

    // Ensure UserVipDetail exists for consistency
    if (!res.data.UserVipDetail) {
      res.data.UserVipDetail = {};
    }
    res.data.UserVipDetail.VipCode = res.data.VipLevel;


    if (user.pvip === 1) { // 长期会员
      res.data.VipExpire = "永久有效";
      res.data.UserVipDetail.UserPermanentVIPDetailInfos = [{
        VipDesc: "长期VIP会员",
        TimeDesc: " 永久有效",
        IsUse: true
      }];
      res.data.UserVipDetailInfos = []; // Clear other VIP infos if permanent
    } else if (user.svip === 1) { // 超级会员
      let time = new Date(user.endtime * 1000);
      res.data.VipExpire = time.toLocaleString();
      res.data.UserVipDetailInfos = [{
        VipDesc: "SVIP 会员",
        TimeDesc: time.toLocaleDateString() + " 到期",
        IsUse: time >= new Date()
      }];
    } else { // 普通会员
      let time = new Date(user.endtime * 1000);
      res.data.VipExpire = time.toLocaleString();
      res.data.UserVipDetailInfos = [{
        VipDesc: "VIP 会员",
        TimeDesc: time.toLocaleDateString() + " 到期",
        IsUse: time >= new Date()
      }];
    }

    if (user.name) res.data.Nickname = user.name;
    if (user.photo) res.data.HeadImage = user.photo;
    if (user.mail) res.data.Mail = user.mail;
    if (user.phone) res.data.Passport = Number(user.phone);
    if (user.id) res.data.UID = Number(user.id);
    if (user.level) res.data.GrowSpaceAddCount = Number(user.level);
  }

  // 修改下载信息
  function modifyDownloadInfo(res, url) {
    if (!res.data) return;

    let downloadUrl = res.data.DownloadUrl || res.data.DownloadURL;
    if (!downloadUrl) return;

    try {
      let originURL = new URL(downloadUrl);
      if (originURL.origin.includes("web-pro")) {
        let directURL = new URL(decodeURIComponent(atob(originURL.searchParams.get('params'))), originURL.origin);
        directURL.searchParams.set('auto_redirect', 0);
        originURL.searchParams.set('params', btoa(directURL.href));
        downloadUrl = originURL.href;
      } else {
        originURL.searchParams.set('auto_redirect', 0);
        let newURL = new URL('https://web-pro2.123952.com/download-v2/', originURL.origin);
        newURL.searchParams.set('params', btoa(encodeURI(originURL.href)));
        newURL.searchParams.set('is_s3', 0);
        downloadUrl = decodeURIComponent(newURL.href);
      }

      if (res.data.DownloadUrl) res.data.DownloadUrl = downloadUrl;
      if (res.data.DownloadURL) res.data.DownloadURL = downloadUrl;
    } catch (e) {
      console.error('Download URL modification error:', e);
    }
  }

  // 替换原始的XMLHttpRequest
  unsafeWindow.XMLHttpRequest = CustomXHR;

  // 重写fetch
  unsafeWindow.fetch = async function(url, options) {
    if (url.includes('web_logs') || url.includes('metrics')) {
      throw new Error('【123 云盘解锁】已屏蔽此数据收集器');
    }
    return originalFetch(url, options);
  };

  // 重写atob
  const originalAtob = unsafeWindow.atob;
  unsafeWindow.atob = function(str) {
    try {
      return originalAtob(decodeURIComponent(str));
    } catch (e) {
      return originalAtob(str);
    }
  };

  // 十连抽(bushi)：console.log(reddem(),reddem(),reddem(),reddem(),reddem(),reddem(),reddem(),reddem(),reddem(),reddem())
  let reddem = unsafeWindow.reddem = () => {
    const and = {
      os: "Android",
      vers: ["6.0", "7.1.2", "8.1.0", "9.0", "10.0"]
    };
    const ios = {
      os: "iOS",
      vers: ["12.0", "13.4", "14.0", "15.0"]
    };

    const devs = {
      "Apple": ios,
      "Xiaomi": and,
      "Samsung": and,
      "Huawei": {
        ...and,
        hmos: () => (Math.random() < 0.5 ? "HarmonyOS;" : ""),
        hmsCore: () => `HMScore ${Math.floor(Math.random() * 7) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 1000)};`
      },
      "Google": and,
      "Oneplus": and,
      "Vivo": and,
      "Oppo": and
    };

    const appXVers = [
      "2.1.3", "2.1.4",
      "2.3.1", "2.3.2", "2.3.4", "2.3.5",
      "2.3.6", "2.3.7", "2.3.8", "2.3.9",
      "2.3.12", "2.3.13", "2.3.14",
      "2.4.0", "2.4.1", "2.4.7"
    ];
    const appVers = [
      "38", "39",
      "42", "43", "44", "45",
      "46", "47", "48", "49",
      "50", "54", "55",
      "56", "61", "62", "69"
    ];
    const appXVer = appXVers[Math.floor(Math.random() * appXVers.length)];
    const appVer = appVers[appXVers.indexOf(appXVer)];

    const brands = Object.keys(devs);
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const {
      os,
      vers
    } = devs[brand];

    const osVer = vers[Math.floor(Math.random() * vers.length)];

    return {
      ua: `123pan/v${appXVer} (${os}_${osVer};${brand})`,
      version: Number(appVer),
      versionX: appXVer,
      osVersion: osVer,
      os: os,
      brand: brand
    }
  }

  // 格式化设置项
  const formatSetting = (key, value, comment) => {
    const item = document.createElement('div');
    item.style.cssText = `
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
    `;

    const keyElement = document.createElement('strong');
    keyElement.style.cssText = `
        color: #202124;
        margin-right: 10px;
        flex: 1;
    `;
    keyElement.textContent = `${key}:`;
    content.appendChild(keyElement);

    // 判断设置类型
    const isSwitch = typeof value === 'number' && (value === 0 || value === 1);
    const isEditable = ['用户名', '头像', '等级'].includes(key);

    if (isSwitch) {
      // 创建开关按钮
      const switchContainer = document.createElement('div');
      switchContainer.style.cssText = `
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
            background: ${value ? '#1a73e8' : '#ccc'};
            border-radius: 12px;
            transition: all 0.3s;
            cursor: pointer;
            flex-shrink: 0;
        `;

      const switchKnob = document.createElement('div');
      switchKnob.style.cssText = `
            position: absolute;
            top: 2px;
            left: ${value ? '22px' : '2px'};
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: all 0.3s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;

      switchContainer.appendChild(switchKnob);

      // 添加点击事件
      switchContainer.onclick = () => {
        let newValue = value === 1 ? 0 : 1;
        // 更新用户配置
        switch (key) {
          case 'VIP状态':
            user.vip = newValue;
            GM_setValue('vip', newValue);
            break;
          case 'SVIP显示':
            user.svip = newValue;
            GM_setValue('svip', newValue);
            // 如果 SVIP 关了，长期会员也应该关掉 (因为长期会员是 SVIP 的一个更高层级)
            if (newValue === 0 && user.pvip === 1) {
              user.pvip = 0;
              GM_setValue('pvip', 0);
            }
            break;
          case '长期会员显示':
            user.pvip = newValue;
            GM_setValue('pvip', newValue);
            // 如果长期会员开了，SVIP 必须是开的
            if (newValue === 1 && user.svip === 0) {
              user.svip = 1;
              GM_setValue('svip', 1);
            }
            break;
          case '广告控制':
            user.ad = newValue;
            GM_setValue('ad', newValue);
            break;
          case '屏蔽背景图':
            user.bg = newValue;
            GM_setValue('bg', newValue);
            // 立即应用背景图设置
            applyBackgroundSetting();
            break;
          case '调试模式':
            user.debug = newValue;
            GM_setValue('debug', newValue);
            break;
        }

        // 更新开关状态
        switchContainer.style.background = newValue ? '#1a73e8' : '#ccc';
        switchKnob.style.left = newValue ? '22px' : '2px';
        value = newValue; // Update local value

        // 刷新页面以应用更改
        location.reload();
      };

      content.appendChild(switchContainer);
    } else if (isEditable) {
      // 创建输入框
      const inputElement = document.createElement('input');
      inputElement.type = key === '等级' ? 'number' : 'text';
      inputElement.value = value;
      inputElement.style.cssText = `
            flex: 2;
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            width: 200px;
            transition: border-color 0.3s;
        `;

      if (key === '等级') {
        inputElement.min = 0;
        inputElement.max = 128;
      }

      // 添加输入框焦点效果
      inputElement.addEventListener('focus', () => {
        inputElement.style.borderColor = '#1a73e8';
      });

      inputElement.addEventListener('blur', () => {
        inputElement.style.borderColor = '#ddd';
      });

      // 添加保存按钮
      const saveButton = document.createElement('button');
      saveButton.textContent = '保存';
      saveButton.style.cssText = `
            padding: 6px 12px;
            background: #1a73e8;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 8px;
            transition: background 0.2s;
        `;

      saveButton.onmouseover = () => {
        saveButton.style.background = '#1557b0';
      };
      saveButton.onmouseout = () => {
        saveButton.style.background = '#1a73e8';
      };

      // 保存按钮点击事件
      saveButton.onclick = () => {
        let newValue = inputElement.value;
        if (key === '等级') {
          newValue = parseInt(newValue);
          if (isNaN(newValue) || newValue < 0 || newValue > 128) {
            alert('等级必须在 0-128 之间');
            return;
          }
        }

        // 更新配置
        switch (key) {
          case '用户名':
            user.name = newValue;
            GM_setValue('name', newValue);
            break;
          case '头像':
            user.photo = newValue;
            GM_setValue('photo', newValue);
            break;
          case '等级':
            user.level = newValue;
            GM_setValue('level', newValue);
            break;
        }

        // 显示保存成功提示
        const successTip = document.createElement('span');
        successTip.textContent = '已保存';
        successTip.style.cssText = `
                color: #188038;
                font-size: 12px;
                margin-left: 8px;
            `;
        content.appendChild(successTip);
        setTimeout(() => successTip.remove(), 2000);

        // 刷新页面以应用更改
        location.reload();
      };

      const inputContainer = document.createElement('div');
      inputContainer.style.cssText = `
            display: flex;
            align-items: center;
            flex: 2;
        `;
      inputContainer.appendChild(inputElement);
      inputContainer.appendChild(saveButton);
      content.appendChild(inputContainer);
    } else {
      // 非编辑项的显示
      const valueElement = document.createElement('span');
      valueElement.style.cssText = `
            color: ${typeof value === 'number' ? '#1a73e8' : '#188038'};
            font-weight: 500;
            word-break: break-all;
            text-align: right;
            flex: 2;
        `;
      valueElement.textContent = key === '过期时间' ? new Date(value * 1000).toLocaleString() : value;
      content.appendChild(valueElement);
    }

    item.appendChild(content);

    if (comment) {
      const commentElement = document.createElement('div');
      commentElement.style.cssText = `
            margin-top: 8px;
            font-size: 12px;
            color: #5f6368;
            line-height: 1.4;
        `;
      commentElement.textContent = comment;
      item.appendChild(commentElement);
    }

    return item;
  };
  // 添加背景图控制函数
  function applyBackgroundSetting() {
    if (user.bg === 1) {
      // 屏蔽背景图
      const style = document.createElement('style');
      style.id = 'bg-hide-style';
      style.textContent = `      .webbody, .svip-body {
        background-image: none !important;
      }
    `;
      document.head.appendChild(style);
    } else {
      // 恢复背景图
      const existingStyle = document.getElementById('bg-hide-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }

// 页面加载完成后应用背景图设置
  function waitForBodyAndApplyBg() {
    if (document.body) {
      applyBackgroundSetting();
    } else {
      setTimeout(waitForBodyAndApplyBg, 100);
    }
  }
  function createSettingsPanel() {
    // 检查是否已存在面板
    if (document.getElementById('vip-settings-panel')) {
      return;
    }

    // 创建面板容器
    const panel = document.createElement('div');
    panel.id = 'vip-settings-panel';
    panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(250, 250, 250, 0.98));
    backdrop-filter: blur(10px);
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    width: 520px;
    font-size: 14px;
    max-height: 85vh;
    overflow-y: auto;
    font-family: Arial, sans-serif;
    border: 1px solid rgba(230, 230, 230, 0.7);
    scrollbar-width: thin;
    scrollbar-color: #1a73e8 #f8f9fa;
`;

    // 创建标题
    const title = document.createElement('h3');
    title.textContent = '123云盘VIP设置面板';
    title.style.cssText = `
        margin: 0 0 15px 0;
        font-size: 18px;
        font-weight: bold;
        padding-bottom: 10px;
        border-bottom: 2px solid #e0e0e0;
        background: linear-gradient(135deg, #1a73e8, #1557b0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: 0.5px;
    `;
    panel.appendChild(title);

    // 创建设置列表
    const settingsList = document.createElement('div');
    settingsList.style.cssText = `
    display: grid;
    gap: 15px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
`;

    // 添加所有设置项
    const settings = [{
      key: 'VIP状态',
      value: user.vip,
      comment: '会员修改总开关'
    },
      {
        key: 'SVIP显示',
        value: user.svip,
        comment: '显示为超级会员 (关闭将自动关闭长期会员)'
      },
      {
        key: '长期会员显示',
        value: user.pvip,
        comment: '显示为长期会员 (开启将自动开启 SVIP 显示)'
      },
      {
        key: '广告控制',
        value: user.ad,
        comment: '关闭广告'
      },
      {
        key: '屏蔽背景图',
        value: user.bg,
        comment: '屏蔽网页背景图片'
      },
      {
        key: '用户名',
        value: user.name,
        comment: '自定义用户名'
      },
      {
        key: '头像',
        value: user.photo,
        comment: '自定义头像URL'
      },
      {
        key: '等级',
        value: user.level,
        comment: '成长容量等级(最高128)'
      },
      {
        key: '过期时间',
        value: user.endtime,
        comment: '会员过期时间'
      },
      {
        key: '调试模式',
        value: user.debug,
        comment: '调试信息显示级别'
      }
    ];

    settings.forEach(setting => {
      settingsList.appendChild(formatSetting(setting.key, setting.value, setting.comment));
    });

    panel.appendChild(settingsList);

    // 添加分隔线
    const divider = document.createElement('div');
    divider.style.cssText = `
        height: 1px;
        background: linear-gradient(to right, transparent, #e0e0e0, transparent);
        margin: 15px 0;
    `;
    panel.appendChild(divider);

    // 添加交流群按钮
    const groupButton = document.createElement('a');
    groupButton.href = 'https://qm.qq.com/cgi-bin/qm/qr?k=7j_1SXC6SUlOKqHfqVk2YMPrWSdf5Js7&jump_from=webapi&authKey=ih1vlkxMeQc9CxE18GjR2WN0x85OQoP7jB78/3UzeJ4hvXw3+eSUNeRMjHjS24lT';
    groupButton.target = '_blank';
    groupButton.style.cssText = `
        display: block;
        margin-top: 20px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #1a73e8, #1557b0);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 6px rgba(26, 115, 232, 0.3);
    `;

    // 添加图标和文字
    groupButton.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>加入交流群</span>
        </div>
    `;

    groupButton.onmouseover = () => {
      groupButton.style.transform = 'translateY(-2px)';
      groupButton.style.boxShadow = '0 4px 12px rgba(26, 115, 232, 0.4)';
    };

    groupButton.onmouseout = () => {
      groupButton.style.transform = 'translateY(0)';
      groupButton.style.boxShadow = '0 2px 6px rgba(26, 115, 232, 0.3)';
    };

    panel.appendChild(groupButton);

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        border: none;
        background: #f44336;
        color: white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        padding: 0;
        line-height: 1;
        transition: all 0.2s ease;
    `;

    closeButton.onmouseover = () => {
      closeButton.style.transform = 'rotate(90deg)';
      closeButton.style.background = '#d32f2f';
    };

    closeButton.onmouseout = () => {
      closeButton.style.transform = 'rotate(0)';
      closeButton.style.background = '#f44336';
    };

    closeButton.onclick = () => panel.remove();
    panel.appendChild(closeButton);

    // 添加自定义滚动条样式
    const style = document.createElement('style');
    style.textContent = `
        #vip-settings-panel::-webkit-scrollbar {
            width: 8px;
        }
        #vip-settings-panel::-webkit-scrollbar-track {
            background: #f8f9fa;
            border-radius: 4px;
        }
        #vip-settings-panel::-webkit-scrollbar-thumb {
            background: #1a73e8;
            border-radius: 4px;
        }
        #vip-settings-panel::-webkit-scrollbar-thumb:hover {
            background: #1557b0;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(panel);
  }

  function addTriggerButton() {
    const trigger = document.createElement('button');
    trigger.textContent = '设置面板';
    trigger.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 8px 16px;
        background: #1a73e8;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        z-index: 9998;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 2px 6px rgba(26, 115, 232, 0.3);
        transition: all 0.2s ease;
    `;

    trigger.onmouseover = () => {
      trigger.style.background = '#1557b0';
      trigger.style.boxShadow = '0 4px 8px rgba(26, 115, 232, 0.4)';
    };
    trigger.onmouseout = () => {
      trigger.style.background = '#1a73e8';
      trigger.style.boxShadow = '0 2px 6px rgba(26, 115, 232, 0.3)';
    };

    trigger.onclick = createSettingsPanel;
    document.body.appendChild(trigger);
  }

  // 使用 MutationObserver 来确保按钮添加到页面上
  function waitForBody() {
    if (document.body) {
      addTriggerButton();
    } else {
      setTimeout(waitForBody, 100);
    }
  }
  // 立即尝试执行
  waitForBody();
  // 应用背景图设置
  waitForBodyAndApplyBg();

  // 使用多种方式确保脚本执行
  document.addEventListener('DOMContentLoaded', waitForBody);
  window.addEventListener('load', waitForBody);

  // 立即尝试执行
  waitForBody();
})();
