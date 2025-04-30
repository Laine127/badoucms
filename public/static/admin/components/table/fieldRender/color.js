(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'element-plus'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('element-plus'));
    } else {
        // Browser globals
        root.ColorRenderer = factory(root.Vue, root.ElementPlus);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue) {
    'use strict';

    const ColorRenderer = {
        template: `
            <div>
                <div :style="{ background: cellValue }" class="ba-table-render-color"></div>
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
            // const cellValue = getCellValue(props.row, props.field, props.column, props.index);
            cellValue = '#111';
            return {
                cellValue
            };
        }
    };

    return ColorRenderer;
}));