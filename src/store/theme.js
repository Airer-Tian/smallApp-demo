import { defineStore } from 'pinia'
import { themes, defaultThemeId } from '@/theme/themes'

function applyVars(vars) {
  const root = document.documentElement
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v)
  }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentId: localStorage.getItem('smallapp-theme') || defaultThemeId
  }),
  getters: {
    currentTheme() {
      return themes.find((t) => t.id === this.currentId) || themes[0]
    },
    themeList() {
      return themes
    }
  },
  actions: {
    setTheme(id) {
      const theme = themes.find((t) => t.id === id)
      if (!theme) return
      this.currentId = theme.id
      localStorage.setItem('smallapp-theme', theme.id)
      applyVars(theme.vars)
    },
    init() {
      applyVars(this.currentTheme.vars)
    }
  }
})
