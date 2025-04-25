(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'pinia', 'lodash'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('pinia'), require('lodash'));
    } else {
        // Browser globals (root is window)
        root.useNavTabs = factory(root.Vue, root.Pinia, root._);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue, Pinia, _) {
    'use strict';

    const { reactive } = Vue;
    const { defineStore } = Pinia;
    const { isEmpty } = _;

    // 常量定义
    const STORE_TAB_VIEW_CONFIG = 'ba-tab-view';

    // 基础路径
    const adminBaseRoutePath = '/admin';

    return defineStore('navTabs', () => {
        const state = reactive({
            activeIndex: 0,
            activeRoute: null,
            tabsView: [],
            tabFullScreen: false,
            tabsViewRoutes: [],
            authNode: new Map(),
        });

        // 工具函数：对iframe的url进行编码
        function encodeRoutesURI(data) {
            data.forEach((item) => {
                if (item.meta?.menu_type == 'iframe') {
                    item.path = adminBaseRoutePath + '/iframe/' + encodeURIComponent(item.path);
                }
                if (item.children && item.children.length) {
                    item.children = encodeRoutesURI(item.children);
                }
            });
            return data;
        }

        function closeTabByPath(fullPath) {
            window.layoutNavTabsRef?.value?.closeTabByPath(fullPath);
        }

        function closeAllTab(menu) {
            window.layoutNavTabsRef?.value?.closeAllTab(menu);
        }

        function updateTabTitle(fullPath, title) {
            window.layoutNavTabsRef?.value?.updateTabTitle(fullPath, title);
        }

        function _addTab(route) {
            const tabView = { ...route, matched: [], meta: { ...route.meta } };
            if (!tabView.meta.addtab) return;

            const tabViewRoute = getTabsViewDataByRoute(tabView);
            if (tabViewRoute && tabViewRoute.meta) {
                tabView.name = tabViewRoute.name;
                tabView.meta.id = tabViewRoute.meta.id;
                tabView.meta.title = tabViewRoute.meta.title;
            }

            for (const key in state.tabsView) {
                if (state.tabsView[key].meta.id === tabView.meta.id || state.tabsView[key].fullPath == tabView.fullPath) {
                    state.tabsView[key].fullPath = tabView.fullPath;
                    state.tabsView[key].params = !isEmpty(tabView.params) ? tabView.params : state.tabsView[key].params;
                    state.tabsView[key].query = !isEmpty(tabView.query) ? tabView.query : state.tabsView[key].query;
                    return;
                }
            }

            if (typeof tabView.meta.title == 'string') {
                tabView.meta.title = window.i18n.global.te(tabView.meta.title) ?
                    window.i18n.global.t(tabView.meta.title) : tabView.meta.title;
            }
            state.tabsView.push(tabView);
        }

        function _setActiveRoute(route) {
            const currentRouteIndex = state.tabsView.findIndex((item) => {
                return item.fullPath === route.fullPath;
            });
            if (currentRouteIndex === -1) return;
            state.activeRoute = route;
            state.activeIndex = currentRouteIndex;
        }

        function _closeTab(route) {
            state.tabsView.map((v, k) => {
                if (v.fullPath == route.fullPath) {
                    state.tabsView.splice(k, 1);
                    return;
                }
            });
        }

        function _closeTabs(retainMenu = false) {
            if (retainMenu) {
                state.tabsView = [retainMenu];
            } else {
                state.tabsView = [];
            }
        }

        function _updateTabTitle(fullPath, title) {
            for (const key in state.tabsView) {
                if (state.tabsView[key].fullPath == fullPath) {
                    state.tabsView[key].meta.title = title;
                    break;
                }
            }
        }

        function setTabsViewRoutes(data) {
            state.tabsViewRoutes = encodeRoutesURI(data);
        }

        function setAuthNode(key, data) {
            state.authNode.set(key, data);
        }

        function fillAuthNode(data) {
            state.authNode = data;
        }

        function setFullScreen(status) {
            state.tabFullScreen = status;
        }

        function getTabsViewDataByRoute(route, returnType = 'normal') {
            let found = getTabsViewDataByPath(route.fullPath, state.tabsViewRoutes, returnType);
            if (found) {
                found.meta.matched = route.fullPath;
                return found;
            }

            found = getTabsViewDataByPath(route.path, state.tabsViewRoutes, returnType);
            if (found) {
                found.meta.matched = route.path;
                return found;
            }

            return false;
        }

        function getTabsViewDataByPath(path, menus, returnType) {
            for (const key in menus) {
                if (menus[key].path === path) {
                    return menus[key];
                }
                if (menus[key].children && menus[key].children.length) {
                    const find = getTabsViewDataByPath(path, menus[key].children, returnType);
                    if (find) {
                        return returnType == 'above' ? menus[key] : find;
                    }
                }
            }
            return false;
        }

        return {
            state,
            closeAllTab,
            closeTabByPath,
            updateTabTitle,
            setTabsViewRoutes,
            setAuthNode,
            fillAuthNode,
            setFullScreen,
            getTabsViewDataByPath,
            getTabsViewDataByRoute,
            _addTab,
            _closeTab,
            _closeTabs,
            _setActiveRoute,
            _updateTabTitle,
        };
    }, {
        persist: {
            key: STORE_TAB_VIEW_CONFIG,
            pick: ['state.tabFullScreen'],
        },
    });
}));