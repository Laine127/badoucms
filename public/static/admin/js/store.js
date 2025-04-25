// 创建 Pinia 实例
const pinia = Pinia.createPinia();

// 添加持久化插件
pinia.use((context) => {
    const storeId = context.store.$id;

    // 从 localStorage 恢复状态
    const fromStorage = JSON.parse(localStorage.getItem(storeId));
    if (fromStorage) {
        context.store.$patch(fromStorage);
    }

    // 监听状态变化并保存到 localStorage
    context.store.$subscribe((mutation, state) => {
        localStorage.setItem(storeId, JSON.stringify(state));
    });
});

// 导出 pinia 实例
window.pinia = pinia;