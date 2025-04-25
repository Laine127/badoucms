// 定义管理员信息存储的 key
const ADMIN_INFO = 'adminInfo';

// 创建 adminInfo store
const useAdminInfo = Pinia.defineStore('adminInfo', {
    state: () => {
        return {
            id: 0,
            username: '',
            nickname: '',
            avatar: '',
            last_login_time: '',
            token: '',
            refresh_token: '',
            super: false,
        }
    },
    actions: {
        dataFill(state) {
            this.$state = { ...this.$state, ...state }
        },
        removeToken() {
            this.token = ''
            this.refresh_token = ''
        },
        setToken(token, type) {
            const field = type == 'auth' ? 'token' : 'refresh_token'
            this[field] = token
        },
        getToken(type = 'auth') {
            return type === 'auth' ? this.token : this.refresh_token
        },
        setSuper(val) {
            this.super = val
        },
    },
    persist: {
        key: ADMIN_INFO,
    },
});

// 导出到全局，方便其他地方使用
window.useAdminInfo = useAdminInfo;