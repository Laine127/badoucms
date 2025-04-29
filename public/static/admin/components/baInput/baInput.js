(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['vue', 'lodash-es'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('vue'), require('lodash-es'));
    } else {
        root.BaInput = factory(root.Vue, root._);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue, _) {
    'use strict';

    const { computed, createVNode, defineComponent, reactive, resolveComponent } = Vue;

    // 组件定义
    return {
        name: 'baInput',
        props: {
            type: {
                type: String,
                required: true,
                validator: function (value) {
                    return window.inputTypes.includes(value);
                }
            },
            modelValue: {
                required: true
            },
            attr: {
                type: Object,
                default: function () { return {}; }
            },
            data: {
                type: Object,
                default: function () { return {}; }
            }
        },
        emits: ['update:modelValue'],
        setup(props, { emit, slots }) {
            // 合并 props.attr 和 props.data
            const attrs = computed(() => {
                return { ...props.attr, ...props.data };
            });

            // 通用值更新函数
            const onValueUpdate = (value) => {
                emit('update:modelValue', value);
            };

            // string number textarea password
            const sntp = () => {
                return () =>
                    createVNode(
                        resolveComponent('el-input'),
                        {
                            type: props.type == 'string' ? 'text' : props.type,
                            ...attrs.value,
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        slots
                    );
            };

            // radio checkbox
            const rc = () => {
                if (!attrs.value.content) {
                    console.warn('请传递 ' + props.type + ' 的 content');
                }

                const vNodes = computed(() => {
                    const vNode = [];
                    const contentIsArray = _.isArray(attrs.value.content);
                    const type = attrs.value.button ? props.type + '-button' : props.type;
                    for (const key in attrs.value.content) {
                        let nodeProps = {};
                        if (contentIsArray) {
                            if (typeof attrs.value.content[key].value == 'number') {
                                console.warn(props.type + ' 的 content.value 不能是数字');
                            }

                            nodeProps = {
                                ...attrs.value.content[key],
                                border: attrs.value.border ? attrs.value.border : false,
                                ...(attrs.value.childrenAttr || {}),
                            };
                        } else {
                            nodeProps = {
                                value: key,
                                label: attrs.value.content[key],
                                border: attrs.value.border ? attrs.value.border : false,
                                ...(attrs.value.childrenAttr || {}),
                            };
                        }
                        vNode.push(createVNode(resolveComponent('el-' + type), nodeProps, slots));
                    }
                    return vNode;
                });

                return () => {
                    const valueComputed = computed(() => {
                        if (props.type == 'radio') {
                            if (props.modelValue == undefined) return '';
                            return '' + props.modelValue;
                        } else {
                            let modelValueArr = [];
                            for (const key in props.modelValue) {
                                modelValueArr[key] = '' + props.modelValue[key];
                            }
                            return modelValueArr;
                        }
                    });
                    return createVNode(
                        resolveComponent('el-' + props.type + '-group'),
                        {
                            ...attrs.value,
                            modelValue: valueComputed.value,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        () => vNodes.value
                    );
                };
            };

            // datetime 日期时间选择器
            const datetime = () => {
                return () =>
                    createVNode(
                        resolveComponent('el-date-picker'),
                        {
                            ...attrs.value,
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        slots
                    );
            };

            // select 选择器
            const select = () => {
                if (!attrs.value.content) {
                    console.warn('请传递 select 的 content');
                }

                const vNodes = computed(() => {
                    const vNode = [];
                    const contentIsArray = _.isArray(attrs.value.content);
                    for (const key in attrs.value.content) {
                        let nodeProps = {};
                        if (contentIsArray) {
                            nodeProps = {
                                ...attrs.value.content[key],
                                ...(attrs.value.childrenAttr || {}),
                            };
                        } else {
                            nodeProps = {
                                value: key,
                                label: attrs.value.content[key],
                                ...(attrs.value.childrenAttr || {}),
                            };
                        }
                        vNode.push(createVNode(resolveComponent('el-option'), nodeProps, slots));
                    }
                    return vNode;
                });

                return () =>
                    createVNode(
                        resolveComponent('el-select'),
                        {
                            ...attrs.value,
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        () => vNodes.value
                    );
            };

            // remoteSelect 远程选择器
            const remoteSelect = () => {
                return () =>
                    createVNode(
                        resolveComponent('remote-select'),
                        {
                            ...attrs.value,
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        slots
                    );
            };

            // iconSelector 图标选择器
            const iconSelector = () => {
                return () =>
                    createVNode(
                        resolveComponent('icon-selector'),
                        {
                            ...attrs.value,
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        slots
                    );
            };

            // array 数组输入
            const array = () => {
                return () =>
                    createVNode(
                        resolveComponent('array'),
                        {
                            ...attrs.value,
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        slots
                    );
            };

            // editor 富文本编辑器
            const editor = () => {
                return () =>
                    createVNode(
                        resolveComponent('editor'),
                        {
                            ...attrs.value,
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        slots
                    );
            };

            // upload 上传组件
            const upload = () => {
                return () =>
                    createVNode(
                        resolveComponent('ba-upload'),
                        {
                            ...attrs.value,
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        slots
                    );
            };

            // 构建函数映射
            const buildFun = new Map([
                ['string', sntp],
                ['number', sntp],
                ['textarea', sntp],
                ['password', sntp],
                ['radio', rc],
                ['checkbox', rc],
                ['datetime', datetime],
                ['select', select],
                ['remoteSelect', remoteSelect],
                ['iconSelector', iconSelector],
                ['array', array],
                ['editor', editor],
                ['upload', upload],
            ]);

            let action = buildFun.get(props.type) || buildFun.get('default');
            return action.call(this);
        }
    };
}));