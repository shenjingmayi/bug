// ==UserScript==
// @name         移动云盘优化
// @namespace    https://github.com/shenjingmayi/bug/js
// @version      20250823
// @description  优化移动云盘使用体验，移除右上角会员及广告
// @author       sjmy
// @match        *://yun.139.com/w/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yun.139.com
// @supportURL   https://github.com/shenjingmayi/bug/issues
// @updateURL    https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/139yun/移动云盘优化.js
// @downloadURL  https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/139yun/移动云盘优化.js
// @grant        none
// @run-at       document-end
// @license      Apache License 2.0
// @license      Custom License - See https://github.com/shenjingmayi/bug/blob/main/LICENSE
// ==/UserScript==

(function() {
  'use strict';

  // 操作元素函数
  function operate(querySelector, operateFn) {
    // 寻找目标输入框并处理
    function handleInputElement() {
      // 通过类名选择器获取输入框
      const element = document.querySelector(querySelector);
      if (element) {
        // 执行操作函数
        operateFn(element);
        // 防止重复处理
        return true;
      }
      return false;
    };

    // 检查元素是否已存在，不存在则轮询等待
    let checkInterval = setInterval(() => {
      if (handleInputElement()) {
        // 找到并处理完成后清除定时器
        clearInterval(checkInterval);
      }
    }, 300); // 每300毫秒检查一次

    // 最多检查30秒，防止无限循环
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  };

  // 移除右上角会员及广告
  function removeAdElements() {
    operate(".fr.adv-wrap", (element) => {
      console.log('移除广告元素:', element);
      element.remove();
    });
  }

  // 使用 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver(function(mutations) {
    let shouldRemoveAds = false;

    mutations.forEach(function(mutation) {
      // 检查是否有新添加的节点
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldRemoveAds = true;
      }
    });

    // 如果有 DOM 变化，重新执行移除广告操作
    if (shouldRemoveAds) {
      removeAdElements();
    }
  });

  // 开始观察 DOM 变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 初始执行
  removeAdElements();

  // 同时保留 hashchange 监听（以防某些情况下仍然有效）
  window.addEventListener('hashchange', function() {
    console.log("路径发生变化");
    removeAdElements();
  });

})();
