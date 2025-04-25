(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('element-plus')) :
        typeof define === 'function' && define.amd ? define(['vue', 'element-plus'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MenuTree = factory(global.Vue, global.ElementPlus));
})(this, (function (Vue, ElementPlus) {
    'use strict';

    const { ElSubMenu, ElMenuItem } = ElementPlus;

    const MenuTree = {
        name: 'MenuTree',
        props: {
            menus: {
                type: Array,
                default: () => []
            },
            extends: {
                type: Object,
                default: () => ({
                    level: 1
                })
            },
        },
        setup(props) {
            const config = useConfig();
            const onClickMenu = (menu) => {
                if (!menu.path) return;
                window.location.href = menu.path;
            };

            const onClickSubMenu = (menu) => {
                if (props.extends?.position == 'horizontal' && props.extends.level <= 1 && menu.children?.length) {
                    const firstRoute = getFirstRoute(menu.children);
                    if (firstRoute) {
                        onClickMenu(firstRoute);
                    }
                }
            };

            const getFirstRoute = (menus) => {
                let firstRoute = null;
                for (const menu of menus) {
                    if (menu.children && menu.children.length) {
                        firstRoute = getFirstRoute(menu.children);
                        if (firstRoute) break;
                    } else {
                        firstRoute = menu;
                        break;
                    }
                }
                return firstRoute;
            };

            return {
                config,
                onClickMenu,
                onClickSubMenu
            };
        },
        render() {
            const renderMenus = (menus) => {
                return menus.map(menu => {
                    if (menu.children && menu.children.length > 0) {
                        return Vue.h(ElSubMenu, {
                            index: menu.path,
                            key: menu.path,
                            onClick: () => this.onClickSubMenu(menu)
                        }, {
                            title: () => [
                                Vue.h('i', {
                                    class: ['icon', menu.icon || this.config.layout.menuDefaultIcon],
                                    style: { color: this.config.getColorVal('menuColor') }
                                }),
                                Vue.h('span', {}, menu.title || 'No Title')
                            ],
                            default: () => [
                                Vue.h(MenuTree, {
                                    extends: { ...this.extends, level: this.extends.level + 1 },
                                    menus: menu.children,
                                    config: this.config
                                })
                            ]
                        });
                    } else {
                        return Vue.h(ElMenuItem, {
                            index: menu.path,
                            key: menu.path,
                            onClick: () => this.onClickMenu(menu)
                        }, {
                            default: () => [
                                Vue.h('i', {
                                    class: ['icon', menu.icon || this.config.layout.menuDefaultIcon],
                                    style: { color: this.config.getColorVal('menuColor') }
                                }),
                                Vue.h('span', {}, menu.title || 'No Title')
                            ]
                        });
                    }
                });
            };

            return Vue.h('div', {}, renderMenus(this.menus));
        }
    };

    return MenuTree;
}));