(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('element-plus'), require('lodash-es'), require('sortablejs'), require('vue')) :
        typeof define === 'function' && define.amd ? define(['element-plus', 'lodash-es', 'sortablejs', 'vue'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.baTableClass = factory(global.ElementPlus, global._, global.Sortable, global.Vue));
})(this, (function (ElementPlus, _, Sortable, Vue) {
    'use strict';

    const { ElNotification, dayjs } = ElementPlus;
    const { cloneDeep, isEmpty } = _;
    const { reactive } = Vue;

    function baTable(api, table = {}, form = {}, before = {}, after = {}) {
        // API实例
        this.api = api;

        /* 表格状态 */
        this.table = reactive(Object.assign({
            ref: undefined,
            pk: 'id',
            data: [],
            remark: null,
            loading: false,
            selection: [],
            column: [],
            total: 0,
            filter: {},
            dragSortLimitField: 'pid',
            acceptQuery: true,
            showComSearch: false,
            dblClickNotEditColumn: [undefined],
            expandAll: false,
            extend: {}
        }, table));

        /* 表单状态 */
        this.form = reactive(Object.assign({
            ref: undefined,
            labelWidth: 160,
            operate: '',
            operateIds: [],
            items: {},
            submitLoading: false,
            defaultItems: {},
            loading: false,
            extend: {}
        }, form));

        // 前置处理函数列表
        this.before = before;

        // 后置处理函数列表
        this.after = after;

        // 通用搜索数据
        this.comSearch = reactive({
            form: {},
            fieldData: new Map()
        });
    }

    baTable.prototype = {
        constructor: baTable,

        // 表格内部鉴权方法
        auth(node) {
            return window.auth ? window.auth(node) : true;
        },

        // 运行前置函数
        runBefore(funName, args = {}) {
            if (this.before && this.before[funName] && typeof this.before[funName] === 'function') {
                return this.before[funName]({ ...args }) === false ? false : true;
            }
            return true;
        },

        // 运行后置函数
        runAfter(funName, args = {}) {
            if (this.after && this.after[funName] && typeof this.after[funName] === 'function') {
                return this.after[funName]({ ...args }) === false ? false : true;
            }
            return true;
        },

        // 查看
        getIndex() {
            if (this.runBefore('getIndex') === false) return;
            this.table.loading = true;

            return this.api
                .index(this.table.filter)
                .then((res) => {
                    this.table.data = res.data.list;
                    this.table.total = res.data.total;
                    this.table.remark = res.data.remark;
                    this.runAfter('getIndex', { res });
                })
                .finally(() => {
                    this.table.loading = false;
                });
        },

        // 删除
        postDel(ids) {
            if (this.runBefore('postDel', { ids }) === false) return;
            this.api.del(ids).then((res) => {
                this.onTableHeaderAction('refresh', {});
                this.runAfter('postDel', { res });
            });
        },

        // 编辑
        requestEdit(id) {
            if (this.runBefore('requestEdit', { id }) === false) return;
            this.form.loading = true;
            this.form.items = {};
            return this.api
                .edit({
                    [this.table.pk]: id
                })
                .then((res) => {
                    console.info(res.data.row);
                    this.form.items = res.data.row;
                    this.runAfter('requestEdit', { res });
                })
                .catch((err) => {
                    this.toggleForm();
                    this.runAfter('requestEdit', { err });
                })
                .finally(() => {
                    this.form.loading = false;
                });
        },

        // 双击表格
        onTableDblclick(row, column) {
            if (!this.table.dblClickNotEditColumn.includes('all') && !this.table.dblClickNotEditColumn.includes(column.property)) {
                if (this.runBefore('onTableDblclick', { row, column }) === false) return;
                this.toggleForm('Edit', [row[this.table.pk]]);
                this.runAfter('onTableDblclick', { row, column });
            }
        },

        // 打开表单
        toggleForm(operate = '', operateIds = []) {
            if (this.runBefore('toggleForm', { operate, operateIds }) === false) return;
            if (operate === 'Edit') {
                if (!operateIds.length) {
                    return false;
                }
                this.requestEdit(operateIds[0]);
            } else if (operate === 'Add') {
                this.form.items = cloneDeep(this.form.defaultItems);
            }
            this.form.operate = operate;
            this.form.operateIds = operateIds;

            this.runAfter('toggleForm', { operate, operateIds });
        },

        // 提交表单
        onSubmit(formEl) {
            const operate = this.form.operate.replace(this.form.operate[0], this.form.operate[0].toLowerCase());

            if (this.runBefore('onSubmit', { formEl, operate, items: this.form.items }) === false) return;

            Object.keys(this.form.items).forEach((item) => {
                if (this.form.items[item] === null) delete this.form.items[item];
            });

            const submitCallback = () => {
                this.form.submitLoading = true;
                this.api
                    .postData(operate, this.form.items)
                    .then((res) => {
                        this.onTableHeaderAction('refresh', {});

                        this.form.operateIds.shift();
                        if (this.form.operateIds.length > 0) {
                            this.toggleForm('Edit', this.form.operateIds);
                        } else {
                            this.toggleForm();
                        }
                        this.runAfter('onSubmit', { res });
                    })
                    .finally(() => {
                        this.form.submitLoading = false;
                    });
            };

            if (formEl) {
                this.form.ref = formEl;
                formEl.validate((valid) => {
                    if (valid) {
                        submitCallback();
                    }
                });
            } else {
                submitCallback();
            }
        },

        // 获取表格选择项的id数组
        getSelectionIds() {
            const ids = [];
            this.table.selection.forEach((item) => {
                ids.push(item[this.table.pk]);
            });
            return ids;
        },

        // 表格内的事件统一响应
        onTableAction(event, data) {
            if (this.runBefore('onTableAction', { event, data }) === false) return;
            const actionFun = new Map([
                [
                    'selection-change',
                    () => {
                        this.table.selection = data;
                    },
                ],
                [
                    'page-size-change',
                    () => {
                        this.table.filter.limit = data.size;
                        this.onTableHeaderAction('refresh', { event: 'page-size-change', ...data });
                    },
                ],
                [
                    'current-page-change',
                    () => {
                        this.table.filter.page = data.page;
                        this.onTableHeaderAction('refresh', { event: 'current-page-change', ...data });
                    },
                ],
                [
                    'sort-change',
                    () => {
                        let newOrder;
                        if (data.prop && data.order) {
                            newOrder = data.prop + ',' + data.order;
                        }
                        if (newOrder != this.table.filter.order) {
                            this.table.filter.order = newOrder;
                            this.onTableHeaderAction('refresh', { event: 'sort-change', ...data });
                        }
                    },
                ],
                [
                    'edit',
                    () => {
                        this.toggleForm('Edit', [data.row[this.table.pk]]);
                    },
                ],
                [
                    'delete',
                    () => {
                        this.postDel([data.row[this.table.pk]]);
                    },
                ],
                ['field-change', () => { }],
                [
                    'com-search',
                    () => {
                        this.table.filter.search = this.getComSearchData();
                        this.onTableHeaderAction('refresh', { event: 'com-search', data: this.table.filter.search });
                    },
                ],
                [
                    'default',
                    () => {
                        console.warn('No action defined');
                    },
                ],
            ]);

            const action = actionFun.get(event) || actionFun.get('default');
            action.call(this);
            return this.runAfter('onTableAction', { event, data });
        },

        // 表格顶栏按钮事件统一响应
        onTableHeaderAction(event, data) {
            if (this.runBefore('onTableHeaderAction', { event, data }) === false) return;
            const actionFun = new Map([
                [
                    'refresh',
                    () => {
                        this.table.data = [];
                        this.getIndex();
                    },
                ],
                [
                    'add',
                    () => {
                        this.toggleForm('Add');
                    },
                ],
                [
                    'edit',
                    () => {
                        this.toggleForm('Edit', this.getSelectionIds());
                    },
                ],
                [
                    'delete',
                    () => {
                        this.postDel(this.getSelectionIds());
                    },
                ],
                [
                    'unfold',
                    () => {
                        if (!this.table.ref) {
                            console.warn('Collapse/expand failed because table ref is not defined. Please assign table ref when onMounted');
                            return;
                        }
                        this.table.expandAll = data.unfold;
                        this.table.ref.unFoldAll(data.unfold);
                    },
                ],
                [
                    'quick-search',
                    () => {
                        this.onTableHeaderAction('refresh', { event: 'quick-search', ...data });
                    },
                ],
                [
                    'change-show-column',
                    () => {
                        const columnKey = this.getArrayKey(this.table.column, 'prop', data.field);
                        this.table.column[columnKey].show = data.value;
                    },
                ],
                [
                    'default',
                    () => {
                        console.warn('No action defined');
                    },
                ],
            ]);

            const action = actionFun.get(event) || actionFun.get('default');
            action.call(this);
            return this.runAfter('onTableHeaderAction', { event, data });
        },

        // 初始化默认排序
        initSort() {
            if (this.table.defaultOrder && this.table.defaultOrder.prop) {
                if (!this.table.ref) {
                    console.warn('Failed to initialize default sorting because table ref is not defined. Please assign table ref when onMounted');
                    return;
                }

                const defaultOrder = this.table.defaultOrder.prop + ',' + this.table.defaultOrder.order;
                if (this.table.filter && this.table.filter.order != defaultOrder) {
                    this.table.filter.order = defaultOrder;
                    this.table.ref.getRef().sort(this.table.defaultOrder.prop, this.table.defaultOrder.order == 'desc' ? 'descending' : 'ascending');
                }
            }
        },

        // 初始化表格拖动排序
        dragSort() {
            // const buttonsKey = this.getArrayKey(this.table.column, 'render', 'buttons');
            // if (buttonsKey === false) return;
            // const moveButton = this.getArrayKey(this.table.column[buttonsKey].buttons, 'render', 'moveButton');
            // if (moveButton === false) return;
            // if (!this.table.ref) {
            //     console.warn('Failed to initialize drag sort because table ref is not defined. Please assign table ref when onMounted');
            //     return;
            // }

            // const el = this.table.ref.getRef().$el.querySelector('.el-table__body-wrapper .el-table__body tbody');
            // const disabledTip = this.table.column[buttonsKey].buttons[moveButton].disabledTip;
            // Sortable.create(el, {
            //     animation: 200,
            //     handle: '.table-row-weigh-sort',
            //     ghostClass: 'ba-table-row',
            //     onStart: () => {
            //         this.table.column[buttonsKey].buttons[moveButton].disabledTip = true;
            //     },
            //     onEnd: (evt) => {
            //         this.table.column[buttonsKey].buttons[moveButton].disabledTip = disabledTip;

            //         if (evt.oldIndex == evt.newIndex || typeof evt.newIndex == 'undefined' || typeof evt.oldIndex == 'undefined') return;

            //         const moveRow = this.findIndexRow(this.table.data, evt.oldIndex);
            //         const targetRow = this.findIndexRow(this.table.data, evt.newIndex);

            //         if (this.table.dragSortLimitField && moveRow[this.table.dragSortLimitField] != targetRow[this.table.dragSortLimitField]) {
            //             this.onTableHeaderAction('refresh', {});
            //             ElNotification({
            //                 type: 'error',
            //                 message: window.i18n ? window.i18n.global.t('utils.The moving position is beyond the movable range!') : 'The moving position is beyond the movable range!',
            //             });
            //             return;
            //         }

            //         this.api
            //             .sortable({
            //                 move: moveRow[this.table.pk],
            //                 target: targetRow[this.table.pk],
            //                 order: this.table.filter.order,
            //                 direction: evt.newIndex > evt.oldIndex ? 'down' : 'up',
            //             })
            //             .finally(() => {
            //                 this.onTableHeaderAction('refresh', {});
            //             });
            //     },
            // });
        },

        // 表格初始化
        mount() {
            if (this.runBefore('mount') === false) return;

            // const route = useRoute();
            // this.table.routePath = route.fullPath;

            this.initComSearch();

            if (this.table.acceptQuery) {
                // this.setComSearchData(route.query);
                this.table.filter.search = this.getComSearchData().concat(this.table.filter.search || []);
            }
        },

        // 通用搜索初始化
        initComSearch() {
            const form = {};
            const field = this.table.column;

            if (field.length <= 0) return;

            for (const key in field) {
                if (field[key].operator === false) continue;

                if (typeof field[key].operator == 'undefined') {
                    field[key].operator = 'eq';
                }

                const prop = field[key].prop;
                if (prop) {
                    if (field[key].operator == 'RANGE' || field[key].operator == 'NOT RANGE') {
                        form[prop] = '';
                        form[prop + '-start'] = '';
                        form[prop + '-end'] = '';
                    } else if (field[key].operator == 'NULL' || field[key].operator == 'NOT NULL') {
                        form[prop] = false;
                    } else {
                        form[prop] = '';
                    }

                    this.comSearch.fieldData.set(prop, {
                        operator: field[key].operator,
                        render: field[key].render,
                        comSearchRender: field[key].comSearchRender,
                    });
                }
            }

            this.comSearch.form = Object.assign(this.comSearch.form, form);
        },

        // 设置通用搜索数据
        setComSearchData(query) {
            for (const key in this.table.column) {
                const prop = this.table.column[key].prop;
                if (prop && typeof query[prop] !== 'undefined') {
                    const queryProp = query[prop] || '';
                    if (this.table.column[key].operator == 'RANGE' || this.table.column[key].operator == 'NOT RANGE') {
                        const range = queryProp.split(',');
                        if (this.table.column[key].render == 'datetime' || this.table.column[key].comSearchRender == 'date') {
                            if (range && range.length >= 2) {
                                const rangeDayJs = [dayjs(range[0]), dayjs(range[1])];
                                if (rangeDayJs[0].isValid() && rangeDayJs[1].isValid()) {
                                    if (this.table.column[key].comSearchRender == 'date') {
                                        this.comSearch.form[prop] = [rangeDayJs[0].format('YYYY-MM-DD'), rangeDayJs[1].format('YYYY-MM-DD')];
                                    } else {
                                        this.comSearch.form[prop] = [
                                            rangeDayJs[0].format('YYYY-MM-DD HH:mm:ss'),
                                            rangeDayJs[1].format('YYYY-MM-DD HH:mm:ss'),
                                        ];
                                    }
                                }
                            }
                        } else {
                            this.comSearch.form[prop + '-start'] = range[0] || '';
                            this.comSearch.form[prop + '-end'] = range[1] || '';
                        }
                    } else if (this.table.column[key].operator == 'NULL' || this.table.column[key].operator == 'NOT NULL') {
                        this.comSearch.form[prop] = queryProp ? true : false;
                    } else if (this.table.column[key].render == 'datetime' || this.table.column[key].comSearchRender == 'date') {
                        const propDayJs = dayjs(queryProp);
                        if (propDayJs.isValid()) {
                            if (this.table.column[key].comSearchRender == 'date') {
                                this.comSearch.form[prop] = propDayJs.format('YYYY-MM-DD');
                            } else {
                                this.comSearch.form[prop] = propDayJs.format('YYYY-MM-DD HH:mm:ss');
                            }
                        }
                    } else {
                        this.comSearch.form[prop] = queryProp;
                    }
                }
            }
        },

        // 获取通用搜索数据
        getComSearchData() {
            const where = [];
            if (!this.comSearch.fieldData.size) return where;

            for (const [field, data] of this.comSearch.fieldData) {
                if (data.operator == 'RANGE' || data.operator == 'NOT RANGE') {
                    if (this.comSearch.form[field] && Array.isArray(this.comSearch.form[field])) {
                        where.push({
                            field: field,
                            val: this.comSearch.form[field].join(','),
                            operator: data.operator,
                        });
                    }
                } else if (data.operator == 'NULL' || data.operator == 'NOT NULL') {
                    if (this.comSearch.form[field]) {
                        where.push({
                            field: field,
                            val: '',
                            operator: data.operator,
                        });
                    }
                } else if (this.comSearch.form[field]) {
                    where.push({
                        field: field,
                        val: this.comSearch.form[field],
                        operator: data.operator,
                    });
                }
            }
            return where;
        },

        // 工具方法：获取数组中指定的key和value所在的索引
        getArrayKey(array, key, value) {
            if (!Array.isArray(array)) return false;
            for (const i in array) {
                if (array[i][key] == value) return i;
            }
            return false;
        },

        // 工具方法：根据索引获取数组中的行数据
        findIndexRow(data, index) {
            let i = 0;
            for (const key in data) {
                if (i === index) {
                    return data[key];
                }
                i++;
            }
            return null;
        }
    };

    return baTable;
}));