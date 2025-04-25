(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('element-plus')) :
        typeof define === 'function' && define.amd ? define(['vue', 'element-plus'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MenuVertical = factory(global.Vue, global.ElementPlus));
})(this, (function (Vue, ElementPlus) {
    'use strict';

    const { computed, nextTick, onMounted, reactive } = Vue;
    const { ElScrollbar, ElMenu } = ElementPlus;

    const MenuVertical = {
        name: 'MenuVertical',
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
            }
        },
        setup(props) {
            const state = reactive({
                defaultActive: ''
            });
            const verticalMenusScrollbarHeight = computed(() => {
                let menuTopBarHeight = 0;
                if (props.config.layout.menuShowTopBar) {
                    menuTopBarHeight = 50;
                }
                if (props.config.layout.layoutMode == 'Default') {
                    return `calc(100vh - ${32 + menuTopBarHeight}px)`;
                } else {
                    return `calc(100vh - ${menuTopBarHeight}px)`;
                }
            });

            const currentRouteActive = (currentRoute) => {
                const tabView = props.navTabs.getTabsViewDataByRoute(currentRoute);

                if (tabView) {
                    state.defaultActive = tabView.meta.matched;
                }
            };

            const verticalMenusScroll = () => {
                nextTick(() => {
                    let activeMenu = document.querySelector('.el-menu.layouts-menu-vertical li.is-active');
                    if (!activeMenu) return false;
                    props.layoutMenuScrollbarRef?.setScrollTop(activeMenu.offsetTop);
                });
            };

            onMounted(() => {
                currentRouteActive(props.route);
                verticalMenusScroll();
            });

            return {
                state,
                verticalMenusScrollbarHeight
            };
        },
        render() {
            const { config, navTabs } = this;
            return Vue.h(ElScrollbar, {
                ref: 'layoutMenuScrollbarRef',
                class: 'vertical-menus-scrollbar',
                style: {
                    height: this.verticalMenusScrollbarHeight,
                    backgroundColor: config.getColorVal('menuBackground')
                }
            }, () => [
                Vue.h(ElMenu, {
                    class: 'layouts-menu-vertical',
                    'collapse-transition': false,
                    'unique-opened': config.layout.menuUniqueOpened,
                    'default-active': this.state.defaultActive,
                    collapse: config.layout.menuCollapse,
                    ref: 'layoutMenuRef',
                    style: {
                        '--el-menu-bg-color': config.getColorVal('menuBackground'),
                        '--el-menu-text-color': config.getColorVal('menuColor'),
                        '--el-menu-active-color': config.getColorVal('menuActiveColor')
                    }
                }, () => [
                    Vue.h(window.MenuTree, { menus: navTabs.state.tabsViewRoutes, config: config })
                ])
            ]);
        }
    };

    return MenuVertical;
}));