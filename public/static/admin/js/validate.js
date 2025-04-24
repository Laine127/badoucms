(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.valid = factory();
    }
}(this, function () {
    'use strict';

    // 手机号码验证
    function validatorMobile(rule, mobile, callback) {
        if (!mobile) return callback();
        if (!/^(1[3-9])\d{9}$/.test(mobile.toString())) {
            return callback(new Error('请输入正确的手机号'));
        }
        return callback();
    }

    // 身份证号验证
    function validatorIdNumber(rule, idNumber, callback) {
        if (!idNumber) return callback();
        if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idNumber.toString())) {
            return callback(new Error('请输入正确的身份证号码'));
        }
        return callback();
    }

    // 账户名验证
    function validatorAccount(rule, val, callback) {
        if (!val) return callback();
        if (!/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/.test(val)) {
            return callback(new Error('要求3到15位，字母开头且只含字母、数字、下划线'));
        }
        return callback();
    }

    // 密码验证
    function regularPassword(val) {
        return /^(?!.*[&<>"'\n\r]).{6,32}$/.test(val);
    }

    function validatorPassword(rule, val, callback) {
        if (!val) return callback();
        if (!regularPassword(val)) {
            return callback(new Error('密码要求6到32位，不能包含 & < > " \''));
        }
        return callback();
    }

    // 变量名验证
    function regularVarName(val) {
        return /^([^\x00-\xff]|[a-zA-Z_$])([^\x00-\xff]|[a-zA-Z0-9_$])*$/.test(val);
    }

    function validatorVarName(rule, val, callback) {
        if (!val) return callback();
        if (!regularVarName(val)) {
            return callback(new Error('请输入正确的名称'));
        }
        return callback();
    }

    // 富文本必填验证
    function validatorEditorRequired(rule, val, callback) {
        if (!val || val == '<p><br></p>') {
            return callback(new Error('内容不能为空'));
        }
        return callback();
    }

    // 构建表单验证规则
    function buildValidatorData({ name, message, title, trigger = 'blur' }) {
        // 必填
        if (name == 'required') {
            return {
                required: true,
                message: message || ('请输入' + (title || '')),
                trigger: trigger
            };
        }

        // 常见类型
        const validatorType = ['number', 'integer', 'float', 'date', 'url', 'email'];
        if (validatorType.includes(name)) {
            return {
                type: name,
                message: message || ('请输入正确的' + (title || '')),
                trigger: trigger
            };
        }

        // 自定义验证方法
        const validatorCustomFun = {
            mobile: validatorMobile,
            idNumber: validatorIdNumber,
            account: validatorAccount,
            password: validatorPassword,
            varName: validatorVarName,
            editorRequired: validatorEditorRequired
        };

        if (validatorCustomFun[name]) {
            return {
                required: name == 'editorRequired',
                validator: validatorCustomFun[name],
                trigger: trigger,
                message: message
            };
        }
        return {};
    }

    return {
        validatorMobile,
        validatorIdNumber,
        validatorAccount,
        validatorPassword,
        validatorVarName,
        validatorEditorRequired,
        regularPassword,
        regularVarName,
        buildValidatorData
    };
}));