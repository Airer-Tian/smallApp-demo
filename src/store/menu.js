import { defineStore } from 'pinia'

// 注意:glob keys 保留模式前缀,统一用 /src/ 形式与 resolveView 拼接规则保持一致
const modules = import.meta.glob('/src/views/**/*.vue')

export const useMenuStore = defineStore('menu', {
  state: () => ({ menus: [], collapsed: false, registered: false }),
  actions: {
    setMenus(menus) {
      this.menus = menus || []
    },

    transformRoutes(menus) {
      return (menus || [])
        .filter((m) => m.type !== 3 && m.routePath)
        .map((m) => ({
          path: m.routePath,
          name: m.routeName,
          component: m.type === 1 && m.children?.length ? undefined : resolveView(m.routeComponent),
          meta: { title: m.name, icon: m.icon },
          children: m.children?.length ? this.transformRoutes(m.children) : undefined
        }))
    },

    /** 目录→叶子扁平化:注册为 Layout 子路由 */
    flattenLeafRoutes(menus, parentPath = '') {
      const leaves = []
      for (const m of menus || []) {
        if (m.type === 3) continue
        // 后端存的是完整路由地址(如 /system/user),去掉前导 / 使其成为 Layout 的子路由
        const fullPath = m.routePath?.startsWith('/')
          ? m.routePath
          : (parentPath + '/' + m.routePath).replace(/\/+/g, '/')
        if (m.type === 2) {
          leaves.push({
            path: fullPath.replace(/^\//, ''),
            name: m.routeName,
            component: resolveView(m.routeComponent),
            meta: { title: m.name, icon: m.icon }
          })
        }
        if (m.children?.length) leaves.push(...this.flattenLeafRoutes(m.children, fullPath))
      }
      return leaves
    },

    reset() {
      this.$reset()
      localStorage.removeItem('menu')
    }
  },
  // registered 标记不可持久化:动态路由是内存态,刷新后必须重新注册
  persist: { pick: ['menus', 'collapsed'] }
})

function resolveView(componentPath) {
  if (!componentPath) return undefined
  const key = '/src/views/' + componentPath.replace(/^\//, '') + '.vue'
  // 视图缺失回退 404,避免死链接
  return modules[key] || modules['/src/views/error/NotFound.vue']
}
