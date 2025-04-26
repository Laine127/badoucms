(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('element-plus')) :
        typeof define === 'function' && define.amd ? define(['vue', 'element-plus'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MenuVertical = factory(global.Vue, global.ElementPlus));
})(this, (function (Vue, ElementPlus) {
    'use strict';

    const { computed, nextTick, onMounted, reactive } = Vue;

    const MenuVertical = {
        name: 'MenuVertical',
        template: `
            <el-scrollbar ref="layoutMenuScrollbarRef" :style="{'height': verticalMenusScrollbarHeight, 'backgroundColor': config.getColorVal('menuBackground') }">
                <el-menu
                    class="layouts-menu-vertical"
                    :collapse-transition="false"
                    :unique-opened="config.layout.menuUniqueOpened"
                    :default-active="state.defaultActive"
                    :collapse="config.layout.menuCollapse"
                    ref="layoutMenuRef"
                    :style="{
                        '--el-menu-bg-color': config.getColorVal('menuBackground'),
                        '--el-menu-text-color': config.getColorVal('menuColor'),
                        '--el-menu-active-color': config.getColorVal('menuActiveColor')
                    }"
                >
                    <menu-tree :menus="navTabs.state.tabsViewRoutes" />
                </el-menu>
            </el-scrollbar>
            `,
        props: {
            route: {
                type: Object,
            }
        },
        setup(props) {
            const config = useConfig();
            const navTabs = useNavTabs();

            const state = reactive({
                defaultActive: ''
            });
            const verticalMenusScrollbarHeight = computed(() => {
                let menuTopBarHeight = 0;
                if (config.layout.menuShowTopBar) {
                    menuTopBarHeight = 50;
                }
                if (config.layout.layoutMode == 'Default') {
                    return `calc(100vh - ${32 + menuTopBarHeight}px)`;
                } else {
                    return `calc(100vh - ${menuTopBarHeight}px)`;
                }
            });

            const currentRouteActive = (currentRoute) => {
                const tabView = navTabs.getTabsViewDataByRoute(currentRoute);

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
            console.log(config.layout.menuCollapse);


            return {
                state,
                config,
                navTabs,
                verticalMenusScrollbarHeight
            };
        },
    };

    return MenuVertical;
}));