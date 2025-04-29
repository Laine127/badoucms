(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['vue'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('vue'));
    } else {
        global.Editor = factory(global.Vue);
    }
})(typeof window !== 'undefined' ? window : this, function (Vue) {
    'use strict';

    const template = `
        <div>
            <component v-bind="$attrs" :is="mixins[state.editorType]" />
        </div>
    `;

    return {
        name: 'Editor',
        template: template,
        props: {
            editorType: {
                type: String,
                default: 'default'
            }
        },
        setup(props) {
            const state = Vue.reactive({
                editorType: props.editorType
            });

            const mixins = {};
            // 在浏览器环境中，我们需要手动注册编辑器组件
            // 这里假设所有编辑器组件都已经全局注册
            const editorTypes = window.editorTypes || ['default'];

            editorTypes.forEach(type => {
                if (window[type + 'Editor']) {
                    mixins[type] = window[type + 'Editor'];

                    // 未安装富文本编辑器时，值为 default，安装之后，则值为最后一个编辑器的名称
                    if (props.editorType === 'default' && type !== 'default') {
                        state.editorType = type;
                    }
                }
            });

            return {
                state,
                mixins
            };
        }
    };
});