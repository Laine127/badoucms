(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'pinia'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('pinia'));
    } else {
        // Browser globals (root is window)
        root.useConfig = factory(root.Vue, root.Pinia);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue, Pinia) {
    'use strict';

    const { reactive } = Vue;
    const { defineStore } = Pinia;

    // 常量定义
    const STORE_CONFIG = 'ba-config';

    return defineStore('config', () => {
        const layout = reactive({
            // 全局
            showDrawer: false,
            shrink: false,
            // 后台布局方式，可选值<Default|Classic|Streamline|Double>
            layoutMode: 'Classic',
            // 后台主页面切换动画
            mainAnimation: 'slide-right',
            isDark: false,

            // 侧边栏
            menuBackground: ['#2c2d34', '#1d1e1f'],
            menuColor: ['#C8CACE', '#CFD3DC'],
            menuActiveBackground: ['#353940', '#353940'],
            menuActiveColor: ['#ffffff', '#ffffff'],
            menuTopBarBackground: ['#2c2d34', '#1d1e1f'],
            menuWidth: 230,
            menuDefaultIcon: 'fa fa-circle-o',
            menuCollapse: false,
            menuUniqueOpened: false,
            menuShowTopBar: true,

            // 顶栏
            headerBarTabColor: ['#000000', '#ffffff'],
            headerBarTabActiveBackground: ['#ffffff', '#1d1e1f'],
            headerBarTabActiveColor: ['#000000', '#ffffff'],
            headerBarBackground: ['#ffffff', '#1d1e1f'],
            headerBarHoverBackground: ['#f5f5f5', '#18222c'],
        });

        const lang = reactive({
            defaultLang: 'zh-cn',
            fallbackLang: 'zh-cn',
            langArray: [
                { name: 'zh-cn', value: '中文简体' },
                { name: 'en', value: 'English' },
            ],
        });

        function menuWidth() {
            if (layout.shrink) {
                return layout.menuCollapse ? '0px' : layout.menuWidth + 'px';
            }
            return layout.menuCollapse ? '64px' : layout.menuWidth + 'px';
        }

        function setLang(val) {
            lang.defaultLang = val;
        }

        function onSetLayoutColor(data = layout.layoutMode) {
            const tempValue = layout.isDark ?
                { idx: 1, color: '#1d1e1f', newColor: '#141414' } :
                { idx: 0, color: '#ffffff', newColor: '#f5f5f5' };

            if (data == 'Classic' &&
                layout.headerBarBackground[tempValue.idx] == tempValue.color &&
                layout.headerBarTabActiveBackground[tempValue.idx] == tempValue.color) {
                layout.headerBarTabActiveBackground[tempValue.idx] = tempValue.newColor;
            } else if (data == 'Default' &&
                layout.headerBarBackground[tempValue.idx] == tempValue.color &&
                layout.headerBarTabActiveBackground[tempValue.idx] == tempValue.newColor) {
                layout.headerBarTabActiveBackground[tempValue.idx] = tempValue.color;
            }
        }

        function setLayoutMode(data) {
            layout.layoutMode = data;
            onSetLayoutColor(data);
        }

        const setLayout = (name, value) => {
            layout[name] = value;
        };

        const getColorVal = function (name) {
            const colors = layout[name];
            return layout.isDark ? colors[1] : colors[0];
        };

        return {
            layout,
            lang,
            menuWidth,
            setLang,
            setLayoutMode,
            setLayout,
            getColorVal,
            onSetLayoutColor
        };
    }, {
        persist: {
            key: STORE_CONFIG,
        },
    });
}));