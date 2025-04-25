(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('element-plus')) :
        typeof define === 'function' && define.amd ? define(['vue', 'element-plus'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MenuHorizontal = factory(global.Vue, global.ElementPlus));
})(this, (function (Vue, ElementPlus) {
    'use strict';

    const { ElScrollbar, ElMenu } = ElementPlus;

    const MenuHorizontal = {
        name: 'MenuHorizontal',
        props: {
            config: {
                type: Object,
                required: true
            },
            navTabs: {
                type: Object,
                required: true
            },
            route: {
                type: Object,
                required: true
            }
        },
        setup(props) {
            const state = Vue.reactive({
                defaultActive: ''
            });

            const currentRouteActive = (currentRoute) => {
                const tabView = props.navTabs.getTabsViewDataByRoute(currentRoute);
                if (tabView) {
                    state.defaultActive = tabView.meta.matched;
                }
            };

            Vue.onMounted(() => {
                currentRouteActive(props.route);
            });

            return {
                state
            };
        },
        render() {
            const { config, navTabs } = this;
            return Vue.h(ElScrollbar, {
                ref: 'layoutMenuScrollbarRef',
                class: 'horizontal-menus-scrollbar'
            }, [
                Vue.h(ElMenu, {
                    ref: 'layoutMenuRef',
                    class: 'menu-horizontal',
                    mode: 'horizontal',
                    'default-active': this.state.defaultActive,
                    style: {
                        '--el-menu-bg-color': config.getColorVal('menuBackground'),
                        '--el-menu-text-color': config.getColorVal('menuColor'),
                        '--el-menu-active-color': config.getColorVal('menuActiveColor')
                    }
                }, [
                    Vue.h('menu-tree', {
                        extends: { position: 'horizontal', level: 1 },
                        menus: navTabs.state.tabsViewRoutes,
                        config: config
                    })
                ])
            ]);
        }
    };

    return MenuHorizontal;
}));