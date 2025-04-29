(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'element-plus', 'vue-i18n', 'lodash-es'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('element-plus'), require('lodash-es'));
    } else {
        // Browser globals
        root.TableComponent = factory(root.Vue, root.ElementPlus);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue, ElementPlus) {
    'use strict';

    const TableComponent = {
        template: `
        <div>
            <slot name="neck"></slot>
            <el-table
                ref="tableRef"
                class="ba-data-table w100"
                header-cell-class-name="table-header-cell"
                :default-expand-all="baTable?.table.expandAll"
                :data="baTable?.table.data"
                :row-key="baTable?.table.pk"
                :border="true"
                v-loading="baTable?.table.loading"
                stripe
                @select-all="onSelectAll"
                @select="onSelect"
                @selection-change="onSelectionChange"
                @sort-change="onSortChange"
                @row-dblclick="baTable?.onTableDblclick"
                v-bind="$attrs"
            >
                <slot name="columnPrepend"></slot>
                <template v-for="(item, key) in baTable?.table.column">
                    <template v-if="item.show !== false">
                        <slot v-if="item.render == 'slot'" :name="item.slotName"></slot>
                        <el-table-column
                            v-else
                            :key="key + '-column'"
                            v-bind="item"
                            :column-key="(item['columnKey'] ? item['columnKey'] : 'table-column-' + item.prop) || shortUuid()"
                        >
                            <template v-if="item.render" #default="scope">
                                <component
                                    :row="scope.row"
                                    :field="item"
                                    :column="scope.column"
                                    :index="scope.$index"
                                    :is="fieldRenderer[item.render] ?? fieldRenderer['default']"
                                    :key="getRenderKey(key, item, scope)"
                                />
                            </template>
                        </el-table-column>
                    </template>
                </template>
                <slot name="columnAppend"></slot>
            </el-table>
            <div v-if="props.pagination" class="table-pagination">
                <el-pagination
                    :currentPage="baTable?.table.filter.page"
                    :page-size="baTable?.table.filter.limit"
                    :page-sizes="pageSizes"
                    background
                    :layout="config.layout.shrink ? 'prev, next, jumper' : 'sizes,total, ->, prev, pager, next, jumper'"
                    :total="baTable?.table.total"
                    @size-change="onTableSizeChange"
                    @current-change="onTableCurrentChange"
                ></el-pagination>
            </div>
            <slot name="footer"></slot>
        </div>
    `,
        props: {
            pagination: {
                type: Boolean,
                default: true
            }
        },
        setup(props) {
            const { ref, computed, nextTick, inject } = Vue;
            const config = useConfig();
            const tableRef = ref(null);
            const baTable = inject('baTable')

            const fieldRenderer = {};

            const getRenderKey = (key, item, scope) => {
                if (item.getRenderKey && typeof item.getRenderKey == 'function') {
                    return item.getRenderKey(scope.row, item, scope.column, scope.$index);
                }
                if (item.render == 'switch') {
                    return item.render + item.prop;
                }
                return key + scope.$index + '-' + item.render + '-' + (item.prop ? '-' + item.prop + '-' + scope.row[item.prop] : '');
            };

            const onTableSizeChange = (val) => {
                baTable.onTableAction('page-size-change', { size: val });
            };

            const onTableCurrentChange = (val) => {
                baTable.onTableAction('current-page-change', { page: val });
            };

            const onSortChange = ({ order, prop }) => {
                baTable.onTableAction('sort-change', { prop: prop, order: order ? (order == 'ascending' ? 'asc' : 'desc') : '' });
            };

            const pageSizes = computed(() => {
                let defaultSizes = [10, 20, 50, 100];
                if (baTable.table.filter.limit) {
                    if (!defaultSizes.includes(baTable.table.filter.limit)) {
                        defaultSizes.push(baTable.table.filter.limit);
                    }
                }
                return defaultSizes;
            });

            const onSelectAll = (selection) => {
                if (isSelectAll(selection.map((row) => row[baTable.table.pk].toString()))) {
                    selection.map((row) => {
                        if (row.children) {
                            selectChildren(row.children, true);
                        }
                    });
                } else {
                    tableRef.value?.clearSelection();
                }
            };

            const isSelectAll = (selectIds) => {
                let data = baTable.table.data;
                for (const key in data) {
                    return selectIds.includes(data[key][baTable.table.pk].toString());
                }
                return false;
            };

            const selectChildren = (children, type) => {
                children.map((j) => {
                    toggleSelection(j, type);
                    if (j.children) {
                        selectChildren(j.children, type);
                    }
                });
            };

            const toggleSelection = (row, type) => {
                if (row) {
                    nextTick(() => {
                        tableRef.value?.toggleRowSelection(row, type);
                    });
                }
            };

            const onSelect = (selection, row) => {
                if (selection.some((item) => row[baTable.table.pk] === item[baTable.table.pk])) {
                    if (row.children) {
                        selectChildren(row.children, true);
                    }
                } else {
                    if (row.children) {
                        selectChildren(row.children, false);
                    }
                }
            };

            const onSelectionChange = (selection) => {
                baTable.onTableAction('selection-change', selection);
            };

            const setUnFoldAll = (children, unfold) => {
                for (const key in children) {
                    tableRef.value?.toggleRowExpansion(children[key], unfold);
                    if (children[key].children) {
                        setUnFoldAll(children[key].children, unfold);
                    }
                }
            };

            const unFoldAll = (unfold) => {
                setUnFoldAll(baTable.table.data, unfold);
            };

            const getRef = () => {
                return tableRef.value;
            };

            return {
                props,
                config,
                tableRef,
                baTable,
                fieldRenderer,
                getRenderKey,
                onTableSizeChange,
                onTableCurrentChange,
                onSortChange,
                pageSizes,
                onSelectAll,
                onSelect,
                onSelectionChange,
                unFoldAll,
                getRef
            };
        }
    };
    return TableComponent;
}));