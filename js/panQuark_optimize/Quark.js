// ==UserScript==
// @name         Quark网盘优化
// @namespace    https://github.com/shenjingmayi/bug/js
// @version      20260217
// @description  优化Quark网盘使用体验，自动聚焦密码框，移除会员入口
// @author       sjmy
// @match        *://pan.quark.cn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=quark.cn
// @supportURL   https://github.com/shenjingmayi/bug/issues
// @updateURL    https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/panQuark_optimize/Quark.js
// @downloadURL  https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/panQuark_optimize/Quark.js
// @grant        none
// @license      Apache License 2.0
// @license      Custom License - See https://github.com/shenjingmayi/bug/blob/main/LICENSE
// ==/UserScript==

(function () {
  "use strict";
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
    }

    // 检查元素是否已存在，不存在则轮询等待
    let checkInterval = setInterval(() => {
      if (handleInputElement()) {
        // 找到并处理完成后清除定时器
        clearInterval(checkInterval);
      }
    }, 300); // 每300毫秒检查一次

    // 最多检查2秒，防止无限循环
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 2000);
  }
  // 监听 hash 变化
  function onhashChange(callback) {
    // 监听 hash 变化
    window.addEventListener("hashchange", callback);

    // 劫持 pushState 和 replaceState
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      callback();
    };
  }
  // 监听 history 变化
  function onhistoryChange(callback) {
    // 监听 history 变化
    window.addEventListener("popstate", callback);

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      callback();
    };
  }
  function doOnHashChange(callback) {
    callback();
    onhistoryChange(callback);
  }
  // 添加全局样式函数
  function addStyle(css) {
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  // 输入密码框自动选中
  operate(".ant-input", (input) => {
    input.setAttribute("autofocus", "autofocus");
    input.focus();
    input.select();
  });

  // 操作按钮左对齐 - 使用 CSS 注入替代 JS 操作，以支持动态加载和多元素
  addStyle(`
    
    .file-list-breadcrumb,
    .btn-operate {
      justify-content: flex-start !important;
    }
    .file-list .hover-oper {
      display: flex !important;
      .hover-transparent-bg {
        background: transparent !important;
      }
      .hover-oper-list{
        background-color: transparent !important;
      }
    }
    
  `);

  //ant-table-row ant-table-row-level-0 ant-dropdown-trigger
  // 强制保持 class 的函数（用于防止 hover 移除 class）
  function keepClass(selector, className) {
    // 定义观察器回调
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // 1. 监听新加入的节点
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // 元素节点
              // 检查节点本身
              if (node.matches(selector)) {
                node.classList.add(className);
              }
              // 检查子节点
              node.querySelectorAll(selector).forEach((el) => {
                el.classList.add(className);
              });
            }
          });
        }
        // 2. 监听 class 属性变化
        else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.matches(selector) && !target.classList.contains(className)) {
            // 如果 class 被移除，立即加回去
            target.classList.add(className);
          }
        }
      });
    });

    // 开始观察整个文档主体
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'] // 只监听 class 变化
    });

    // 初始执行一次
    document.querySelectorAll(selector).forEach(el => el.classList.add(className));
  }

  // 这里的 '.ant-table-row' 是示例选择器，请根据实际情况修改
  // 如果你需要保持 'hover-oper-show' 这个 class，请取消注释并确认选择器
  // keepClass('.ant-table-row', 'hover-oper-show');

  doOnHashChange(() => {
    // 移除会员入口
    operate(".pc-member-entrance", (element) => {
      if (element.previousElementSibling) {
        element.previousElementSibling.style.marginRight = "20px";
      }
      element.remove();
    });

    // 移除右上角下载应用按钮
    operate(".file-search-box", (element) => {
      function removeNextSibling(element) {
        // 递归移除所有后续元素
        if (element.nextElementSibling) {
          removeNextSibling(element.nextElementSibling);
          // 移除当前元素的下一个兄弟元素
          element.nextElementSibling.remove();
        }
      }
      removeNextSibling(element);
    });
  });
})();
