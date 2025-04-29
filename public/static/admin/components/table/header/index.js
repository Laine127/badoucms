(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'element-plus', 'vue-i18n', 'lodash-es'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('element-plus'), require('lodash-es'));
    } else {
        // Browser globals
        root.TableHeader = factory(root.Vue, root.ElementPlus);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue, ElementPlus) {
    'use strict';

    const TableHeader = {
        template: `
            <div>
                <!-- 通用搜索 -->
                <transition name="el-zoom-in-bottom" mode="out-in">
                    <com-search v-show="props.buttons.includes('comSearch') && baTable?.table.showComSearch">
                        <template v-for="(slot, idx) in $slots" :key="idx" #[idx]>
                            <slot :name="idx"></slot>
                        </template>
                    </com-search>
                </transition>

                <!-- 操作按钮组 -->

            </div>
        `,
        props: {
            buttons: {
                type: Array,
                default: () => ['refresh', 'add', 'edit', 'delete']
            },
            quickSearchPlaceholder: {
                type: String,
                default: ''
            }
        },
        setup(props) {
            const { ref, computed, inject } = Vue;
            const baTable = inject('baTable') || {
                table: {
                    filter: {},
                    column: [],
                    selection: [],
                    showComSearch: false,
                    expandAll: false
                },
                auth: () => true,
                onTableHeaderAction: () => { }
            };

            const columnDisplay = computed(() => {
                let columnDisplayArr = [];
                // 添加空值检查
                if (baTable?.table?.column?.length) {
                    for (let item of baTable?.table.column) {
                        if (!(item.type === 'selection' || item.render === 'buttons' || item.enableColumnDisplayControl === false)) {
                            columnDisplayArr.push(item);
                        }
                    }
                }
                return columnDisplayArr;
            });

            const enableBatchOpt = computed(() =>
                baTable?.table?.selection?.length > 0 // 安全访问
            );
            const onAction = (event, data = {}) => {
                if (baTable?.onTableHeaderAction) {
                    baTable.onTableHeaderAction(event, data);
                }
            };

            const onSearchInput = _.debounce(() => {
                if (baTable?.onTableHeaderAction && baTable?.table?.filter) {
                    baTable.onTableHeaderAction('quick-search', {
                        keyword: baTable.table.filter.quickSearch
                    });
                }
            }, 500);

            const onChangeShowColumn = (value, field) => {
                if (baTable?.onTableHeaderAction) {
                    baTable.onTableHeaderAction('change-show-column', {
                        field: field,
                        value: value
                    });
                }
            };

            const toggleComSearch = () => {
                if (baTable?.table) {
                    baTable.table.showComSearch = !baTable.table.showComSearch;
                }
            };

            const toggleUnfold = () => {
                if (baTable?.table) {
                    const unfoldState = !baTable.table.expandAll;
                    baTable.onTableHeaderAction('unfold', { unfold: unfoldState });
                }
            };

            return {
                props,
                baTable,
                columnDisplay,
                enableBatchOpt,
                onAction,
                onSearchInput,
                onChangeShowColumn,
                toggleComSearch,
                toggleUnfold
            };
        }
    };

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .table-header {
            position: relative;
            overflow-x: auto;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            width: 100%;
            max-width: 100%;
            background-color: var(--ba-bg-color-overlay);
            border: 1px solid var(--ba-border-color);
            border-bottom: none;
            padding: 13px 15px;
            font-size: 14px;
        }
        .table-header-operate-text {
            margin-left: 6px;
        }
        .mlr-12 {
            margin-left: 12px;
        }
        .mlr-12 + .el-button {
            margin-left: 12px;
        }
        .table-search {
            display: flex;
            margin-left: auto;
        }
        .table-search .quick-search {
            width: auto;
        }
        .table-search-button-group {
            display: flex;
            margin-left: 12px;
            border: 1px solid var(--el-border-color);
            border-radius: var(--el-border-radius-base);
            overflow: hidden;
        }
        .table-search-button-group button:focus,
        .table-search-button-group button:active {
            background-color: var(--ba-bg-color-overlay);
        }
        .table-search-button-group button:hover {
            background-color: var(--el-color-info-light-7);
        }
        .table-search-button-item {
            height: 30px;
            border: none;
            border-radius: 0;
        }
        .table-search-button-group .el-button + .el-button {
            margin: 0;
        }
        .right-border {
            border-right: 1px solid var(--el-border-color);
        }
        html.dark .table-search-button-group button:focus,
        html.dark .table-search-button-group button:active {
            background-color: var(--el-color-info-dark-2);
        }
        html.dark .table-search-button-group button:hover {
            background-color: var(--el-color-info-light-7);
        }
        html.dark .table-search-button-group button {
            background-color: var(--ba-bg-color-overlay);
        }
        html.dark .table-search-button-group button el-icon {
            color: white !important;
        }
    `;
    document.head.appendChild(style);

    return TableHeader;
}));