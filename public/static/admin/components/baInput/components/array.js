(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['vue', 'element-plus'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('vue'), require('element-plus'));
    } else {
        global.BaInputArray = factory(global.Vue, global.ElementPlus);
    }
}(this, function (Vue, ElementPlus) {
    'use strict';

    const template = `
        <div>
            <el-row :gutter="10">
                <el-col :span="10" class="ba-array-key">{{ state.keyTitle }}</el-col>
                <el-col :span="10" class="ba-array-value">{{ state.valueTitle }}</el-col>
            </el-row>
            <el-row class="ba-array-item" v-for="(item, idx) in state.value" :gutter="10" :key="idx">
                <el-col :span="10">
                    <el-input v-model="item.key"></el-input>
                </el-col>
                <el-col :span="10">
                    <el-input v-model="item.value"></el-input>
                </el-col>
                <el-col :span="4">
                    <el-button @click="onDelArrayItem(idx)" size="small" icon="el-icon-Delete" circle />
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="10" :offset="10">
                    <el-button v-blur class="ba-add-array-item" @click="onAddArrayItem" icon="el-icon-Plus">{{ __('Add') }}</el-button>
                </el-col>
            </el-row>
        </div>
    `;

    const styles = `
        .ba-array-key,
        .ba-array-value {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 5px 0;
            color: var(--el-text-color-secondary);
        }
        .ba-array-item {
            margin-bottom: 6px;
        }
        .ba-add-array-item {
            float: right;
        }
    `;

    // 创建style元素并添加到head
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    return {
        name: 'BaInputArray',
        template: template,
        props: {
            modelValue: {
                type: Array,
                default: () => []
            },
            keyTitle: {
                type: String,
                default: ''
            },
            valueTitle: {
                type: String,
                default: ''
            }
        },
        setup(props) {
            const state = Vue.reactive({
                value: props.modelValue,
                keyTitle: props.keyTitle || t('utils.ArrayKey'),
                valueTitle: props.valueTitle || t('utils.ArrayValue')
            });

            const onAddArrayItem = () => {
                state.value.push({
                    key: '',
                    value: ''
                });
            };

            const onDelArrayItem = (idx) => {
                state.value.splice(idx, 1);
            };

            Vue.watch(
                () => props.modelValue,
                (newVal) => {
                    state.value = newVal;
                }
            );

            return {
                state,
                onAddArrayItem,
                onDelArrayItem
            };
        }
    };
}));