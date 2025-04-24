// 初始化Vue应用
const { createApp } = Vue
const { createPinia } = Pinia

document.addEventListener('DOMContentLoaded', () => {
    const app = createApp(App)
    app.mount('#app')
})