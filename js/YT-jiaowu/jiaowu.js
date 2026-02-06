// ==UserScript==
// @name         全自动评教脚本
// @namespace    http://tampermonkey.net/
// @version      20260206
// @description  自动处理评教表单：选择未评条目、填充评分、提交表单、自动翻页（全流程添加1秒等待+填写后滚动到底部）
// @author       sjmy
// @match        http://10.252.6.31/jwglxt/xspjgl
// @updateURL    https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/YT-jiaowu/jiaowu.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 等待元素加载的工具函数
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const interval = 500;
            const maxTries = timeout / interval;
            let tries = 0;

            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (tries >= maxTries) {
                    reject(new Error(`超时未找到元素: ${selector}`));
                } else {
                    tries++;
                    setTimeout(checkElement, interval);
                }
            };

            checkElement();
        });
    }

    // 延迟执行函数（统一封装，方便修改）
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 滚动到页面最底部的函数
    function scrollToBottom() {
        // 方式1：滚动到文档最底部（兼容大部分场景）
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth' // 平滑滚动，可选：auto（立即滚动）
        });
        // 备用方式（防止上面的方式失效）
        setTimeout(() => {
            document.body.scrollTop = document.body.scrollHeight;
            document.documentElement.scrollTop = document.documentElement.scrollHeight;
        }, 300);
        console.log('已滚动到页面最底部');
    }

    // 处理单个评教表单的核心函数
    async function handleEvaluationForm() {
        try {
            // 1. 等待1秒，确保表单完全加载后再检测数据
            await sleep(1500);

            // 2. 查找所有100分单选框（检测表单数据）
            const radioList100 = document.querySelectorAll('input.radio-pjf[data-dyf="100"]');
            // 3. 查找所有90分单选框
            const radioList90 = document.querySelectorAll('input.radio-pjf[data-dyf="90"]');
            // 4. 查找所有textarea
            const textareaList = document.querySelectorAll('textarea');

            let radioCount = 0;
            let textareaCount = 0;

            // 检测到有表单数据才进行填写
            if (radioList100.length > 0 || textareaList.length > 0) {
                // 等待1秒，再开始填写表单
                await sleep(1500);

                // 处理单选框：全部先选100分
                if (radioList100.length > 0) {
                    radioList100.forEach((radio, index) => {
                        // 最后一个单选框选90分，其余选100分
                        if (index === radioList100.length - 1 && radioList90.length > 0) {
                            const lastRadio90 = radioList90[radioList90.length - 1];
                            lastRadio90.checked = true;
                            lastRadio90.dispatchEvent(new Event('change', { bubbles: true }));
                        } else {
                            radio.checked = true;
                            radio.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        radioCount++;
                    });
                }

                // 处理textarea：填充指定内容
                if (textareaList.length > 0) {
                    textareaList.forEach(textarea => {
                        textarea.value = "教学方式非常好";
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        textarea.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    textareaCount = textareaList.length;
                }

                console.log(`表单处理完成：选中${radioCount}个单选框，填充${textareaCount}个文本框`);

                // ========== 新增：填写表单后滚动到页面最底部 ==========
                scrollToBottom();
                // 等待滚动完成（300毫秒）
                await sleep(300);

                // 等待1秒，确保表单数据填写完成后再提交
                await sleep(1500);

                // 5. 点击提交按钮
                const submitBtn = await waitForElement('#btn_xspj_bc');
                submitBtn.click();
                console.log('点击提交按钮');

                // 6. 等待5秒（原需求的提交后等待）+ 额外1秒确保提交完成
                await sleep(6000);

                return true;
            } else {
                console.log('当前表单无需要填写的数据');
                await sleep(1500);
                return false;
            }
        } catch (error) {
            console.error('处理表单时出错：', error);
            alert(`处理表单失败：${error.message}`);
            return false;
        }
    }

    // 查找并点击未评的行
    async function findAndClickUnratedRow() {
        try {
            // 等待1秒，确保列表加载完成
            await sleep(1500);

            // 找到tempGrid表格中title="未评"的td所在的tr
            const unratedTd = document.querySelector('#tempGrid td[title="未评"]');
            if (unratedTd) {
                const unratedTr = unratedTd.closest('tr');
                if (unratedTr) {
                    console.log('找到未评条目，点击进入');
                    unratedTr.click();
                    // 等待1秒，确保跳转到表单页并加载完成
                    await sleep(1500);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('查找未评条目失败：', error);
            return false;
        }
    }

    // 切换到下一页
    async function goToNextPage() {
        try {
            // 等待1秒，确保分页控件加载完成
            await sleep(1500);

            // 检查下一页按钮是否可用（没有ui-state-disabled类）
            const nextPageBtn = document.querySelector('#next_pager');
            if (nextPageBtn && !nextPageBtn.classList.contains('ui-state-disabled')) {
                console.log('切换到下一页');
                nextPageBtn.click();
                // 等待1秒，确保下一页列表加载完成
                await sleep(1500);
                return true;
            } else {
                console.log('已到最后一页，没有下一页');
                return false;
            }
        } catch (error) {
            console.error('切换下一页失败：', error);
            return false;
        }
    }

    // 主流程函数
    async function mainProcess() {
        try {
            let hasMore = true;
            let processedCount = 0;

            while (hasMore) {
                // 1. 查找未评的行
                const foundUnrated = await findAndClickUnratedRow();
                if (foundUnrated) {
                    // 2. 处理评教表单
                    const formHandled = await handleEvaluationForm();
                    if (formHandled) {
                        processedCount++;
                        console.log(`已处理${processedCount}个表单`);
                        // 等待1秒，确保返回列表页并加载完成
                        await sleep(1500);
                    } else {
                        // 表单处理失败/无数据，停止流程
                        break;
                    }
                } else {
                    // 当前页没有未评条目，尝试翻页
                    const nextPage = await goToNextPage();
                    if (!nextPage) {
                        // 没有下一页，结束流程
                        hasMore = false;
                    }
                }
            }

            // 所有表单处理完成
            alert(`评教完成！共处理了${processedCount}个表单`);
        } catch (error) {
            console.error('主流程出错：', error);
            alert(`评教过程中出错：${error.message}`);
        }
    }

    // 创建启动按钮
    const startBtn = document.createElement('button');
    startBtn.textContent = '开始全自动评教';
    startBtn.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 9999;
        padding: 12px 24px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;

    // 按钮点击事件：启动主流程
    startBtn.onclick = async function() {
        // 禁用按钮，防止重复点击
        startBtn.disabled = true;
        startBtn.textContent = '评教中...';
        // 启动主流程前等待1秒
        await sleep(1500);
        await mainProcess();
        // 恢复按钮状态
        startBtn.disabled = false;
        startBtn.textContent = '开始全自动评教';
    };

    // 将按钮添加到页面
    document.body.appendChild(startBtn);

})();