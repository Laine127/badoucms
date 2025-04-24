(function loadLangScript() {
    var oscript = document.createElement("script")
    oscript.src = Config.app_url + "/ajax/lang?controllername=" + Config.controllername + "&lang=" + Config.language + "&callback=lang"
    oscript.async = false // 设置为同步加载
    document.head.appendChild(oscript) // 改为添加到head中以提高优先级
})();
window.Lang = Config.lang;
function lang(data) {
    // 使用 Vue.reactive 使数据具有响应性
    window.Lang = Vue.reactive(data);
}

function __() {
    var args = Array.from(arguments);
    var string = args[0].toLowerCase();

    // 如果在 setup 函数内部调用，返回计算属性
    if (Vue.getCurrentInstance()) {
        return Vue.computed(() => translateText(string, args));
    }

    // 如果在普通环境调用，直接返回翻译结果
    return translateText(string, args);
}

// 翻译处理函数
function translateText(string, args) {
    if (typeof window.Lang !== 'undefined' && typeof window.Lang[string] !== 'undefined') {
        if (typeof window.Lang[string] === 'object') {
            return window.Lang[string];
        }
        string = window.Lang[string];
    } else {
        string = args[0];
    }

    return string.replace(/%((%)|s|d)/g, function (m) {
        var val = null;
        var i = 1;
        if (m[2]) {
            val = m[2];
        } else {
            val = args[i];
            switch (m) {
                case '%d':
                    val = parseFloat(val);
                    if (isNaN(val)) {
                        val = 0;
                    }
                    break;
            }
            i++;
        }
        return val;
    });
}