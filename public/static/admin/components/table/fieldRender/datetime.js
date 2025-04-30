(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'element-plus'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('element-plus'));
    } else {
        // Browser globals
        root.Datetime = factory(root.Vue, root.ElementPlus);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue) {
    'use strict';

    const Datetime = {
        template: `
            <div>
                {{ !cellValue ? '-' : timeFormat(cellValue, field.timeFormat ?? 'yyyy-mm-dd hh:MM:ss') }}
            </div>
        `,
        props: {
            row: {
                type: Object,
            },
            field: {
                type: Object,
            },
            column: {
                type: Object,
            },
            index: {
                type: Number,
            }
        },
        setup(props) {
            const cellValue = tableUtils.getCellValue(props.row, props.field, props.column, props.index);
            return {
                cellValue,
                timeFormat
            };
        }
    };
    return Datetime;
}));