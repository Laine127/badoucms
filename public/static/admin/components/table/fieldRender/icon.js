(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'element-plus'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('element-plus'));
    } else {
        // Browser globals
        root.IconRenderer = factory(root.Vue, root.ElementPlus);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue) {
    'use strict';

    const IconRenderer = {
        template: `
            <div>
                <Icon color="var(--el-text-color-primary)" :name="getCellValue(props.row, props.field, props.column, props.index)" />
            </div>
        `,
        props: {
            row: {
                type: Object,
                required: true
            },
            field: {
                type: Object,
                required: true
            },
            column: {
                type: Object,
                required: true
            },
            index: {
                type: Number,
                required: true
            }
        },
        setup(props) {
            const getCellValue = (row, field, column, index) => {
                return tableUtils.getCellValue(row, field, column, index);
            }
            return {
                props,
                getCellValue
            };
        }
    };

    return IconRenderer;
}));