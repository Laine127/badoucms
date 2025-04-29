(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['vue', 'vue-i18n', 'element-plus'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('vue'), require('vue-i18n'), require('element-plus'));
    } else {
        global.SelectFile = factory(global.Vue, global.VueI18n, global.ElementPlus);
    }
}(this, function (Vue, VueI18n, ElementPlus) {
    'use strict';

    const template = `
    <div>
        <el-dialog
            @close="emits('update:modelValue', false)"
            width="60%"
            :model-value="modelValue"
            class="ba-upload-select-dialog"
            :title="t('utils.Select File')"
            :append-to-body="true"
            :destroy-on-close="true"
            top="4vh"
        >
            <TableHeader
                :buttons="['refresh', 'comSearch', 'quickSearch', 'columnDisplay']"
                :quick-search-placeholder="t('Quick search placeholder', { fields: t('utils.Original name') })"
            >
                <el-tooltip :content="t('utils.choice')" placement="top">
                    <el-button
                        @click="onChoice"
                        :disabled="baTable.table.selection.length > 0 ? false : true"
                        v-blur
                        class="table-header-operate"
                        type="primary"
                    >
                        <Icon name="fa fa-check" />
                        <span class="table-header-operate-text">{{ t('utils.choice') }}</span>
                    </el-button>
                </el-tooltip>
                <div class="ml-10" v-if="limit !== 0">
                    {{ t('utils.You can also select') }}
                    <span class="selection-count">{{ limit - baTable.table.selection.length }}</span>
                    {{ t('utils.items') }}
                </div>
            </TableHeader>

            <Table ref="tableRef" @selection-change="onSelectionChange" />
        </el-dialog>
    </div>
    `;

    const SelectFile = {
        name: 'SelectFile',
        template: template,
        props: {
            type: {
                type: String,
                default: 'file'
            },
            limit: {
                type: Number,
                default: 0
            },
            modelValue: {
                type: Boolean,
                default: false
            },
            returnFullUrl: {
                type: Boolean,
                default: false
            }
        },
        setup(props, { emit }) {
            const tableRef = Vue.ref();
            const { t } = VueI18n.useI18n();
            const state = Vue.reactive({
                ready: false,
                tableSelectable: true
            });

            const optBtn = [{
                render: 'tipButton',
                name: 'choice',
                text: t('utils.choice'),
                type: 'primary',
                icon: 'fa fa-check',
                class: 'table-row-choice',
                disabledTip: false,
                click: (row) => {
                    const elTableRef = tableRef.value.getRef();
                    elTableRef.clearSelection();
                    emit('choice', props.returnFullUrl ? [row.full_url] : [row.url]);
                }
            }];

            const baTable = new window.baTableClass(new window.baTableApi('/admin/routine.Attachment/'), {
                acceptQuery: false,
                column: [
                    {
                        type: 'selection',
                        selectable: (row) => {
                            if (props.limit == 0) return true;
                            if (baTable.table.selection) {
                                for (const key in baTable.table.selection) {
                                    if (row.id == baTable.table.selection[key].id) {
                                        return true;
                                    }
                                }
                            }
                            return state.tableSelectable;
                        },
                        align: 'center',
                        operator: false
                    },
                    { label: t('Id'), prop: 'id', align: 'center', operator: 'LIKE', operatorPlaceholder: t('Fuzzy query'), width: 70 },
                    { label: t('utils.Breakdown'), prop: 'topic', align: 'center', operator: 'LIKE', operatorPlaceholder: t('Fuzzy query') },
                    {
                        label: t('utils.preview'),
                        prop: 'suffix',
                        align: 'center',
                        formatter: window.previewRenderFormatter,
                        render: 'image',
                        operator: false
                    },
                    {
                        label: t('utils.type'),
                        prop: 'mimetype',
                        align: 'center',
                        operator: 'LIKE',
                        showOverflowTooltip: true,
                        operatorPlaceholder: t('Fuzzy query')
                    },
                    {
                        label: t('utils.size'),
                        prop: 'size',
                        align: 'center',
                        formatter: (row, column, cellValue) => {
                            var size = parseFloat(cellValue);
                            var i = Math.floor(Math.log(size) / Math.log(1024));
                            return parseInt((size / Math.pow(1024, i)).toFixed(i < 2 ? 0 : 2)) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
                        },
                        operator: 'RANGE',
                        sortable: 'custom',
                        operatorPlaceholder: 'bytes'
                    },
                    {
                        label: t('utils.Last upload time'),
                        prop: 'last_upload_time',
                        align: 'center',
                        render: 'datetime',
                        operator: 'RANGE',
                        width: 160,
                        sortable: 'custom'
                    },
                    {
                        show: false,
                        label: t('utils.Upload (Reference) times'),
                        prop: 'quote',
                        align: 'center',
                        width: 150,
                        operator: 'RANGE',
                        sortable: 'custom'
                    },
                    {
                        label: t('utils.Original name'),
                        prop: 'name',
                        align: 'center',
                        showOverflowTooltip: true,
                        operator: 'LIKE',
                        operatorPlaceholder: t('Fuzzy query')
                    },
                    {
                        label: t('Operate'),
                        align: 'center',
                        width: '100',
                        render: 'buttons',
                        buttons: optBtn,
                        operator: false
                    }
                ],
                defaultOrder: { prop: 'last_upload_time', order: 'desc' }
            });

            const getIndex = () => {
                if (props.type == 'image') {
                    baTable.table.filter.search = [{ field: 'mimetype', val: 'image', operator: 'LIKE' }];
                }
                baTable.table.ref = tableRef.value;
                baTable.table.filter.limit = 8;
                baTable.getIndex()?.then(() => {
                    baTable.initSort();
                });
                state.ready = true;
            };

            const onChoice = () => {
                if (baTable.table.selection?.length) {
                    let files = [];
                    for (const key in baTable.table.selection) {
                        files.push(props.returnFullUrl ? baTable.table.selection[key].full_url : baTable.table.selection[key].url);
                    }
                    emit('choice', files);
                    const elTableRef = tableRef.value.getRef();
                    elTableRef.clearSelection();
                }
            };

            const onSelectionChange = (selection) => {
                if (props.limit == 0) return;
                if (selection.length > props.limit) {
                    const elTableRef = tableRef.value.getRef();
                    elTableRef.toggleRowSelection(selection[selection.length - 1], false);
                }
                state.tableSelectable = !(selection.length >= props.limit);
            };

            Vue.onMounted(() => {
                baTable.mount();
            });

            Vue.watch(
                () => props.modelValue,
                (newVal) => {
                    if (newVal && !state.ready) {
                        Vue.nextTick(() => {
                            getIndex();
                        });
                    }
                }
            );

            return {
                tableRef,
                t,
                state,
                baTable,
                onChoice,
                onSelectionChange,
                getIndex
            };
        }
    };

    const styles = `
    .ba-upload-select-dialog .el-dialog__body {
        padding: 10px 20px;
    }
    .table-header-operate-text {
        margin-left: 6px;
    }
    .ml-10 {
        margin-left: 10px;
    }
    .selection-count {
        color: var(--el-color-primary);
        font-weight: bold;
    }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return SelectFile;
}));