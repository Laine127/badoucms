(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'pinia'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('pinia'));
    } else {
        // Browser globals (root is window)
        root.Logo = factory(root.Vue, root.Pinia);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue, Pinia) {
    'use strict';

    // 组件定义
    return {
        name: 'Logo',
        template: `
            <div class="layout-logo">
                <img v-if="!config.layout.menuCollapse" class="logo-img" src="/static/admin/images/logo.png" alt="logo" />
                <div v-if="!config.layout.menuCollapse" :style="{ color: config.getColorVal('menuActiveColor') }" class="website-name">
                    {{ siteConfig.siteName }}
                </div>
                <Icon
                    v-if="config.layout.layoutMode != 'Streamline'"
                    @click="onMenuCollapse"
                    :name="config.layout.menuCollapse ? 'fa fa-indent' : 'fa fa-dedent'"
                    :class="config.layout.menuCollapse ? 'unfold' : ''"
                    :color="config.getColorVal('menuActiveColor')"
                    size="18"
                    class="fold"
                />
            </div>
        `,
        setup() {
            const config = useConfig();
            const siteConfig = Config.siteConfig;
            const { Session } = window.Storage;
            const onMenuCollapse = function () {
                if (config.layout.shrink && !config.layout.menuCollapse) {
                    window.closeShade();
                }

                config.setLayout('menuCollapse', !config.layout.menuCollapse);

                Session.set('BEFORE_RESIZE_LAYOUT', {
                    layoutMode: config.layout.layoutMode,
                    menuCollapse: config.layout.menuCollapse,
                });

                setTimeout(() => {
                    window.setNavTabsWidth();
                }, 350);
            };

            return {
                config,
                siteConfig,
                onMenuCollapse
            };
        },
    };
}));
