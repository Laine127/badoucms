(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.route = factory());
}(this, (function () {
    'use strict';

    /**
     * 处理后台路由
     * @param {Array} routes - 路由配置数组
     */
    function handleAdminRoute(routes) {
        if (!routes.length) return;

        const navTabs = useNavTabs();

        const menuAdminBaseRoute = Config.app_url + `/`;

        // 更新导航标签数据
        navTabs.setTabsViewRoutes(handleMenuRule(routes, menuAdminBaseRoute));
        navTabs.fillAuthNode(handleAuthNode(routes, menuAdminBaseRoute));
    }

    function handleMenuRule(routes, pathPrefix = '/', type = ['menu', 'menu_dir']) {
        const menuRule = []
        for (const key in routes) {
            if (routes[key].extend == 'add_rules_only') {
                continue
            }
            if (!type.includes(routes[key].type)) {
                continue
            }
            if (routes[key].type == 'menu_dir' && routes[key].children && !routes[key].children.length) {
                continue
            }
            if (
                ['route', 'menu', 'nav_user_menu', 'nav'].includes(routes[key].type) &&
                ((routes[key].menu_type == 'tab' && !routes[key].component) || (['link', 'iframe'].includes(routes[key].menu_type) && !routes[key].url))
            ) {
                continue
            }
            const currentPath = ['link', 'iframe'].includes(routes[key].menu_type) ? routes[key].url : pathPrefix + routes[key].path
            let children = []
            if (routes[key].children && routes[key].children.length > 0) {
                children = handleMenuRule(routes[key].children, pathPrefix, type)
            }

            menuRule.push({
                path: currentPath,
                name: routes[key].name,
                component: routes[key].component,
                meta: {
                    id: routes[key].id,
                    title: routes[key].title,
                    icon: routes[key].icon,
                    keepalive: routes[key].keepalive,
                    menu_type: routes[key].menu_type,
                    type: routes[key].type,
                },
                children: children,
            })
        }
        return menuRule
    }

    function handleAuthNode(routes, prefix = '/') {
        const authNode = new Map([])
        assembleAuthNode(routes, authNode, prefix, prefix)
        return authNode
    }

    function assembleAuthNode(routes, authNode, prefix = '/', parent = '/') {
        const authNodeTemp = []
        for (const key in routes) {
            if (routes[key].type == 'button') authNodeTemp.push(prefix + routes[key].name)
            if (routes[key].children && routes[key].children.length > 0) {
                assembleAuthNode(routes[key].children, authNode, prefix, prefix + routes[key].name)
            }
        }
        if (authNodeTemp && authNodeTemp.length > 0) {
            authNode.set(parent, authNodeTemp)
        }
    }

    return {
        handleAdminRoute,
    };
})));