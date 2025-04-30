(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'element-plus'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('element-plus'));
    } else {
        // Browser globals
        root.Switch = factory(root.Vue, root.ElementPlus);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue) {
    'use strict';

    const Switch = {
        template: `
            <div>
                <el-switch
                    v-if="field.prop"
                    @change="onChange"
                    :model-value="cellValue"
                    :loading="loading"
                    active-value="1"
                    inactive-value="0"
                />
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
            const { ref, inject } = Vue;
            const loading = ref(false);
            const baTable = inject('baTable');
            const cellValue = ref(tableUtils.getCellValue(props.row, props.field, props.column, props.index));

            if (typeof cellValue.value === 'number') {
                cellValue.value = cellValue.value.toString();
            }

            const onChange = (value) => {
                loading.value = true;
                const postData = {
                    [baTable.table.pk]: props.row[baTable.table.pk],
                    [props.field.prop]: value
                };

                baTable.api.postData('edit', postData)
                    .then(() => {
                        cellValue.value = value;
                        baTable.onTableAction('field-change', { value: value, ...props });
                    })
                    .finally(() => {
                        loading.value = false;
                    });
            };

            return {
                loading,
                cellValue,
                baTable,
                onChange
            };
        }
    };

    return Switch;
}));