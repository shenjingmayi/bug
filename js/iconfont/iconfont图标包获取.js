// ==UserScript==
// @name         iconfont图标集合下载器
// @namespace    https://github.com/shenjingmayi/sjmy/js
// @version      20250823
// @description  自动获取整个iconfont集合的完整图标包，目前仅支持图标，不支持3D等其他类型。
// @author       sjmy
// @match        *://www.iconfont.cn/collections/detail*
// @require      https://cdn.jsdelivr.net/npm/jszip@3.2.2/dist/jszip.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @license      Apache License 2.0
// @icon         data:image/svg+xml;charset=utf-8;base64,Cjxzdmcgd2lkdGg9IjgzIiBoZWlnaHQ9IjgyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48ZGVmcz48cGF0aCBkPSJNMS44MTEgNC4yOWMtLjQ5OS40MzYtLjk2Ni44OTUtMS40IDEuMzc0YS4yODMuMjgzIDAgMCAwIC4wNi40MjdsMjcuNDUzIDE3LjQ2MmMuMTYuMTAyLjM3OC4wNC40NTUtLjEzM2ExNi40NzggMTYuNDc4IDAgMCAwLTMuNDQ0LTE4LjM1N0MyMS42NzUgMS43OTYgMTcuMzE5LjE0NSAxMi45NTQuMTQ1Yy0zLjk4MSAwLTcuOTcgMS4zNzMtMTEuMTQzIDQuMTQ0IiBpZD0iYSIvPjxwYXRoIGQ9Ik01LjI2IDUuMDM0QTE2LjQ4IDE2LjQ4IDAgMCAwIDEuODE0IDIzLjM5YS4zMTUuMzE1IDAgMCAwIC40NTUuMTM0TDI5LjcyMyA2LjA2MmEuMjgyLjI4MiAwIDAgMCAuMDYtLjQyOCAxNi42NSAxNi42NSAwIDAgMC0xLjQtMS4zNzRDMjUuMjEgMS40ODggMjEuMjIuMTE1IDE3LjI0LjExNWMtNC4zNjUgMC04LjcyMSAxLjY1MS0xMS45OCA0LjkxOSIgaWQ9ImQiLz48cGF0aCBpZD0iZyIgZD0iTTAgLjQyNGg4MS4wNzFWODAuNDFILjAwMXoiLz48bGluZWFyR3JhZGllbnQgeDE9IjIxLjgzOCUiIHkxPSIxNy4xMzQlIiB4Mj0iOTkuOTQ4JSIgeTI9Ijc4LjU4OSUiIGlkPSJiIj48c3RvcCBzdG9wLWNvbG9yPSIjMDBGOUU0IiBvZmZzZXQ9IjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iIzQ5NTRGRiIgb2Zmc2V0PSIxMDAlIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgeDE9Ijc4LjE2MyUiIHkxPSIxNy4xMzMlIiB4Mj0iLjA1MiUiIHkyPSI3OC41ODklIiBpZD0iZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzAwRjlFNCIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiM0OTU0RkYiIG9mZnNldD0iMTAwJSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTc0LjQ0NyA0NC4xOWMuNTMyLjcxLjc5MyAxLjU3OC43NTUgMi40Ni0uNzQ4IDE3Ljk3My0xNS43MzggMzIuMzE3LTM0LjExNyAzMi4zMTctMTguMzc0IDAtMzMuMzU5LTE0LjMzNC0zNC4xMTgtMzIuM2EzLjgyOSAzLjgyOSAwIDAgMSAuNzc2LTIuNDg1TDM4LjI4OSA0LjE1M2MxLjU1LTIuMDMyIDQuNjQ0LTIuMDE5IDYuMTc3LjAyNkw3NC40NDcgNDQuMTlaIiBmaWxsPSIjMDBGOUU1Ii8+PHBhdGggZD0iTTMwLjE1NiA1Ny40NTJjLTYuODg2IDYuMTY4LTE3LjUzIDUuNjUzLTIzLjc3NC0xLjE1Qy4xNCA0OS41MDIuNjYgMzguOTg3IDcuNTQ2IDMyLjgyYzYuODg2LTYuMTY4IDE3LjUzLTUuNjUzIDIzLjc3NCAxLjE0OSA2LjI0MyA2LjgwMiA1LjcyMiAxNy4zMTctMS4xNjQgMjMuNDg0IiBmaWxsPSIjRkZGIi8+PHBhdGggZD0iTTEyLjc2NyAzOC40NThhOC43MjIgOC43MjIgMCAwIDAtLjYxNiAxMi40MjdjMy4zMDQgMy42IDguOTM2IDMuODcgMTIuNTguNjA4YTguNzQ3IDguNzQ3IDAgMCAwIDIuNTAxLTMuODMzbC0xNC40NjUtOS4yMDJaIiBmaWxsPSIjMUUxRTFFIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNS44OTIgMjguMzkpIj48bWFzayBpZD0iYyIgZmlsbD0iI2ZmZiI+PHVzZSB4bGluazpocmVmPSIjYSIvPjwvbWFzaz48cGF0aCBkPSJNMS44MTEgNC4yOWMtLjQ5OS40MzYtLjk2Ni44OTUtMS40IDEuMzc0YS4yODMuMjgzIDAgMCAwIC4wNi40MjdsMjcuNDUzIDE3LjQ2MmMuMTYuMTAyLjM3OC4wNC40NTUtLjEzM2ExNi40NzggMTYuNDc4IDAgMCAwLTMuNDQ0LTE4LjM1N0MyMS42NzUgMS43OTYgMTcuMzE5LjE0NSAxMi45NTQuMTQ1Yy0zLjk4MSAwLTcuOTcgMS4zNzMtMTEuMTQzIDQuMTQ0IiBmaWxsPSJ1cmwoI2IpIiBtYXNrPSJ1cmwoI2MpIi8+PC9nPjxwYXRoIGQ9Ik01MS44NDYgNTcuNDIyYzYuODg2IDYuMTY3IDE3LjUzIDUuNjU0IDIzLjc3My0xLjE0OSA2LjI0NC02LjgwMiA1LjcyMi0xNy4zMTYtMS4xNjMtMjMuNDg0LTYuODg2LTYuMTY4LTE3LjUzLTUuNjUzLTIzLjc3NCAxLjE1LTYuMjQ0IDYuODAxLTUuNzIzIDE3LjMxNSAxLjE2NCAyMy40ODMiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNNjkuMjM1IDM4LjQyOGE4LjcyMyA4LjcyMyAwIDAgMSAuNjE2IDEyLjQyN2MtMy4zMDUgMy42LTguOTM3IDMuODcyLTEyLjU4LjYwOGE4LjczOCA4LjczOCAwIDAgMS0yLjUwMS0zLjgzM2wxNC40NjUtOS4yMDJaIiBmaWxsPSIjMUUxRTFFIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDUuOTE2IDI4LjM5KSI+PG1hc2sgaWQ9ImYiIGZpbGw9IiNmZmYiPjx1c2UgeGxpbms6aHJlZj0iI2QiLz48L21hc2s+PHBhdGggZD0iTTUuMjYgNS4wMzRBMTYuNDggMTYuNDggMCAwIDAgMS44MTQgMjMuMzlhLjMxNS4zMTUgMCAwIDAgLjQ1NS4xMzRMMjkuNzIzIDYuMDYyYS4yODIuMjgyIDAgMCAwIC4wNi0uNDI4IDE2LjY1IDE2LjY1IDAgMCAwLTEuNC0xLjM3NEMyNS4yMSAxLjQ4OCAyMS4yMi4xMTUgMTcuMjQuMTE1Yy00LjM2NSAwLTguNzIxIDEuNjUxLTExLjk4IDQuOTE5IiBmaWxsPSJ1cmwoI2UpIiBtYXNrPSJ1cmwoI2YpIi8+PC9nPjxwYXRoIGQ9Im01LjEyNCAzMy4wMS4wMDMtLjAwM3YtLjAwMWwtLjAwMy4wMDVaIiBmaWxsPSIjMEM2MDY2Ii8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLjQ2NSAuMjQ2KSI+PG1hc2sgaWQ9ImgiIGZpbGw9IiNmZmYiPjx1c2UgeGxpbms6aHJlZj0iI2ciLz48L21hc2s+PHBhdGggZD0iTTczLjk5NCA1NC45ODhjLTIuNzM5IDIuOTg0LTYuNDkgNC43MzUtMTAuNTYzIDQuOTMyYTE1LjI3NCAxNS4yNzQgMCAwIDEtMTEtMy44OSAxNS4wNTMgMTUuMDUzIDAgMCAxLTIuOTU1LTMuNjJsMjUuNjMtMTYuMzA0YzQuMDc4IDUuNjQ1IDMuNzkyIDEzLjU0LTEuMTEyIDE4Ljg4Mm0tMTEuMTggMTMuNDQxYy02LjAzMyA1LjczMS0xMy45NjYgOC44ODgtMjIuMzM4IDguODg4LTguMzcgMC0xNi4zMDEtMy4xNTUtMjIuMzMzLTguODgzYTMyLjA5MiAzMi4wOTIgMCAwIDEtNS4wNDUtNi4xNDhjMS43MjMuNTA3IDMuNTA4Ljc2NyA1LjI5Ny43NjcgNC40MDkgMCA4LjgzMi0xLjU1MiAxMi4zNDgtNC43YTE4LjA4IDE4LjA4IDAgMCAwIDQuMzY3LTUuODk3IDEuODQgMS44NCAwIDAgMCAuMTQyLS4yNThsLjAwNC0uMDA5YTE4LjA1MyAxOC4wNTMgMCAwIDAgMS41NDMtNy4zMDVjLjAwMi00LjU5MS0xLjc1Ny05LjIxNS01LjMxLTEyLjc3NGExOC4xNjcgMTguMTY3IDAgMCAwLTUuMTc2LTMuNjI4bC0uMDY4LS4wMzRjLS4wOTQtLjA0My0uMTg5LS4wODItLjI4NC0uMTI0LTEuMi0uNTM1LTIuNDYzLS45NC0zLjc2NS0xLjIxTDM4Ljk0NCA0LjQwMmEyLjIzNyAyLjIzNyAwIDAgMSAxLjc5Ni0uODg1aC4wMWEyLjIzOSAyLjIzOSAwIDAgMSAxLjc5OC45bDE2LjQxNiAyMi42NDdjLTEuMzM1LjI3LTIuNjI2LjY4Mi0zLjg1NCAxLjIyOS0uMDk1LjA0Mi0uMTkuMDgxLS4yODQuMTI1LS4wMjMuMDEtLjA0NS4wMjItLjA2OC4wMzMtMS44ODMuODgtMy42NCAyLjA5LTUuMTc1IDMuNjI4YTE4LjAzMiAxOC4wMzIgMCAwIDAtMy43NjYgMjAuMDh2LjAwM2MuMDQuMDkyLjA5LjE4LjE0NS4yNjJhMTguMDg5IDE4LjA4OSAwIDAgMCA0LjM2NiA1Ljg5OGMzLjUxNiAzLjE0OSA3Ljk0IDQuNyAxMi4zNDggNC43IDEuNzQ3IDAgMy40OS0uMjQ5IDUuMTc0LS43MzNhMzIuMDU1IDMyLjA1NSAwIDAgMS01LjAzNyA2LjE0TTUuOTY1IDM2LjEzNWwyNS42MyAxNi4zMDNhMTUuMDQgMTUuMDQgMCAwIDEtMi45NTUgMy42MiAxNS4yNzEgMTUuMjcxIDAgMCAxLTExIDMuODljLTQuMDczLS4xOTYtNy44MjQtMS45NDctMTAuNTYzLTQuOTMxLTQuOTA0LTUuMzQzLTUuMTktMTMuMjM3LTEuMTEyLTE4Ljg4Mm0yLjMyMi0yLjUzMmMyLjg3LTIuNTA4IDYuNDc4LTMuNzUxIDEwLjA5NC0zLjc1MyAzLjQ2Ny4wMDIgNi45MTUgMS4xNDUgOS42OTcgMy40MWwuMDExLjAwOGMuMzg3LjMxNS43Ni42NTMgMS4xMTkgMS4wMTJsLjA0NS4wNDRjLjM0Ni4zNDguNjY5LjcwNy45NzMgMS4wNzdsLjA3NS4wOWMuMjkyLjM2MS41NjQuNzMzLjgxNyAxLjExMWwuMDgzLjEyNGMuMjQuMzY5LjQ2My43NDUuNjY4IDEuMTI5bC4wOTIuMTczYy4xOTIuMzcuMzY3Ljc0OC41MjYgMS4xM2wuMDkxLjIyMmMuMTQ3LjM3Mi4yNzguNzQ4LjM5NCAxLjEyNmwuMDc5LjI2MmExNC43OTQgMTQuNzk0IDAgMCAxIC40OTMgMi41MzdsLjAzLjMwNGExNS42NjcgMTUuNjY3IDAgMCAxIC4wMTYgMi4zN2MtLjAwNy4xMDYtLjAyLjIxLS4wMy4zMTVhMTQuOTk5IDE0Ljk5OSAwIDAgMS0uNjYyIDMuMjE4bC0uMDEuMDMxTDguMTAxIDMzLjc3N2MuMDYzLS4wNTcuMTIxLS4xMTcuMTg2LS4xNzNtNTQuNDA0LTMuNzgyYzMuNjE1IDAgNy4yMjIgMS4yNDQgMTAuMDkzIDMuNzUyLjA2NS4wNTcuMTI0LjExNi4xODcuMTczTDQ4LjE4MyA0OS41MTRhMTQuOTQgMTQuOTQgMCAwIDEtLjY2OS0zLjIzMWMtLjAxMi0uMTE0LS4wMjUtLjIyNi0uMDM0LS4zMzlhMTUuMDY4IDE1LjA2OCAwIDAgMS0uMDM2LTEuMjU4IDE1LjU2IDE1LjU2IDAgMCAxIC4wODQtMS40MTggMTQuOTg1IDE0Ljk4NSAwIDAgMSAxLjU3OC01LjI2MmwuMS0uMTg4Yy4yMDQtLjM3OC40MjItLjc1LjY2LTEuMTE1bC4wOTItLjEzN2MuMjUxLS4zNzQuNTItLjc0Mi44MS0xLjEuMDI2LS4wMzMuMDU1LS4wNjUuMDgyLS4wOTguMzAyLS4zNjcuNjIzLS43MjUuOTY2LTEuMDdsLjA1LS4wNWMuMzU4LS4zNTcuNzMtLjY5MyAxLjExNC0xLjAwN2wuMDE1LS4wMTJjMi43ODItMi4yNjMgNi4yMy0zLjQwNyA5LjY5Ni0zLjQwN20xMy44NyAzLjExM2ExLjU1NCAxLjU1NCAwIDAgMC0uMTUtLjIwMiAxOC41NzQgMTguNTc0IDAgMCAwLTEuNTMtMS41Yy0uMTQ5LS4xMy0uMzA4LS4yNDItLjQ2LS4zNjdsLS4yNjUtLjIxYTE4LjM1NyAxOC4zNTcgMCAwIDAtMy4zMS0yLjA4NmMtLjA5Mi0uMDQ1LS4xODItLjA5NC0uMjc3LS4xMzhhMTguMDgyIDE4LjA4MiAwIDAgMC0xLjQyLS41OTJsLS4wNTUtLjAyMWExOC41MjYgMTguNTI2IDAgMCAwLTYuNTUtMS4xMjhMNDUuMDYzIDIuNTc3YTUuMzU1IDUuMzU1IDAgMCAwLTQuMy0yLjE1M2gtLjAyNWMtMS43MDUgMC0zLjI3Ljc3LTQuMjk2IDIuMTE2TDE4LjYwOSAyNi43MjNhMTguNTI4IDE4LjUyOCAwIDAgMC04LjEwNyAxLjczOWMtLjA5NC4wNDMtLjE4Ni4wOTMtLjI4LjEzOWExNy44MzQgMTcuODM0IDAgMCAwLTEuNzAzLjk1MSAxNy44OTUgMTcuODk1IDAgMCAwLTEuNjA3IDEuMTM2Yy0uMDg3LjA3LS4xNzUuMTM4LS4yNjEuMjA5LS4xNTMuMTI0LS4zMTIuMjM2LS40NjEuMzY2YTE4LjU1IDE4LjU1IDAgMCAwLTEuNTI5IDEuNDk5Yy0uMDU4LjA2NC0uMTA1LjEzNC0uMTUzLjIwNC02LjAzMyA2Ljg0My02LjA3IDE3LjI0NS4yNSAyNC4xM2ExOC4yOTMgMTguMjkzIDAgMCAwIDMuNjE4IDMuMDM5IDM0Ljk0MiAzNC45NDIgMCAwIDAgNy41OTYgMTAuNTNjNi42MTkgNi4yODQgMTUuMzIgOS43NDUgMjQuNTA0IDkuNzQ1IDkuMTg2IDAgMTcuODktMy40NjMgMjQuNTA4LTkuNzUxYTM0Ljk0NiAzNC45NDYgMCAwIDAgNy41NTQtMTAuNDUgMTguMzQzIDE4LjM0MyAwIDAgMCAzLjc3Ni0zLjE0M2M2LjMyLTYuODg1IDYuMjgzLTE3LjI4OC4yNDgtMjQuMTMiIGZpbGw9IiMwQzYwNjYiIG1hc2s9InVybCgjaCkiLz48L2c+PHBhdGggZD0ibTc2Ljg3NSAzMi45NzguMDAzLjAwMy0uMDAzLS4wMDNaIiBmaWxsPSIjMEM2MDY2Ii8+PC9nPjwvc3ZnPg==
// @supportURL   https://github.com/shenjingmayi/sjmy/issues
// @updateURL    https://cdn.jsdelivr.net/gh/shenjingmayi/sjmy@main/js/iconfont/iconfont图标包获取.js
// @downloadURL  https://cdn.jsdelivr.net/gh/shenjingmayi/sjmy@main/js/iconfont/iconfont图标包获取.js
// ==/UserScript==

(function() {
  'use strict';
  const createControlPanel = () => {
    const panel = document.createElement('div');
    GM_addStyle(`
            #sjmy-dl-panel {
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 9999;
                background: rgba(255,255,255,0.0);
				padding: 10px !important;
				min-width: 150px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            #sjmy-dl-btn {
                background: #1890ff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s;
				padding: 6px 12px !important;
				font-size: 13px !important;
				width: auto !important;
				box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            #sjmy-dl-btn:disabled {
                background: #8c8c8c;
                cursor: not-allowed;
            }
			#sjmy-dl-btn:after {
				content: '';
				display: inline-block;
				margin-left: 8px;
				width: 8px;
				height: 8px;
				border-radius: 50%;
			}
			#sjmy-dl-btn[disabled]:after {
				background: #ff4d4f;
			}
			#sjmy-dl-btn:not([disabled]):after {
				background: #52c41a;
			}
        `);
    panel.id  = 'sjmy-dl-panel';
    return panel;
  };
  const sanitizeFilename = (name) => {
    return name.replace(/[\\/:"*?<> |]/g, '_');
  };
  const createAuthorLinkFile = (creator) => {
    const content = [
      '[InternetShortcut]',
      `URL=https://www.iconfont.cn/user/detail?userViewType=collections&uid=${creator.id}&nid=${creator.nid}`
    ].join('\n');
    return {
      name: `作者主页-${sanitizeFilename(creator.nickname)}.url`,
      content: content
    };
  };
  const createCollectionInfoFile = (data, cid) => {
    const meta = data.collection;
    const creator = data.creator  || {};
    const infoContent = [
      `集合链接：https://www.iconfont.cn/collections/detail?cid=${cid}`,
      `集合名称：${meta.name  || '未命名集合'}`,
      `作者：${creator.nickname  || '匿名作者'}`,
      `作者简介：${(creator.bio  || '暂无简介').replace(/\n/g, ' ')}`,
      `集合内图片数量：${meta.icons_count  || '未获取到信息'}`,
      `版权类型：${meta.copyright  === 'original' ? '原创' : '非原创'}`,
      `是否收费：${meta.fees  === 'free' ? '免费' : '付费'}`
    ].join('\n\n');
    return {
      name: '集合基本信息.txt',
      content: infoContent
    };
  };
  const main = async () => {
    const panel = createControlPanel();
    const btn = document.createElement('button');
    btn.id  = 'sjmy-dl-btn';
    btn.innerHTML  = '初始化中...';
    btn.disabled  = true;
    panel.appendChild(btn);
    document.body.appendChild(panel);
    try {
      const cid = new URLSearchParams(window.location.search).get('cid')  || location.pathname.split('/').pop();
      if (!cid) throw new Error('CID_NOT_FOUND');
      btn.innerHTML  = '准备下载';
      btn.disabled  = false;
      btn.onclick  = async () => {
        btn.innerHTML  = '获取数据中...';
        btn.disabled  = true;
        try {
          const response = await fetch(`https://www.iconfont.cn/api/collection/detail.json?id=${cid}`);
          if (!response.ok)  throw new Error('API_ERROR');
          const { data } = await response.json();
          const collectionName = sanitizeFilename(data.collection?.name  || `collection-${cid}`);
          const feeStatus = data.collection?.fees  === 'free' ? '免费' : '付费';
          const fileName = `${collectionName}-${feeStatus}`;
          const zip = new JSZip();
          data.icons.forEach((icon,  index) => {
            zip.file(`${sanitizeFilename(icon.name  || `icon-${index}`)}.svg`, icon.show_svg);
          });
          if (data.creator)  {
            const authorFile = createAuthorLinkFile(data.creator);
            zip.file(authorFile.name,  authorFile.content);
          }
          const infoFile = createCollectionInfoFile(data, cid);
          zip.file(infoFile.name,  infoFile.content);
          btn.innerHTML  = '打包中...';
          const content = await zip.generateAsync({  type: 'blob' });
          const link = document.createElement('a');
          link.download  = `${fileName}.zip`;
          link.href  = URL.createObjectURL(content);
          link.click();

          btn.innerHTML  = '下载完成✔';
          setTimeout(() => {
            btn.innerHTML  = '重新下载';
            btn.disabled  = false;
          }, 2000);
        } catch (e) {
          console.error('[ 下载器错误]', e);
          btn.innerHTML  = `失败: ${e.message}`;
          setTimeout(() => {
            btn.innerHTML  = '重试下载';
            btn.disabled  = false;
          }, 2000);
        }
      };
    } catch (e) {
      btn.innerHTML  = '初始化失败';
      console.error('[ 初始化错误]', e);
    }
  };
  if (typeof JSZip !== 'undefined') {
    main();
  } else {
    window.addEventListener('load',  main);
  }
})();
