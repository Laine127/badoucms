(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'));
    } else {
        // Browser globals (root is window)
        root.Svg = factory(root.Vue);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue) {
    'use strict';

    const { computed, defineComponent } = Vue;

    // 辅助函数：检查是否为外部链接
    const isExternal = (path) => {
        return /^(https?:|mailto:|tel:)/.test(path);
    };

    return defineComponent({
        name: 'Svg',
        props: {
            name: {
                type: String,
                default: ''
            },
            size: {
                type: String,
                default: '18px'
            },
            color: {
                type: String,
                default: '#000000'
            }
        },
        setup(props) {
            const s = `${props.size.replace('px', '')}px`;
            const iconName = computed(() => `#${props.name}`);
            const iconStyle = computed(() => {
                return {
                    color: props.color,
                    fontSize: s,
                };
            });
            const isUrl = computed(() => isExternal(props.name));
            const urlIconStyle = computed(() => {
                return {
                    width: s,
                    height: s,
                    mask: `url(${props.name}) no-repeat 50% 50%`,
                    '-webkit-mask': `url(${props.name}) no-repeat 50% 50%`,
                };
            });

            return {
                iconName,
                iconStyle,
                isUrl,
                urlIconStyle
            };
        },
        template: `
            <div v-if="isUrl" :style="urlIconStyle" class="url-svg svg-icon icon"></div>
            <svg v-else class="svg-icon icon" :style="iconStyle">
                <use :href="iconName" />
            </svg>
        `
    });
}));