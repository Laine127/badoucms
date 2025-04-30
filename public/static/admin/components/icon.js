(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'));
    } else {
        // Browser globals (root is window)
        root.Icon = factory(root.Vue);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue) {
    'use strict';

    const { createVNode, resolveComponent, defineComponent, computed } = Vue;

    // 辅助函数：检查是否为外部链接
    const isExternal = (path) => {
        return /^(https?:|mailto:|tel:)/.test(path);
    };

    // SVG 组件
    const svg = {
        name: 'svg-icon',
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
    };

    // Icon 组件定义
    return defineComponent({
        name: 'Icon',
        props: {
            name: {
                type: String,
                required: true,
            },
            size: {
                type: String,
                default: '18px',
            },
            color: {
                type: String,
                default: '#000000',
            },
        },
        setup(props) {
            const iconStyle = computed(() => {
                const { size, color } = props;
                let s = `${size.replace('px', '')}px`;
                return {
                    fontSize: s,
                    color: color,
                };
            });

            if (props.name.indexOf('el-icon-') === 0) {
                // 解析 Element Plus 图标名称
                const iconName = props.name.replace('el-icon-', '');
                // 尝试解析组件
                const IconComponent = resolveComponent(iconName);
                return () => createVNode('el-icon', {
                    class: 'icon el-icon',
                    style: iconStyle.value
                }, [createVNode(IconComponent)]);
            } else if (props.name.indexOf('local-') === 0 || isExternal(props.name)) {
                return () => createVNode(svg, {
                    name: props.name,
                    size: props.size,
                    color: props.color
                });
            } else {
                return () => createVNode('i', {
                    class: [props.name, 'icon'],
                    style: iconStyle.value
                });
            }
        }
    });
}));