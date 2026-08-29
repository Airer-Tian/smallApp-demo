import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useMenuStore } from '@/store/menu'

const Layout = () => import('@/layout/index.vue')

export const staticRoutes = [
  { path: '/login', name: 'Login', component: () => import('@/views/login/login.vue'), meta: { title: '登录' } },
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/home',
    children: []
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/error/NotFound.vue'), meta: { title: '404' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const menu = useMenuStore()
  document.title = to.meta.title ? `${to.meta.title} - SmallApp` : 'SmallApp'

  if (to.path === '/login') {
    menu.registered = false
    return true
  }
  if (!auth.token) return { path: '/login', query: { redirect: to.fullPath } }

  // 已登录且动态路由未注册 → 拉 userinfo 并扁平化注册叶子路由
  if (!menu.registered) {
    try {
      const { getUserInfo } = await import('@/api/auth')
      const info = await getUserInfo()
      auth.setUserInfo(info)
      menu.setMenus(info.menus || [])
      for (const leaf of menu.flattenLeafRoutes(info.menus)) {
        router.addRoute('Layout', leaf)
      }
      menu.registered = true
      // 不能 {...to}:首次导航 to.name 是 NotFound,带 name 重导航会再次命中 404;
      // 仅携带路径三元组触发重新解析,命中刚注册的动态路由
      return { path: to.path, query: to.query, hash: to.hash, replace: true }
    } catch (e) {
      await auth.doLogout()
      return { path: '/login' }
    }
  }
  return true
})

export default router
