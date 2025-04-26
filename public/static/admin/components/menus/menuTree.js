(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('element-plus')) :
        typeof define === 'function' && define.amd ? define(['vue', 'element-plus'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MenuTree = factory(global.Vue, global.ElementPlus));
})(this, (function (Vue, ElementPlus) {
    'use strict';

    const MenuTree = {
        name: 'MenuTree',
        template: `
        <template v-for="menu in menus">
            <template v-if="menu.children && menu.children.length > 0">
                <el-sub-menu @click="onClickSubMenu(menu)" :index="menu.path" :key="menu.path">
                    <template #title>
                        <Icon :color="config.getColorVal('menuColor')" :name="menu.meta.icon ? menu.meta.icon : config.layout.menuDefaultIcon" />
                        <span>{{ menu.meta.title ? menu.meta.title : __('noTitle') }}</span>
                    </template>
                    <menu-tree :extends="{ ...menuextends, level: menuextends.level + 1 }" :menus="menu.children"></menu-tree>
                </el-sub-menu>
            </template>
            <template v-else>
                <el-menu-item :index="menu.path" :key="menu.path" @click="onClickMenu(menu)">
                    <Icon :color="config.getColorVal('menuColor')" :name="menu.meta.icon ? menu.meta.icon : config.layout.menuDefaultIcon" />
                    <span>{{ menu.meta.title ? menu.meta.title : __('noTitle') }}</span>
                </el-menu-item>
            </template>
        </template>
        `,
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
                onClickSubMenu,
                // 返回 props 中的值供模板使用
                menus: props.menus,
                menuextends: props.extends
            };
        }
    };

    return MenuTree;
}));