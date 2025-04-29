(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['vue', 'element-plus'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('vue'), require('element-plus'));
    } else {
        global.IconSelector = factory(global.Vue, global.ElementPlus);
    }
}(this, function (Vue, ElementPlus) {
    'use strict';

    const template = `
        <el-popover :placement="placement" trigger="focus" :hide-after="0" :width="state.selectorWidth" :visible="state.popoverVisible">
            <div @mouseover.stop="state.iconSelectorMouseover = true" @mouseout.stop="state.iconSelectorMouseover = false" class="icon-selector">
                <div class="icon-selector-box">
                    <div class="selector-header">
                        <div class="selector-title">{{ title ? title : $t('utils.Please select an icon') }}</div>
                        <div class="selector-tab">
                            <span
                                :title="'Element Puls ' + $t('utils.Icon')"
                                @click="onChangeTab('ele')"
                                :class="state.iconType == 'ele' ? 'active' : ''"
                            >
                                ele
                            </span>
                            <span
                                :title="'Font Awesome ' + $t('utils.Icon')"
                                @click="onChangeTab('awe')"
                                :class="state.iconType == 'awe' ? 'active' : ''"
                            >
                                awe
                            </span>
                            <span :title="$t('utils.Ali iconcont Icon')" @click="onChangeTab('ali')" :class="state.iconType == 'ali' ? 'active' : ''">
                                ali
                            </span>
                            <span :title="$t('utils.Local icon title')" @click="onChangeTab('local')" :class="state.iconType == 'local' ? 'active' : ''">
                                local
                            </span>
                        </div>
                    </div>
                    <div class="selector-body">
                        <el-scrollbar ref="selectorScrollbarRef">
                            <div v-if="renderFontIconNames.length > 0">
                                <div class="icon-selector-item" :title="item" @click="onIcon(item)" v-for="(item, key) in renderFontIconNames" :key="key">
                                    <Icon :name="item" />
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>
                </div>
            </div>
            <template #reference>
                <el-input
                    v-model="state.inputValue"
                    :size="size"
                    :disabled="disabled"
                    :placeholder="$t('Search') + $t('utils.Icon')"
                    ref="selectorInput"
                    @focus="onInputFocus"
                    @blur="onInputBlur"
                    :class="'size-' + size"
                >
                    <template #prepend>
                        <div class="icon-prepend">
                            <Icon :key="'icon' + state.iconKey" :name="state.prependIcon ? state.prependIcon : state.defaultModelValue" />
                            <div v-if="showIconName" class="name">{{ state.prependIcon ? state.prependIcon : state.defaultModelValue }}</div>
                        </div>
                    </template>
                    <template #append>
                        <Icon @click="onInputRefresh" name="el-icon-RefreshRight" />
                    </template>
                </el-input>
            </template>
        </el-popover>
    `;

    const IconSelector = {
        name: 'IconSelector',
        template,
        props: {
            size: {
                type: String,
                default: 'default',
                validator: (value) => ['default', 'small', 'large'].includes(value)
            },
            disabled: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: 'ele',
                validator: (value) => ['ele', 'awe', 'ali', 'local'].includes(value)
            },
            placement: {
                type: String,
                default: 'bottom'
            },
            modelValue: {
                type: String,
                default: ''
            },
            showIconName: {
                type: Boolean,
                default: false
            }
        },
        emits: ['update:modelValue', 'change'],
        setup(props, { emit }) {
            const selectorInput = Vue.ref();
            const selectorScrollbarRef = Vue.ref();
            const state = Vue.reactive({
                iconType: props.type,
                selectorWidth: 0,
                popoverVisible: false,
                inputFocus: false,
                iconSelectorMouseover: false,
                fontIconNames: [],
                inputValue: '',
                prependIcon: props.modelValue,
                defaultModelValue: props.modelValue || 'fa fa-circle-o',
                iconKey: 0
            });

            const onInputFocus = () => {
                state.inputFocus = state.popoverVisible = true;
            };

            const onInputBlur = () => {
                state.inputFocus = false;
                state.popoverVisible = state.iconSelectorMouseover;
            };

            const onInputRefresh = () => {
                state.iconKey++;
                state.prependIcon = state.defaultModelValue;
                state.inputValue = '';
                emit('update:modelValue', state.defaultModelValue);
                emit('change', state.defaultModelValue);
            };

            const onChangeTab = (name) => {
                state.iconType = name;
                state.fontIconNames = [];
                if (name === 'ele') {
                    getElementPlusIconfontNames().then((res) => {
                        state.fontIconNames = res;
                    });
                } else if (name === 'awe') {
                    getAwesomeIconfontNames().then((res) => {
                        state.fontIconNames = res.map((name) => `fa ${name}`);
                    });
                } else if (name === 'ali') {
                    getIconfontNames().then((res) => {
                        state.fontIconNames = res.map((name) => `iconfont ${name}`);
                    });
                } else if (name === 'local') {
                    getLocalIconfontNames().then((res) => {
                        state.fontIconNames = res;
                    });
                }
            };

            const onIcon = (icon) => {
                state.iconSelectorMouseover = state.popoverVisible = false;
                state.iconKey++;
                state.prependIcon = icon;
                state.inputValue = '';
                emit('update:modelValue', icon);
                emit('change', icon);
                Vue.nextTick(() => {
                    selectorInput.value.blur();
                });
            };

            const renderFontIconNames = Vue.computed(() => {
                if (!state.inputValue) return state.fontIconNames;

                let inputValue = state.inputValue.trim().toLowerCase();
                return state.fontIconNames.filter((icon) => {
                    return icon.toLowerCase().indexOf(inputValue) !== -1;
                });
            });

            const getInputWidth = () => {
                Vue.nextTick(() => {
                    state.selectorWidth = selectorInput.value.$el.offsetWidth < 260 ? 260 : selectorInput.value.$el.offsetWidth;
                });
            };

            const popoverVisible = () => {
                state.popoverVisible = state.inputFocus || state.iconSelectorMouseover;
            };

            Vue.watch(
                () => props.modelValue,
                () => {
                    state.iconKey++;
                    if (props.modelValue !== state.prependIcon) state.defaultModelValue = props.modelValue;
                    if (props.modelValue === '') state.defaultModelValue = 'fa fa-circle-o';
                    state.prependIcon = props.modelValue;
                }
            );

            Vue.onMounted(() => {
                getInputWidth();
                document.addEventListener('click', popoverVisible);
                getElementPlusIconfontNames().then((res) => {
                    state.fontIconNames = res;
                });
            });

            return {
                selectorInput,
                selectorScrollbarRef,
                state,
                onInputFocus,
                onInputBlur,
                onInputRefresh,
                onChangeTab,
                onIcon,
                renderFontIconNames
            };
        }
    };

    const styles = `
        .size-small { height: 24px; }
        .size-large { height: 40px; }
        .size-default { height: 32px; }
        .icon-prepend {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .icon-prepend .name { padding-left: 5px; }
        .selector-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }
        .selector-tab {
            margin-left: auto;
        }
        .selector-tab span {
            padding: 0 5px;
            cursor: pointer;
            user-select: none;
        }
        .selector-tab span.active,
        .selector-tab span:hover {
            color: var(--el-color-primary);
            text-decoration: underline;
        }
        .selector-body { height: 250px; }
        .icon-selector-item {
            display: inline-block;
            padding: 10px 10px 6px 10px;
            margin: 3px;
            border: 1px solid var(--ba-border-color);
            border-radius: var(--el-border-radius-base);
            cursor: pointer;
            font-size: 18px;
        }
        .icon-selector-item .icon {
            height: 18px;
            width: 18px;
        }
        .icon-selector-item:hover {
            border: 1px solid var(--el-color-primary);
        }
        .el-input-group__prepend { padding: 0 10px; }
        .el-input-group__append { padding: 0 10px; }
    `;

    // 添加样式到文档
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return IconSelector;
}));