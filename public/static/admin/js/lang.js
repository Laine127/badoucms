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

    return translateText(string, args);
}

// 翻译处理函数优化
function translateText(string, args) {
    // 获取翻译文本
    let translatedText = window.Lang?.[string] || args[0];

    // 如果翻译结果是对象,返回原始文本
    if (typeof translatedText === 'object') {
        return args[0];
    }

    // 处理参数替换
    return translatedText.replace(/%((%)|s|d)/g, (m, p1, p2) => {
        if (p2) return '%';

        const index = args.findIndex((_, i) => i > 0);
        if (index === -1) return m;

        const val = args[index];
        return m === '%d' ? parseFloat(val) || 0 : val;
    });
}