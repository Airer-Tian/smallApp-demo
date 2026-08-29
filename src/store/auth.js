import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    userId: null,
    nickName: '',
    perms: [],
    roles: []
  }),
  actions: {
    async doLogin(payload) {
      const data = await loginApi(payload) // { token, nickName }
      this.token = data.token
      this.nickName = data.nickName
    },
    setUserInfo(info) {
      this.userId = info.userId
      this.nickName = info.nickName
      this.perms = info.perms || []
      this.roles = info.roles || []
    },
    hasPerm(perm) {
      return this.perms.includes(perm)
    },
    async doLogout() {
      try {
        await logoutApi()
      } catch (e) {
        /* 忽略 */
      }
      this.$reset()
      localStorage.removeItem('menu')
      localStorage.removeItem('tabs')
    }
  },
  persist: true
})
