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
                <div v-bind="$attrs" class="table-header ba-scroll-style">
                    <slot name="refreshPrepend"></slot>
                    <el-tooltip v-if="props.buttons.includes('refresh')" :content="__('Refresh')" placement="top">
                        <el-button v-blur @click="onAction('refresh', { loading: true })" color="#40485b" class="table-header-operate" type="info">
                            <Icon name="fa fa-refresh" />
                        </el-button>
                    </el-tooltip>
                    <slot name="refreshAppend"></slot>
                    <el-tooltip v-if="props.buttons.includes('add') && baTable?.auth('add')" :content="__('Add')" placement="top">
                        <el-button v-blur @click="onAction('add')" class="table-header-operate" type="primary">
                            <Icon name="fa fa-plus" />
                            <span class="table-header-operate-text">{{ __('Add') }}</span>
                        </el-button>
                    </el-tooltip>
                    <el-tooltip v-if="props.buttons.includes('edit') && baTable?.auth('edit')" :content="__('Edit selected row')" placement="top">
                        <el-button v-blur @click="onAction('edit')" :disabled="!enableBatchOpt" class="table-header-operate" type="primary">
                            <Icon name="fa fa-pencil" />
                            <span class="table-header-operate-text">{{ __('Edit') }}</span>
                        </el-button>
                    </el-tooltip>
                    <el-popconfirm
                        v-if="props.buttons.includes('delete') && baTable?.auth('del')"
                        @confirm="onAction('delete')"
                        :confirm-button-text="__('Delete')"
                        :cancel-button-text="__('Cancel')"
                        confirmButtonType="danger"
                        :title="__('Are you sure to delete the selected record?')"
                        :disabled="!enableBatchOpt"
                    >
                        <template #reference>
                            <div class="mlr-12">
                                <el-tooltip :content="__('Delete selected row')" placement="top">
                                    <el-button v-blur :disabled="!enableBatchOpt" class="table-header-operate" type="danger">
                                        <Icon name="fa fa-trash" />
                                        <span class="table-header-operate-text">{{ __('Delete') }}</span>
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </template>
                    </el-popconfirm>
                    <el-tooltip
                        v-if="props.buttons.includes('unfold')"
                        :content="(baTable?.table.expandAll ? __('Shrink') : __('Open')) + __('All submenus')"
                        placement="top"
                    >
                        <el-button
                            v-blur
                            @click="toggleUnfold"
                            class="table-header-operate"
                            :type="baTable?.table.expandAll ? 'danger' : 'warning'"
                        >
                            <span class="table-header-operate-text">{{ baTable?.table.expandAll ? __('Shrink all') : __('Expand all') }}</span>
                        </el-button>
                    </el-tooltip>

                    <!-- slot -->
                    <slot></slot>

                    <!-- 右侧搜索框和工具按钮 -->
                    <div class="table-search">
                        <slot name="quickSearchPrepend"></slot>
                        <el-input
                            v-if="props.buttons.includes('quickSearch')"
                            v-model="quickSearch"
                            class="xs-hidden quick-search"
                            @input="onSearchInput"
                            :placeholder="quickSearchPlaceholder ? quickSearchPlaceholder : __('Search')"
                            clearable
                        />
                        <div class="table-search-button-group" v-if="props.buttons.includes('columnDisplay') || props.buttons.includes('comSearch')">
                            <el-dropdown v-if="props.buttons.includes('columnDisplay')" :max-height="380" :hide-on-click="false">
                                <el-button
                                    class="table-search-button-item"
                                    :class="props.buttons.includes('comSearch') ? 'right-border' : ''"
                                    color="#dcdfe6"
                                    plain
                                    v-blur
                                >
                                    <Icon size="14" name="el-icon-Grid" />
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-for="(item, idx) in columnDisplay" :key="idx">
                                            <el-checkbox
                                                v-if="item.prop"
                                                @change="onChangeShowColumn($event, item.prop)"
                                                :checked="!item.show"
                                                :model-value="item.show"
                                                size="small"
                                                :label="item.label"
                                            />
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                            <el-tooltip
                                v-if="props.buttons.includes('comSearch')"
                                :disabled="baTable?.table.showComSearch"
                                :content="__('Expand generic search')"
                                placement="top"
                            >
                                <el-button
                                    class="table-search-button-item"
                                    @click="toggleComSearch"
                                    color="#dcdfe6"
                                    plain
                                    v-blur
                                >
                                    <Icon size="14" name="el-icon-Search" />
                                </el-button>
                            </el-tooltip>
                        </div>
                    </div>
                </div>
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
            const { ref, computed, inject, watch } = Vue;
            const baTable = inject('baTable') || {
                table: {
                    filter: {
                        quickSearch: ''
                    },
                    column: [],
                    selection: [],
                    showComSearch: false,
                    expandAll: false
                },
                auth: () => true,
                onTableHeaderAction: () => { }
            };

            const quickSearch = ref(baTable?.table?.filter?.quickSearch || '');

            const columnDisplay = computed(() => {
                let columnDisplayArr = [];
                if (baTable?.table?.column) {
                    columnDisplayArr = baTable.table.column.filter(item =>
                        item &&
                        item.type !== 'selection' &&
                        item.render !== 'buttons' &&
                        item.enableColumnDisplayControl !== false
                    );
                }
                return columnDisplayArr;
            });

            const enableBatchOpt = computed(() =>
                (baTable?.table?.selection || []).length > 0
            );

            const onAction = (event, data = {}) => {
                if (baTable?.onTableHeaderAction) {
                    baTable.onTableHeaderAction(event, data);
                }
            };

            const onSearchInput = _.debounce(() => {
                if (baTable?.onTableHeaderAction && baTable?.table?.filter) {
                    baTable.onTableHeaderAction('quick-search', {
                        keyword: baTable.table.filter.quickSearch || ''
                    });
                }
            }, 500);

            const onChangeShowColumn = (value, field) => {
                if (baTable?.onTableHeaderAction) {
                    baTable.onTableHeaderAction('change-show-column', {
                        field,
                        value
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
            // 监听变化
            watch(quickSearch, (val) => {
                if (baTable?.table?.filter) {
                    baTable.table.filter.quickSearch = val;
                }
            });
            return {
                quickSearch,
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
    return TableHeader;
}));