/**
 * 创建应用
 * @param {*} id            Dom id
 * @param {*} Index         应用
 * @param {*} components    组件
 */
function createVue(id, Index, components) {
    const app = Vue.createApp(Index);
    app.use(ElementPlus);
    app.use(window.pinia);

    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component)
    }
    app.component('Svg', Svg);
    app.component('Icon', Icon);
    if (components) {
        for (const [key, component] of Object.entries(components)) {
            app.component(key, component)
        }
    }
    app.mount(`#${id}`)
}

function fullUrl(relativeUrl, domain = '') {
    const siteConfig = Config.siteConfig
    if (!domain) {
        domain = siteConfig.cdnUrl ? siteConfig.cdnUrl : getUrl()
    }
    if (!relativeUrl) return domain

    const regUrl = new RegExp(/^http(s)?:\/\//)
    const regexImg = new RegExp(/^((?:[a-z]+:)?\/\/|data:image\/)(.*)/i)
    if (!domain || regUrl.test(relativeUrl) || regexImg.test(relativeUrl)) {
        return relativeUrl
    }
    return domain + relativeUrl
}

/**
 * 生成唯一标识
 * @param prefix 前缀
 * @returns 唯一标识
 */
function shortUuid(prefix = '') {
    const time = Date.now()
    const random = Math.floor(Math.random() * 1000000000)
    if (!window.unique) window.unique = 0
    window.unique++
    return prefix + '_' + random + window.unique + String(time)
}

/**
 * 设置导航栏宽度
 * @returns
 */
function setNavTabsWidth() {
    const navTabs = document.querySelector(".nav-tabs");
    if (!navTabs) {
        return;
    }
    const navBar = document.querySelector(".nav-bar");
    const navMenus = document.querySelector(".nav-menus");
    const minWidth = navBar.offsetWidth - (navMenus.offsetWidth + 20);
    navTabs.style.width = minWidth.toString() + "px";
}

/**
 * main高度
 * @param extra main高度额外减去的px数,可以实现隐藏原有的滚动条
 * @returns CSSProperties
 */
function mainHeight(extra = 0) {
    let height = extra;
    const adminLayoutMainExtraHeight = {
        Default: 70,
        Classic: 50,
        Streamline: 60,
    };
    if (isAdminApp()) {
        const config = useConfig();
        const navTabs = useNavTabs();
        if (!navTabs.state.tabFullScreen) {
            height += adminLayoutMainExtraHeight[config.layout.layoutMode];
        }
    } else {
        height += 60;
    }
    return {
        height: "calc(100vh - " + height.toString() + "px)",
    };
}

/*
 * 显示页面遮罩
 */
function showShade(className = 'shade', closeCallBack) {
    const containerEl = document.querySelector('.layout-container');
    const shadeDiv = document.createElement('div');
    shadeDiv.setAttribute('class', 'ba-layout-shade ' + className);
    containerEl.appendChild(shadeDiv);
    useEventListener(shadeDiv, 'click', () => closeShade(closeCallBack));
}

/*
 * 隐藏页面遮罩
 */
function closeShade(closeCallBack = function () { }) {
    const shadeEl = document.querySelector('.ba-layout-shade');
    shadeEl && shadeEl.remove();
    closeCallBack();
}

function getGreet() {
    const now = new Date()
    const hour = now.getHours()
    let greet = ''

    if (hour < 5) {
        greet = __('Late at night, pay attention to your body!')
    } else if (hour < 9) {
        greet = __('good morning!') + __('welcome back')
    } else if (hour < 12) {
        greet = __('Good morning!') + __('welcome back')
    } else if (hour < 14) {
        greet = __('Good noon!') + __('welcome back')
    } else if (hour < 18) {
        greet = __('good afternoon') + __('welcome back')
    } else if (hour < 24) {
        greet = __('Good evening') + __('welcome back')
    } else {
        greet = __('Hello!') + __('welcome back')
    }
    console.log(greet);

    return greet
}