(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'element-plus'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('element-plus'));
    } else {
        // Browser globals (root is window)
        root.tableUtils = factory(root.Vue, root.ElementPlus);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue, ElementPlus) {
    'use strict';

    /**
     * 获取单元格值
     */
    const getCellValue = (row, field, column, index) => {
        if (!field || !field.prop) return '';

        const prop = field.prop;
        let cellValue = row[prop];

        // 字段 prop 带 . 比如 user.nickname
        if (prop.indexOf('.') > -1) {
            const fieldNameArr = prop.split('.');
            cellValue = row[fieldNameArr[0]];
            for (let index = 1; index < fieldNameArr.length; index++) {
                cellValue = cellValue ? cellValue[fieldNameArr[index]] ?? '' : '';
            }
            return cellValue;
        }

        // 若无值，尝试取默认值
        if (cellValue === undefined || cellValue === null) {
            cellValue = field.default;
        }

        // 渲染前格式化
        if (field.renderFormatter && typeof field.renderFormatter == 'function') {
            cellValue = field.renderFormatter(row, field, cellValue, column, index);
            console.warn('baTable.table.column.renderFormatter 即将废弃，请直接使用兼容 el-table 的 baTable.table.column.formatter 代替');
        }
        if (field.formatter && typeof field.formatter == 'function') {
            cellValue = field.formatter(row, column, cellValue, index);
        }

        return cellValue;
    };

    /**
     * 默认按钮组
     */
    const defaultOptButtons = (optButType = ['weigh-sort', 'edit', 'delete']) => {
        const optButtonsPre = new Map([
            [
                'weigh-sort',
                {
                    render: 'moveButton',
                    name: 'weigh-sort',
                    title: 'Drag sort',
                    text: '',
                    type: 'info',
                    icon: 'fa fa-arrows',
                    class: 'table-row-weigh-sort',
                    disabledTip: false,
                },
            ],
            [
                'edit',
                {
                    render: 'tipButton',
                    name: 'edit',
                    title: 'Edit',
                    text: '',
                    type: 'primary',
                    icon: 'fa fa-pencil',
                    class: 'table-row-edit',
                    disabledTip: false,
                },
            ],
            [
                'delete',
                {
                    render: 'confirmButton',
                    name: 'delete',
                    title: 'Delete',
                    text: '',
                    type: 'danger',
                    icon: 'fa fa-trash',
                    class: 'table-row-delete',
                    popconfirm: {
                        confirmButtonText: window.i18n?.t('Delete') || 'Delete',
                        cancelButtonText: window.i18n?.t('Cancel') || 'Cancel',
                        confirmButtonType: 'danger',
                        title: window.i18n?.t('Are you sure to delete the selected record?') || 'Are you sure to delete?',
                    },
                    disabledTip: false,
                },
            ],
            [
                'reply',
                {
                    render: 'basicButton',
                    name: 'edit',
                    title: 'Reply',
                    text: '',
                    type: 'primary',
                    icon: 'fa fa-mail-reply',
                    class: 'table-row-delete',
                    disabledTip: false,
                },
            ],
        ]);

        const optButtons = [];
        for (const key in optButType) {
            if (optButtonsPre.has(optButType[key])) {
                optButtons.push(optButtonsPre.get(optButType[key]));
            }
        }
        return optButtons;
    };

    /**
     * 将带children的数组降维，然后寻找index所在的行
     */
    const findIndexRow = (data, findIdx, keyIndex = -1) => {
        for (const key in data) {
            if (typeof keyIndex == 'number') {
                keyIndex++;
            }

            if (keyIndex == findIdx) {
                return data[key];
            }

            if (data[key].children) {
                keyIndex = findIndexRow(data[key].children, findIdx, keyIndex);
                if (typeof keyIndex != 'number') {
                    return keyIndex;
                }
            }
        }

        return keyIndex;
    };

    return {
        getCellValue,
        defaultOptButtons,
        findIndexRow
    };
}));
