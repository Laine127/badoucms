(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['vue', 'element-plus', 'lodash-es'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('vue'), require('element-plus'), require('lodash-es'));
    } else {
        global.RemoteSelect = factory(global.Vue, global.ElementPlus, global._);
    }
}(this, function (Vue, ElementPlus, _) {
    'use strict';

    const template = `
    <div class="w100">
        <el-popover
            width="100%"
            placement="bottom"
            popper-class="remote-select-popper"
            :visible="state.focusStatus && !state.loading && !state.keyword && !state.options.length"
            :teleported="false"
            :content="$t('utils.No data')"
            :hide-after="0"
        >
            <template #reference>
                <el-select
                    ref="selectRef"
                    class="w100"
                    remote
                    clearable
                    filterable
                    automatic-dropdown
                    remote-show-suffix
                    v-model="state.value"
                    :loading="state.loading"
                    :disabled="props.disabled || !state.initializeFlag"
                    @blur="onBlur"
                    @focus="onFocus"
                    @clear="onClear"
                    @change="onChangeSelect"
                    @keydown.esc.capture="onKeyDownEsc"
                    :remote-method="onRemoteMethod"
                    v-bind="$attrs"
                >
                    <el-option
                        class="remote-select-option"
                        v-for="item in state.options"
                        :label="item[field]"
                        :value="item[state.primaryKey].toString()"
                        :key="item[state.primaryKey]"
                    >
                        <el-tooltip placement="right" effect="light" v-if="!_.isEmpty(tooltipParams)">
                            <template #content>
                                <p v-for="(tooltipParam, key) in tooltipParams" :key="key">{{ key }}: {{ item[tooltipParam] }}</p>
                            </template>
                            <div>{{ item[field] }}</div>
                        </el-tooltip>
                    </el-option>
                    <template v-if="state.total && props.pagination" #footer>
                        <el-pagination
                            :currentPage="state.currentPage"
                            :page-size="state.pageSize"
                            :pager-count="5"
                            class="select-pagination"
                            :layout="props.paginationLayout"
                            :total="state.total"
                            @current-change="onSelectCurrentPageChange"
                            :small="config.layout.shrink"
                        />
                    </template>
                </el-select>
            </template>
        </el-popover>
    </div>
    `;

    return {
        name: 'RemoteSelect',
        template: template,
        props: {
            pk: {
                type: String,
                default: 'id'
            },
            field: {
                type: String,
                default: 'name'
            },
            params: {
                type: Object,
                default: () => ({})
            },
            remoteUrl: {
                type: String,
                default: ''
            },
            modelValue: {
                type: [String, Number, Array],
                default: ''
            },
            pagination: {
                type: Boolean,
                default: true
            },
            tooltipParams: {
                type: Object,
                default: () => ({})
            },
            paginationLayout: {
                type: String,
                default: 'total, ->, prev, pager, next'
            },
            escBlur: {
                type: Boolean,
                default: true
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        setup(props, { emit }) {
            const config = Vue.inject('config');
            const selectRef = Vue.ref();
            const state = Vue.reactive({
                primaryKey: props.pk,
                options: [],
                loading: false,
                total: 0,
                currentPage: 1,
                pageSize: 10,
                params: props.params,
                keyword: '',
                value: props.modelValue || '',
                initializeFlag: false,
                optionValidityFlag: false,
                focusStatus: false
            });

            let io = null;

            const onChangeSelect = (val) => {
                if (!val) {
                    state.value = val = props.multiple ? [] : '';
                }
                emit('update:modelValue', val);
                if (typeof props.onRow === 'function') {
                    if (typeof val === 'number' || typeof val === 'string') {
                        const dataKey = _.findIndex(state.options, item => item[state.primaryKey].toString() === val.toString());
                        emit('row', dataKey >= 0 ? _.cloneDeep(state.options[dataKey]) : {});
                    } else {
                        const valueArr = [];
                        for (const key in val) {
                            const dataKey = _.findIndex(state.options, item => item[state.primaryKey].toString() === val[key].toString());
                            if (dataKey >= 0) valueArr.push(_.cloneDeep(state.options[dataKey]));
                        }
                        emit('row', valueArr);
                    }
                }
            };

            const onKeyDownEsc = (e) => {
                if (props.escBlur) {
                    e.stopPropagation();
                    selectRef.value?.blur();
                    selectRef.value?.$el.querySelector('input')?.blur();
                }
            };

            const onFocus = () => {
                state.focusStatus = true;
                if (!state.optionValidityFlag) {
                    getData();
                }
            };

            const onClear = () => {
                Vue.nextTick(() => {
                    selectRef.value?.focus();
                    selectRef.value?.$el.click();
                });
            };

            const onBlur = () => {
                state.keyword = '';
                state.focusStatus = false;
            };

            const onRemoteMethod = _.debounce((q) => {
                if (state.keyword !== q) {
                    state.keyword = q;
                    state.currentPage = 1;
                    getData();
                }
            }, 300);

            const getData = (initValue = '') => {
                state.loading = true;
                state.params.page = state.currentPage;
                state.params.initKey = props.pk;
                state.params.initValue = initValue;

                fetch(props.remoteUrl + '?' + new URLSearchParams({
                    keyword: state.keyword,
                    ...state.params
                }))
                    .then(response => response.json())
                    .then(res => {
                        let opts = res.data.options || res.data.list;
                        if (typeof props.labelFormatter === 'function') {
                            opts = opts.map((item, index) => ({
                                ...item,
                                [props.field]: props.labelFormatter(item, index)
                            }));
                        }
                        state.options = opts;
                        state.total = res.data.total ?? 0;
                        state.optionValidityFlag = !state.keyword && (!initValue || _.isEmpty(initValue));
                    })
                    .finally(() => {
                        state.loading = false;
                        state.initializeFlag = true;
                    });
            };

            const onSelectCurrentPageChange = (val) => {
                state.currentPage = val;
                getData();
            };

            const initDefaultValue = () => {
                if (state.value) {
                    if (Array.isArray(state.value)) {
                        state.value = state.value.map(String);
                    } else if (typeof state.value === 'number') {
                        state.value = String(state.value);
                    }
                }
                getData(state.value);
            };

            Vue.onMounted(() => {
                state.params.uuid = Math.random().toString(36).substring(2);
                const pkArr = props.pk.split('.');
                state.primaryKey = pkArr[pkArr.length - 1];
                initDefaultValue();

                setTimeout(() => {
                    if (window?.IntersectionObserver) {
                        io = new IntersectionObserver((entries) => {
                            for (const entry of entries) {
                                if (!entry.isIntersecting) selectRef.value?.blur();
                            }
                        });
                        if (selectRef.value?.$el instanceof Element) {
                            io.observe(selectRef.value.$el);
                        }
                    }
                }, 500);
            });

            Vue.onUnmounted(() => {
                io?.disconnect();
            });

            Vue.watch(
                () => props.modelValue,
                (newVal) => {
                    if (String(state.value) !== String(newVal)) {
                        state.value = newVal || '';
                        initDefaultValue();
                    }
                }
            );

            return {
                selectRef,
                state,
                config,
                onChangeSelect,
                onKeyDownEsc,
                onFocus,
                onClear,
                onBlur,
                onRemoteMethod,
                onSelectCurrentPageChange,
                getData,
                blur: () => selectRef.value?.blur(),
                focus: () => selectRef.value?.focus(),
                getRef: () => selectRef.value
            };
        }
    };
}));