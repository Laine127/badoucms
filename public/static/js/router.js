const routes = [
    { path: '/', component: { template: '<div>首页</div>' } }
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
})