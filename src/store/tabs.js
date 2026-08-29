import { defineStore } from 'pinia'

export const useTabsStore = defineStore('tabs', {
  state: () => ({ tabs: [{ path: '/home', title: '首页', closable: false }], active: '/home' }),
  actions: {
    addTab(tab) {
      if (!this.tabs.find((t) => t.path === tab.path)) this.tabs.push({ ...tab, closable: true })
      this.active = tab.path
    },
    removeTab(path) {
      const idx = this.tabs.findIndex((t) => t.path === path)
      if (idx > -1) this.tabs.splice(idx, 1)
      if (this.active === path) this.active = this.tabs[Math.max(0, idx - 1)].path
      return this.active
    },
    reset() {
      this.$reset()
    }
  },
  persist: true
})
