// 初始化Vue应用
const { createApp } = Vue
const { createPinia } = Pinia

document.addEventListener('DOMContentLoaded', () => {
    const app = createApp(App)
    const pinia = createPinia()
    app.use(pinia)
    app.use(router)  // 添加这行
    app.mount('#app')
})