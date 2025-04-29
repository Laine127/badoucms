(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['vue', 'element-plus'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('vue'), require('element-plus'));
    } else {
        global.ComSearch = factory(global.Vue, global.ElementPlus);
    }
}(this, function (Vue, ElementPlus) {
    'use strict';

    const template = `
    <div class="table-com-search">
        <el-form @submit.prevent="" @keyup.enter="baTable.onTableAction('com-search', {})" label-position="top" :model="baTable.comSearch.form">
            <el-row>
                <template v-for="(item, idx) in baTable.table.column" :key="idx">
                    <template v-if="item.operator !== false">
                        <!-- 自定义渲染 component、slot -->
                        <el-col
                            v-if="item.comSearchRender == 'customRender' || item.comSearchRender == 'slot'"
                            v-bind="{
                                xs: item.comSearchColAttr?.xs ? item.comSearchColAttr?.xs : 24,
                                sm: item.comSearchColAttr?.sm ? item.comSearchColAttr?.sm : 6,
                                ...item.comSearchColAttr,
                            }"
                        >
                            <!-- 外部可以使用 :deep() 选择器修改css样式 -->
                            <div class="com-search-col" :class="item.prop">
                                <div class="com-search-col-label" v-if="item.comSearchShowLabel !== false">{{ item.label }}</div>
                                <div class="com-search-col-input">
                                    <!-- 自定义组件/函数渲染 -->
                                    <component
                                        v-if="item.comSearchRender == 'customRender'"
                                        :is="item.comSearchCustomRender"
                                        :renderRow="item"
                                        :renderField="item.prop"
                                        :renderValue="baTable.comSearch.form[item.prop]"
                                    />

                                    <!-- 自定义渲染-slot -->
                                    <slot v-else-if="item.comSearchRender == 'slot'" :name="item.comSearchSlotName"></slot>
                                </div>
                            </div>
                        </el-col>

                        <!-- 时间范围 -->
                        <el-col v-else-if="item.render == 'datetime' && (item.operator == 'RANGE' || item.operator == 'NOT RANGE')" :xs="24" :sm="12">
                            <div class="com-search-col" :class="item.prop">
                                <div class="com-search-col-label w16" v-if="item.comSearchShowLabel !== false">{{ item.label }}</div>
                                <div class="com-search-col-input-range w83">
                                    <el-date-picker
                                        class="datetime-picker w100"
                                        v-model="baTable.comSearch.form[item.prop]"
                                        :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                                        :type="item.comSearchRender == 'date' ? 'daterange' : 'datetimerange'"
                                        :range-separator="__('To')"
                                        :start-placeholder="__('el.datepicker.startDate')"
                                        :end-placeholder="__('el.datepicker.endDate')"
                                        :value-format="item.comSearchRender == 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'"
                                        :teleported="false"
                                    />
                                </div>
                            </div>
                        </el-col>
                        <el-col v-else :xs="24" :sm="6">
                            <div class="com-search-col" :class="item.prop">
                                <div class="com-search-col-label" v-if="item.comSearchShowLabel !== false">{{ item.label }}</div>
                                <!-- 数字范围 -->
                                <div v-if="item.operator == 'RANGE' || item.operator == 'NOT RANGE'" class="com-search-col-input-range">
                                    <el-input
                                        :placeholder="item.operatorPlaceholder"
                                        type="string"
                                        v-model="baTable.comSearch.form[item.prop + '-start']"
                                        :clearable="true"
                                    ></el-input>
                                    <div class="range-separator">{{ __('To') }}</div>
                                    <el-input
                                        :placeholder="item.operatorPlaceholder"
                                        type="string"
                                        v-model="baTable.comSearch.form[item.prop + '-end']"
                                        :clearable="true"
                                    ></el-input>
                                </div>
                                <!-- 是否 [NOT] NULL -->
                                <div v-else-if="item.operator == 'NULL' || item.operator == 'NOT NULL'" class="com-search-col-input">
                                    <el-checkbox v-model="baTable.comSearch.form[item.prop]" :label="item.operator" size="large"></el-checkbox>
                                </div>
                                <div v-else-if="item.operator" class="com-search-col-input">
                                    <!-- 时间筛选 -->
                                    <el-date-picker
                                        class="datetime-picker w100"
                                        v-if="item.render == 'datetime' || item.comSearchRender == 'date'"
                                        v-model="baTable.comSearch.form[item.prop]"
                                        :type="item.comSearchRender == 'date' ? 'date' : 'datetime'"
                                        :value-format="item.comSearchRender == 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'"
                                        :placeholder="item.operatorPlaceholder"
                                        :teleported="false"
                                    />

                                    <!-- tag、tags、select -->
                                    <el-select
                                        class="w100"
                                        :placeholder="item.operatorPlaceholder"
                                        v-else-if="
                                            (item.render == 'tag' || item.render == 'tags' || item.comSearchRender == 'select') && item.replaceValue
                                        "
                                        v-model="baTable.comSearch.form[item.prop]"
                                        :multiple="item.operator == 'IN' || item.operator == 'NOT IN'"
                                        :clearable="true"
                                    >
                                        <el-option v-for="(opt, okey) in item.replaceValue" :key="item.prop + okey" :label="opt" :value="okey" />
                                    </el-select>

                                    <!-- 远程 select -->
                                    <ba-input
                                        v-else-if="item.comSearchRender == 'remoteSelect'"
                                        type="remoteSelect"
                                        v-model="baTable.comSearch.form[item.prop]"
                                        :attr="item.remote"
                                        :placeholder="item.operatorPlaceholder"
                                    />

                                    <!-- 开关 -->
                                    <el-select
                                        :placeholder="item.operatorPlaceholder"
                                        v-else-if="item.render == 'switch'"
                                        v-model="baTable.comSearch.form[item.prop]"
                                        :clearable="true"
                                        class="w100"
                                    >
                                        <template v-if="!isEmpty(item.replaceValue)">
                                            <el-option v-for="(opt, okey) in item.replaceValue" :key="item.prop + okey" :label="opt" :value="okey" />
                                        </template>
                                        <template v-else>
                                            <el-option :label="__('utils.open')" value="1" />
                                            <el-option :label="__('utils.close')" value="0" />
                                        </template>
                                    </el-select>

                                    <!-- 字符串 -->
                                    <el-input
                                        :placeholder="item.operatorPlaceholder"
                                        v-else
                                        type="string"
                                        v-model="baTable.comSearch.form[item.prop]"
                                        :clearable="true"
                                    ></el-input>
                                </div>
                            </div>
                        </el-col>
                    </template>
                </template>
                <el-col :xs="24" :sm="6">
                    <div class="com-search-col pl-20">
                        <el-button v-blur @click="baTable.onTableAction('com-search', {})" type="primary">{{ __('Search') }}</el-button>
                        <el-button @click="onResetForm()">{{ __('Reset') }}</el-button>
                    </div>
                </el-col>
            </el-row>
        </el-form>
    </div>
    `;

    const styles = `
    .table-com-search {
        box-sizing: border-box;
        width: 100%;
        max-width: 100%;
        background-color: var(--ba-bg-color-overlay);
        border: 1px solid var(--ba-border-color);
        border-bottom: none;
        padding: 13px 15px;
        font-size: 14px;
    }
    .table-com-search .com-search-col {
        display: flex;
        align-items: center;
        padding-top: 8px;
        color: var(--el-text-color-regular);
        font-size: 13px;
    }
    .table-com-search .com-search-col-label {
        width: 33.33%;
        padding: 0 15px;
        text-align: right;
        overflow: hidden;
        white-space: nowrap;
    }
    .table-com-search .com-search-col-input {
        padding: 0 15px;
        width: 66.66%;
    }
    .table-com-search .com-search-col-input-range {
        display: flex;
        align-items: center;
        padding: 0 15px;
        width: 66.66%;
    }
    .table-com-search .com-search-col-input-range .range-separator {
        padding: 0 5px;
    }
    .table-com-search .pl-20 {
        padding-left: 20px;
    }
    .table-com-search .w16 {
        width: 16.5% !important;
    }
    .table-com-search .w83 {
        width: 83.5% !important;
    }
    `;

    // 添加样式到页面
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return {
        name: 'ComSearch',
        template: template,
        setup() {
            const baTable = Vue.inject('baTable');
            const isEmpty = _.isEmpty;

            const onResetForm = () => {
                baTable.initComSearch();
                baTable.onTableAction('com-search', {});
            };

            return {
                baTable,
                isEmpty,
                onResetForm
            };
        }
    };
}));