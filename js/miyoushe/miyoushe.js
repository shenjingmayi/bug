// ==UserScript==
// @name         米游社改造计划
// @namespace    https://github.com/shenjingmayi/bug/tree/main/js
// @version      20260209
// @description  优化恢复逻辑，解决顶部模式冲突及元素堆叠问题
// @license      Apache License 2.0
// @author       sjmy
// @match        *://*.miyoushe.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=miyoushe.com
// @supportURL   https://github.com/shenjingmayi/bug/issues
// @updateURL    https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/miyoushe/miyoushe.js
// @downloadURL  https://cdn.jsdelivr.net/gh/shenjingmayi/bug@main/js/miyoushe/miyoushe.js
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. 配置管理 ---
    const defaultConfig = {
        removeSpacing: false,
        topBarOptimize: false,
        removeSidebar: false,
        removeCreatorAction: false,
        removeAuthorInfo: false,
        removePromotion: false,
        removeGameTools: false,
        removeAdCarousel: false,
        enableTitleFilter: false,
        hideSidebarByTitle: '',
        removeBottomCard: false,
        removeRocket: false,
        removeLeftActions: false,
        removeFooter: false,
        enableCustomWidth: false,
        layoutWidth: '1000',
        mainWidth: '700',
        navBarConfig: {}
    };

    let config = GM_getValue('mys_enhancer_config', defaultConfig);
    let isApplying = false; // 防止 MutationObserver 递归

    function saveConfig() {
        GM_setValue('mys_enhancer_config', config);
        applyChanges();
    }

    // --- 2. 样式注入 ---
    GM_addStyle(`
        /* 基础控制面板 UI */
        #mys-helper-btn {
            position: fixed; bottom: 20px; left: 20px; z-index: 9999;
            width: 42px; height: 42px; background: #00c3ff; color: white;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,0.3); font-size: 20px;
        }
        #mys-helper-menu {
            position: fixed; bottom: 75px; left: 20px; z-index: 9999;
            background: white; border-radius: 12px; padding: 18px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2); display: none;
            max-height: 80vh; overflow-y: auto; width: 340px;
            border: 1px solid #eaeaea; font-family: system-ui, -apple-system, sans-serif;
        }
        #mys-helper-menu h3 { margin: 0 0 15px 0; font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #00c3ff; padding-bottom: 8px; }
        .mys-menu-item { margin-bottom: 12px; display: flex; align-items: center; font-size: 14px; color: #444; }
        .mys-menu-item input[type="checkbox"] { margin-right: 10px; cursor: pointer; }
        .mys-menu-item label { cursor: pointer; flex: 1; }
        .mys-sub-panel { padding-left: 24px; border-left: 2px solid #f0f0f0; margin-bottom: 10px; }
        .mys-btn {
            background: #00c3ff; color: white; border: none; padding: 6px 12px;
            border-radius: 6px; cursor: pointer; font-size: 12px;
        }
        .mys-input {
            flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 4px;
            font-size: 13px; margin-left: 5px;
        }

        /* 2. 开启顶部优化模式 (默认启动项 0, 1, 4, 5) */
        .mys-top-opt .header__title { min-width: auto !important; }
        .mys-top-opt .header__inner { width: auto !important; }
        .mys-top-opt .header__game--show { left: 10px !important; }
        
        /* 1. 隐藏 Logo (辅助逻辑：即使 JS 还没来得及删除，也先隐藏防止闪烁和循环) */
        .mys-top-opt .header__logo { display: none !important; }
        
        /* 4, 5. 移除右上角关注和通知 - 移除 CSS 控制，改由 JS 精确控制第1个和第2个 */
        /* .mys-top-opt .header__notifycontainer { display: none !important; } */

        /* 1. 移除文章间距 */
        .mys-no-spacing .ql-editor p, .mys-no-spacing .ql-editor ol, .mys-no-spacing .ql-editor ul,
        .mys-no-spacing .ql-editor pre, .mys-no-spacing .ql-editor blockquote, .mys-no-spacing .ql-editor h1,
        .mys-no-spacing .ql-editor h2, .mys-no-spacing .ql-editor .ql-image, .mys-no-spacing .ql-editor .ql-divider {
            margin-bottom: 0px !important;
        }

        /* 导航管理弹窗 */
        #mys-modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); z-index: 10000; }
        #mys-navbar-modal {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; z-index: 10001; padding: 24px; border-radius: 12px;
            width: 360px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .navbar-item-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
    `);

    // --- 3. 核心逻辑 ---

    function applyChanges() {
        if (isApplying) return;
        isApplying = true;

        try {
            // 基础类切换
            document.documentElement.classList.toggle('mys-no-spacing', config.removeSpacing);
            document.documentElement.classList.toggle('mys-top-opt', config.topBarOptimize);

            const isTopOpt = config.topBarOptimize;

            // --- 顶部优化细节处理 ---
            // 1. Logo 处理
            const logo = document.querySelector('.header__logo');
            if (logo) {
                if (isTopOpt) {
                    // 开启时删除元素。由于 CSS 中已经设置了 .mys-top-opt .header__logo { display: none !important; }
                    // 即使框架重新添加了 logo，它也是不可见的。
                    // 我们在这里物理删除它，符合文档要求。
                    logo.remove();
                } else {
                    // 恢复逻辑
                    if (logo.style.display !== 'inline-block') {
                        logo.style.display = 'inline-block';
                    }
                }
            }

            // 2. 精简标题处理
            const titleSpan = document.querySelector('.header__title span');
            if (titleSpan) {
                if (isTopOpt) {
                    if (!titleSpan.dataset.original) titleSpan.dataset.original = titleSpan.textContent;
                    // 去除空格、“米游社”、“·”
                    const newText = titleSpan.textContent.replace(/[\s米游社·]/g, '');
                    if (titleSpan.textContent !== newText) {
                        titleSpan.textContent = newText;
                    }
                } else if (titleSpan.dataset.original) {
                    if (titleSpan.textContent !== titleSpan.dataset.original) {
                        titleSpan.textContent = titleSpan.dataset.original;
                    }
                }
            }

            // 4 & 5. 移除右上角关注和通知
            const notifyContainers = document.querySelectorAll('.header__notifycontainer');
            if (notifyContainers.length >= 1) {
                // 第一个：关注
                const targetDisplay = isTopOpt ? 'none' : '';
                if (notifyContainers[0].style.display !== targetDisplay) {
                    notifyContainers[0].style.display = targetDisplay;
                }
            }
            if (notifyContainers.length >= 2) {
                // 第二个：通知
                const targetDisplay = isTopOpt ? 'none' : '';
                if (notifyContainers[1].style.display !== targetDisplay) {
                    notifyContainers[1].style.display = targetDisplay;
                }
            }

            // 3. 导航栏收纳
            if (isTopOpt) {
                applyNavbarConfig();
            } else {
                restoreNavbarConfig();
            }

            // --- 侧边栏及其他部分 ---
            const sub = document.querySelector('.mhy-layout__sub');
            const layouts = document.querySelectorAll('.mhy-layout');
            const main = document.querySelector('.mhy-layout__main');
            
            if (config.removeSidebar) {
                if (sub) sub.style.setProperty('display', 'none', 'important');
                layouts.forEach(layout => {
                    if (layout.style.width !== '700px') layout.style.width = '700px';
                });
            } else {
                if (sub) sub.style.display = 'block'; // 恢复为 block
                layouts.forEach(layout => {
                    if (layout.style.width !== '1000px') layout.style.width = '1000px';
                });
                
                if (sub) {
                    // 13. 创作者操作区域
                    const creatorAction = document.querySelector('.mhy-home__post-wrp');
                    if (creatorAction) {
                        const targetDisplay = config.removeCreatorAction ? 'none' : 'block';
                        if (creatorAction.style.display !== targetDisplay) {
                            creatorAction.style.display = targetDisplay;
                        }
                    }

                    // 2. 作者信息
                    const author = document.querySelector('.mhy-article-page-author');
                    if (author) {
                        const targetDisplay = config.removeAuthorInfo ? 'none' : 'block';
                        if (author.style.display !== targetDisplay) {
                            author.style.display = targetDisplay;
                        }
                    }
                    
                    // 3. 侧边栏推广
                    const fixedSide = document.querySelector('.mhy-layout__sub_fixed-side');
                    if (fixedSide) {
                        const sidePromo = fixedSide.querySelector('div:nth-child(2)');
                        const promo = sidePromo.querySelector('div:nth-child(1)');
                        if (promo) promo.style.display = config.removePromotion ? 'none' : 'block';
                    }

                    // 4. 游戏工具
                    const gameTools = document.querySelector('.game-tool');
                    if (Boolean(gameTools)) gameTools.style.display = config.removeGameTools ? 'none' : 'block';

                    // 5 & 6. 侧边栏过滤
                    const sections = document.querySelectorAll('.mhy-side-section');
                    const keywords = (config.enableTitleFilter && config.hideSidebarByTitle) ? config.hideSidebarByTitle.split(/\s+/) : [];

                    sections.forEach(sec => {
                        let shouldHide = false;
                        if (config.removeAdCarousel && sec.querySelector('.mhy-ad-container')) shouldHide = true;
                        if (!shouldHide && config.enableTitleFilter && keywords.length > 0) {
                            const titleEl = sec.querySelector('.mhy-side-section__title');
                            if (titleEl && keywords.some(k => k && titleEl.textContent.includes(k))) shouldHide = true;
                        }
                        if (!sec.classList.contains('game-tool')) sec.style.display = shouldHide ? 'none' : 'block';
                    });
                }
            }

            // 9-12. 其他元素恢复逻辑
            const toggleDisplay = (selector, shouldHide) => {
                const el = document.querySelector(selector);
                if (el) el.style.display = shouldHide ? 'none' : 'block';
            };
            toggleDisplay('.mhy-qrcode-bottom-card', config.removeBottomCard);
            toggleDisplay('.mhy-rocket', config.removeRocket);
            toggleDisplay('.mhy-article-actions', config.removeLeftActions);
            toggleDisplay('.footer', config.removeFooter);

            // --- 宽度自定义调整 (执行逻辑在移除右侧侧边栏之后) ---
            if (config.enableCustomWidth) {
                if (config.layoutWidth) {
                    const targetLayoutWidth = config.layoutWidth + 'px';
                    layouts.forEach(layout => {
                        if (layout.style.getPropertyValue('width') !== targetLayoutWidth) {
                            layout.style.setProperty('width', targetLayoutWidth, 'important');
                        }
                    });
                }
                if (main && config.mainWidth) {
                    const targetMainWidth = config.mainWidth + 'px';
                    if (main.style.getPropertyValue('width') !== targetMainWidth) {
                        main.style.setProperty('width', targetMainWidth, 'important');
                    }
                }
            }

        } finally {
            isApplying = false;
        }
    }

    // 导航栏收纳应用
    function applyNavbarConfig() {
        const navbar = document.querySelector('.header__navbar');
        const moreArea = document.querySelector('.header__navitem--show');
        if (!navbar || !moreArea) return;

        // 获取内部元素（不含更多按钮）
        const innerItems = Array.from(navbar.children).filter(el => 
            (el.classList.contains('header__navitem') || el.classList.contains('header__navmore')) && 
            !el.classList.contains('header__navitemmore')
        );
        // 获取收纳区域元素
        const moreItems = Array.from(moreArea.querySelectorAll('a.header__navmore, a.header__navitem'));

        const innerMap = new Map();
        innerItems.forEach(el => innerMap.set(el.getAttribute('href') + el.textContent.trim(), el));
        
        const moreMap = new Map();
        moreItems.forEach(el => moreMap.set(el.getAttribute('href') + el.textContent.trim(), el));

        // 遍历配置应用状态
        Object.entries(config.navBarConfig).forEach(([key, state]) => {
            let innerEl = innerMap.get(key);
            let moreEl = moreMap.get(key);

            if (state === 'visible') {
                // 已显示：内部 inline-block，收纳 none
                if (innerEl) {
                    if (innerEl.style.display !== 'inline-block') innerEl.style.display = 'inline-block';
                } else if (moreEl) {
                    // 如果内部没有，从收纳区复制到内部
                    const newEl = moreEl.cloneNode(true);
                    newEl.className = 'mhy-router-link header__navitem'; // 改变 class
                    newEl.dataset.added = "true";
                    const refEl = navbar.querySelector('.header__navitemmore');
                    if (refEl) {
                        navbar.insertBefore(newEl, refEl);
                    } else {
                        navbar.appendChild(newEl);
                    }
                }
                if (moreEl && moreEl.style.display !== 'none') moreEl.style.display = 'none';
            } else if (state === 'stored') {
                // 已收纳：内部 none，收纳正常（不为 none）
                if (innerEl) {
                    if (innerEl.style.display !== 'none') innerEl.style.display = 'none';
                    if (!moreEl) {
                        // 如果收纳区没有，复制到收纳区
                        const newEl = innerEl.cloneNode(true);
                        newEl.className = 'mhy-router-link header__navmore'; // 改变 class
                        newEl.dataset.added = "true";
                        const li = document.createElement('li');
                        li.appendChild(newEl);
                        moreArea.appendChild(li);
                        moreEl = newEl;
                    }
                }
                if (moreEl) {
                    if (moreEl.style.display !== '') moreEl.style.display = ''; 
                    if (moreEl.parentElement && moreEl.parentElement.tagName === 'LI') {
                        if (moreEl.parentElement.style.display !== '') moreEl.parentElement.style.display = '';
                    }
                }
            } else if (state === 'hidden') {
                // 已隐藏：内部 none，收纳 none
                if (innerEl && innerEl.style.display !== 'none') innerEl.style.display = 'none';
                if (moreEl) {
                    if (moreEl.style.display !== 'none') moreEl.style.display = 'none';
                    if (moreEl.parentElement && moreEl.parentElement.tagName === 'LI') {
                        if (moreEl.parentElement.style.display !== 'none') moreEl.parentElement.style.display = 'none';
                    }
                }
            }
        });
    }

    // 导航栏收纳恢复
    function restoreNavbarConfig() {
        const navbar = document.querySelector('.header__navbar');
        const moreArea = document.querySelector('.header__navitem--show');
        if (!navbar) return;

        // 1. 处理内部元素
        Array.from(navbar.children).forEach(el => {
            if (el.dataset.added === "true") {
                el.remove();
            } else if (el.classList.contains('header__navitem') || el.classList.contains('header__navmore')) {
                el.style.display = ''; // 恢复默认
            }
        });
        
        // 2. 处理收纳区域
        if (moreArea) {
            moreArea.querySelectorAll('li').forEach(li => {
                const a = li.querySelector('a');
                if (a && a.dataset.added === "true") {
                    li.remove();
                } else {
                    li.style.display = '';
                    if (a) a.style.display = '';
                }
            });
        }
    }

    // --- 4. UI 交互 ---

    function createUI() {
        const btn = document.createElement('div');
        btn.id = 'mys-helper-btn';
        btn.innerHTML = '⚙️';
        btn.onclick = () => {
            const menu = document.getElementById('mys-helper-menu');
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(btn);

        const menu = document.createElement('div');
        menu.id = 'mys-helper-menu';
        menu.innerHTML = `
            <h3>米游社改造计划</h3>
            <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-spacing"> 1. 移除文章间距</label></div>
            <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-topbar"> 2. 开启顶部优化模式</label></div>
            <div id="mys-topbar-sub" class="mys-sub-panel">
                <button class="mys-btn" id="mys-manage-navbar">导航收纳管理</button>
            </div>
            <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-sidebar"> 3. 移除右侧侧边栏</label></div>
            <div id="mys-sidebar-sub" class="mys-sub-panel">
                <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-creator"> 1. 移除创作者操作</label></div>
                <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-author"> 2. 移除作者信息</label></div>
                <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-promotion"> 3. 移除侧边栏推广</label></div>
                <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-gametools"> 4. 移除游戏工具区</label></div>
                <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-adcarousel"> 5. 移除侧边广告轮播</label></div>
                <div class="mys-menu-item" style="flex-wrap: wrap;">
                    <input type="checkbox" id="mys-opt-enablefilter">
                    <label style="width: 100%; margin-bottom: 5px;">6. 侧边栏标题过滤:</label>
                    <input type="text" id="mys-opt-hidetitle" class="mys-input" placeholder="关键字(空格分隔)">
                </div>
            </div>
            <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-bottomcard"> 4. 移除页脚广告</label></div>
            <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-rocket"> 5. 移除小火箭</label></div>
            <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-leftactions"> 6. 移除左侧操作栏</label></div>
            <div class="mys-menu-item"><label><input type="checkbox" id="mys-opt-footer"> 7. 移除底部公司信息</label></div>
            <div class="mys-menu-item" style="flex-wrap: wrap; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                <label style="width: 100%; margin-bottom: 5px; font-weight: bold;">
                    <input type="checkbox" id="mys-opt-enablecustomwidth"> 布局宽度设置 (px):
                </label>
                <div id="mys-customwidth-sub" style="width: 100%;">
                    <div style="display: flex; align-items: center; width: 100%; margin-bottom: 8px;">
                        <span style="font-size: 12px; width: 120px;">页面内容区域:</span>
                        <input type="text" id="mys-opt-layoutwidth" class="mys-input" placeholder="默认 1000">
                    </div>
                    <div style="display: flex; align-items: center; width: 100%;">
                        <span style="font-size: 12px; width: 120px;">主信息区域:</span>
                        <input type="text" id="mys-opt-mainwidth" class="mys-input" placeholder="默认 700">
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(menu);

        const bindings = {
            'mys-opt-spacing': 'removeSpacing', 'mys-opt-topbar': 'topBarOptimize',
            'mys-opt-sidebar': 'removeSidebar', 'mys-opt-author': 'removeAuthorInfo',
            'mys-opt-creator': 'removeCreatorAction',
            'mys-opt-promotion': 'removePromotion', 'mys-opt-gametools': 'removeGameTools',
            'mys-opt-adcarousel': 'removeAdCarousel', 'mys-opt-bottomcard': 'removeBottomCard',
            'mys-opt-rocket': 'removeRocket', 'mys-opt-leftactions': 'removeLeftActions',
            'mys-opt-footer': 'removeFooter', 'mys-opt-enablefilter': 'enableTitleFilter',
            'mys-opt-enablecustomwidth': 'enableCustomWidth'
        };

        Object.entries(bindings).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.checked = config[key];
            el.onchange = (e) => {
                config[key] = e.target.checked;
                saveConfig();
                updatePanelVisibility();
            };
        });

        const titleInput = document.getElementById('mys-opt-hidetitle');
        titleInput.value = config.hideSidebarByTitle;
        titleInput.oninput = (e) => {
            config.hideSidebarByTitle = e.target.value;
            saveConfig();
        };

        const layoutWidthInput = document.getElementById('mys-opt-layoutwidth');
        layoutWidthInput.value = config.layoutWidth || '';
        layoutWidthInput.onchange = (e) => {
            config.layoutWidth = e.target.value.replace(/\D/g, ''); // 只允许数字
            saveConfig();
        };

        const mainWidthInput = document.getElementById('mys-opt-mainwidth');
        mainWidthInput.value = config.mainWidth || '';
        mainWidthInput.onchange = (e) => {
            config.mainWidth = e.target.value.replace(/\D/g, ''); // 只允许数字
            saveConfig();
        };

        document.getElementById('mys-manage-navbar').onclick = showNavbarManager;
        updatePanelVisibility();
    }

    function updatePanelVisibility() {
        document.getElementById('mys-topbar-sub').style.display = config.topBarOptimize ? 'block' : 'none';
        document.getElementById('mys-sidebar-sub').style.display = config.removeSidebar ? 'none' : 'block';
        const customWidthSub = document.getElementById('mys-customwidth-sub');
        if (customWidthSub) {
            customWidthSub.style.opacity = config.enableCustomWidth ? '1' : '0.5';
            customWidthSub.style.pointerEvents = config.enableCustomWidth ? 'auto' : 'none';
        }
    }

    function showNavbarManager() {
        const navbar = document.querySelector('.header__navbar');
        const moreArea = document.querySelector('.header__navitem--show');
        if (!navbar) return alert('请在有导航栏的页面操作');

        // 智能识别“内部”和“收纳区域”的 a 元素
        const allItems = new Map();

        // 1. 处理内部元素
        const innerItems = Array.from(navbar.children).filter(el => 
            (el.classList.contains('header__navitem') || el.classList.contains('header__navmore')) && 
            !el.classList.contains('header__navitemmore')
        );
        innerItems.forEach(el => {
            const key = el.getAttribute('href') + el.textContent.trim();
            const display = window.getComputedStyle(el).display;
            allItems.set(key, { 
                text: el.textContent.trim(), 
                href: el.getAttribute('href'),
                location: 'inner', 
                display: display 
            });
        });

        // 2. 处理收纳区域元素
        if (moreArea) {
            moreArea.querySelectorAll('a.header__navmore, a.header__navitem').forEach(el => {
                const key = el.getAttribute('href') + el.textContent.trim();
                const display = window.getComputedStyle(el).display;
                if (allItems.has(key)) {
                    // 如果内部也有，标记为收纳区存在
                    allItems.get(key).hasMore = true;
                    allItems.get(key).moreDisplay = display;
                } else {
                    allItems.set(key, { 
                        text: el.textContent.trim(), 
                        href: el.getAttribute('href'),
                        location: 'more', 
                        display: display 
                    });
                }
            });
        }

        const overlay = document.createElement('div');
        overlay.id = 'mys-modal-overlay';
        const modal = document.createElement('div');
        modal.id = 'mys-navbar-modal';
        
        let html = '<h3>导航栏收纳管理</h3><div style="max-height:300px; overflow-y:auto;">';
        allItems.forEach((info, key) => {
            let state = '';
            // 严格按文档逻辑识别状态
            if (info.location === 'inner') {
                if (info.display === 'none') {
                    if (info.hasMore && info.moreDisplay !== 'none') {
                        state = 'stored'; // 在收纳区域有且不为none -> 已收纳
                    } else {
                        state = 'hidden'; // 否则 -> 已隐藏
                    }
                } else {
                    state = 'visible'; // 内部不是none -> 已显示
                }
            } else if (info.location === 'more') {
                if (info.display === 'none') {
                    state = 'hidden'; // 收纳区域 display 是 none -> 已隐藏
                } else {
                    state = 'stored'; // 收纳区域不是 none -> 已收纳
                }
            }

            // 如果 config 中已有记录，优先使用（用于保持用户之前的选择）
            if (config.navBarConfig[key]) state = config.navBarConfig[key];

            html += `<div class="navbar-item-row"><span>${info.text}</span>
                <select data-key="${key}" style="padding:4px; border-radius:4px;">
                    <option value="visible" ${state === 'visible' ? 'selected' : ''}>显示</option>
                    <option value="stored" ${state === 'stored' ? 'selected' : ''}>收纳</option>
                    <option value="hidden" ${state === 'hidden' ? 'selected' : ''}>隐藏</option>
                </select></div>`;
        });
        html += '</div><button class="mys-btn" id="mys-save-nav" style="width:100%; margin-top:15px; padding:10px;">保存并关闭</button>';
        modal.innerHTML = html;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        document.getElementById('mys-save-nav').onclick = () => {
            const newConfig = {};
            modal.querySelectorAll('select').forEach(sel => newConfig[sel.dataset.key] = sel.value);
            config.navBarConfig = newConfig;
            saveConfig();
            overlay.remove(); modal.remove();
        };
        overlay.onclick = () => { overlay.remove(); modal.remove(); };
    }

    // --- 5. 启动与监听 ---
    createUI();
    applyChanges();

    let debounceTimer;
    const observer = new MutationObserver(() => {
        if (isApplying) return;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => applyChanges(), 100); // 增加 100ms 防抖，防止频繁触发卡死
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
