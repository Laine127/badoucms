(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['vue', 'element-plus', 'vue-i18n'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'), require('element-plus'), require('vue-i18n'));
    } else {
        // Browser globals
        root.ButtonsRenderer = factory(root.Vue, root.ElementPlus, root.VueI18n);
    }
}(typeof self !== 'undefined' ? self : this, function (Vue, ElementPlus, VueI18n) {
    'use strict';

    const ButtonsRenderer = {
        template: `
            <div v-memo="[field]">
                <template v-for="(btn, idx) in field.buttons" :key="idx">
                    <template v-if="btn.display ? btn.display(row, field) : true">
                        <!-- 常规按钮 -->
                        <el-button
                            v-if="btn.render == 'basicButton'"
                            v-blur
                            @click="onButtonClick(btn)"
                            :class="btn.class"
                            class="ba-table-render-buttons-item"
                            :type="btn.type"
                            :disabled="btn.disabled && btn.disabled(row, field)"
                            v-bind="btn.attr"
                        >
                            <Icon v-if="btn.icon" :name="btn.icon" />
                            <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
                        </el-button>

                        <!-- 带提示信息的按钮 -->
                        <el-tooltip
                            v-if="btn.render == 'tipButton' && ((btn.name == 'edit' && baTable.auth('edit')) || btn.name != 'edit')"
                            :disabled="btn.title && !btn.disabledTip ? false : true"
                            :content="getTranslation(btn.title)"
                            placement="top"
                        >
                            <el-button
                                v-blur
                                @click="onButtonClick(btn)"
                                :class="btn.class"
                                class="ba-table-render-buttons-item"
                                :type="btn.type"
                                :disabled="btn.disabled && btn.disabled(row, field)"
                                v-bind="btn.attr"
                            >
                                <Icon v-if="btn.icon" :name="btn.icon" />
                                <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
                            </el-button>
                        </el-tooltip>

                        <!-- 带确认框的按钮 -->
                        <el-popconfirm
                            v-if="btn.render == 'confirmButton' && ((btn.name == 'delete' && baTable.auth('del')) || btn.name != 'delete')"
                            :disabled="btn.disabled && btn.disabled(row, field)"
                            v-bind="btn.popconfirm"
                            @confirm="onButtonClick(btn)"
                        >
                            <template #reference>
                                <div class="ml-6">
                                    <el-tooltip :disabled="btn.title ? false : true" :content="getTranslation(btn.title)" placement="top">
                                        <el-button
                                            v-blur
                                            :class="btn.class"
                                            class="ba-table-render-buttons-item"
                                            :type="btn.type"
                                            :disabled="btn.disabled && btn.disabled(row, field)"
                                            v-bind="btn.attr"
                                        >
                                            <Icon v-if="btn.icon" :name="btn.icon" />
                                            <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
                                        </el-button>
                                    </el-tooltip>
                                </div>
                            </template>
                        </el-popconfirm>

                        <!-- 带提示的可拖拽按钮 -->
                        <el-tooltip
                            v-if="btn.render == 'moveButton' && ((btn.name == 'weigh-sort' && baTable.auth('sortable')) || btn.name != 'weigh-sort')"
                            :disabled="btn.title && !btn.disabledTip ? false : true"
                            :content="getTranslation(btn.title)"
                            placement="top"
                        >
                            <el-button
                                :class="btn.class"
                                class="ba-table-render-buttons-item move-button"
                                :type="btn.type"
                                :disabled="btn.disabled && btn.disabled(row, field)"
                                v-bind="btn.attr"
                            >
                                <Icon v-if="btn.icon" :name="btn.icon" />
                                <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
                            </el-button>
                        </el-tooltip>
                    </template>
                </template>
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
            const { inject } = Vue;
            const baTable = inject('baTable');

            const onButtonClick = (btn) => {
                if (typeof btn.click === 'function') {
                    btn.click(props.row, props.field);
                    return;
                }
                baTable.onTableAction(btn.name, props);
            };

            const getTranslation = (key) => {
                if (!key) return '';
                return __(key) ? __(key) : key;
            };

            return {
                baTable,
                onButtonClick,
                getTranslation
            };
        }
    };

    return ButtonsRenderer;
}));