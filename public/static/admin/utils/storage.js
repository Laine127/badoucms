(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Storage = {}));
})(this, (function (exports) {
    'use strict';

    /**
     * window.localStorage
     * @method set 设置
     * @method get 获取
     * @method remove 移除
     * @method clear 移除全部
     */
    exports.Local = {
        set(key, val) {
            window.localStorage.setItem(key, JSON.stringify(val));
        },
        get(key) {
            const json = window.localStorage.getItem(key);
            return JSON.parse(json);
        },
        remove(key) {
            window.localStorage.removeItem(key);
        },
        clear() {
            window.localStorage.clear();
        }
    };

    /**
     * window.sessionStorage
     * @method set 设置会话缓存
     * @method get 获取会话缓存
     * @method remove 移除会话缓存
     * @method clear 移除全部会话缓存
     */
    exports.Session = {
        set(key, val) {
            window.sessionStorage.setItem(key, JSON.stringify(val));
        },
        get(key) {
            const json = window.sessionStorage.getItem(key);
            return JSON.parse(json);
        },
        remove(key) {
            window.sessionStorage.removeItem(key);
        },
        clear() {
            window.sessionStorage.clear();
        }
    };

    Object.defineProperty(exports, '__esModule', { value: true });
}));
