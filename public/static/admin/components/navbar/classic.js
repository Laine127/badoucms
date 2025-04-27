(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ClassicNavbar = factory());
}(this, (function () {
    'use strict';

    return {
        name: 'ClassicNavbar',
        template: `
            <div class="nav-bar">
                <div v-if="config.layout.shrink && config.layout.menuCollapse" class="unfold">
                    <Icon @click="onMenuCollapse" name="fa fa-indent" :color="config.getColorVal('menuActiveColor')" size="18" />
                </div>
            </div>
        `,
        setup() {
            const config = useConfig();

            const onMenuCollapse = () => {
                showShade('ba-aside-menu-shade', () => {
                    config.setLayout('menuCollapse', true);
                });
                config.setLayout('menuCollapse', false);
            };

            return {
                config,
                onMenuCollapse
            };
        },
        components: {
            NavTabs,
            NavMenus,
            Icon
        }
    };
})));