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
                required: true
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
            // SVG 组件的具体实现
            // 这里需要根据您的实际 SVG 组件逻辑来实现
            return () => createVNode('svg', {
                class: 'svg-icon',
                style: {
                    width: props.size,
                    height: props.size,
                    color: props.color
                }
            });
        }
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
                return () => createVNode('el-icon', {
                    class: 'icon el-icon',
                    style: iconStyle.value
                }, [createVNode(resolveComponent(props.name))]);
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