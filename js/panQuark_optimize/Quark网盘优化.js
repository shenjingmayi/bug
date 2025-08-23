// ==UserScript==
// @name         Quark网盘优化
// @namespace    http://tampermonkey.net/
// @version      2025-08-23
// @description  try to take over the world!
// @author       sjmy
// @match        *://pan.quark.cn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=quark.cn
// @grant        none
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

  // 输入密码框自动选中
  operate('.ant-input', (input) => {
    input.setAttribute('autofocus', 'autofocus');
    input.focus();
    input.select();
  });

  // 操作按钮左对齐
  operate(".btn-operate", (element) => {
    element.style.justifyContent = "flex-start";
  });

  // 移除会员入口
  operate(".pc-member-entrance", (element) => {
    console.log(element)
    if (element.previousElementSibling) {
      element.previousElementSibling.style.marginRight = "20px";
    }
    element.remove();
  });

})();