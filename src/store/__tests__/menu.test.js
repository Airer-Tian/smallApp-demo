import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMenuStore } from '../menu'

describe('menu store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const tree = [
    {
      id: 100, type: 1, routePath: '/system', routeName: 'System', name: '系统管理',
      icon: 'Setting', routeComponent: null,
      children: [
        {
          id: 200, type: 2, routePath: '/system/user', routeName: 'SysUser',
          routeComponent: 'system/user/index', name: '用户管理', icon: 'User'
        },
        {
          id: 201, type: 2, routePath: '/system/role', routeName: 'SysRole',
          routeComponent: 'system/role/index', name: '角色管理', icon: 'UserFilled'
        },
        { id: 2100, type: 3, perm: 'sys:user:add', routePath: null, name: '用户新增' }
      ]
    }
  ]

  it('flattenLeafRoutes skips buttons and builds full paths', () => {
    const store = useMenuStore()
    const leaves = store.flattenLeafRoutes(tree)
    expect(leaves.length).toBeGreaterThanOrEqual(2)
    // type=3 button should be skipped
    const paths = leaves.map((l) => l.path)
    expect(paths).toContain('system/user')
    expect(paths).toContain('system/role')
    expect(paths).not.toContain('sys:user:add')
  })

  it('flattenLeafRoutes produces correct meta', () => {
    const store = useMenuStore()
    const leaves = store.flattenLeafRoutes(tree)
    const userLeaf = leaves.find((l) => l.path === 'system/user')
    expect(userLeaf).toBeDefined()
    expect(userLeaf.meta.title).toBe('用户管理')
    expect(userLeaf.meta.icon).toBe('User')
    expect(userLeaf.name).toBe('SysUser')
  })

  it('flattenLeafRoutes filters buttons at every level', () => {
    const store = useMenuStore()
    const leaves = store.flattenLeafRoutes(tree)
    const serialized = JSON.stringify(leaves)
    expect(serialized).not.toContain('sys:user:add')
  })

  it('transformRoutes filters buttons and maps route fields', () => {
    const store = useMenuStore()
    const routes = store.transformRoutes(tree)
    expect(routes.length).toBe(1) // only /system dir
    const sysRoute = routes[0]
    expect(sysRoute.path).toBe('/system')
    expect(sysRoute.name).toBe('System')
    expect(sysRoute.children).toBeDefined()
    expect(sysRoute.children.length).toBe(2) // user + role, no button
    expect(JSON.stringify(routes)).not.toContain('sys:user:add')
  })

  it('handles empty menus gracefully', () => {
    const store = useMenuStore()
    expect(store.flattenLeafRoutes([])).toEqual([])
    expect(store.flattenLeafRoutes(null)).toEqual([])
    expect(store.transformRoutes([])).toEqual([])
  })

  it('absolute routePath is used directly without parent concatenation', () => {
    const store = useMenuStore()
    const menus = [{
      id: 10, type: 2, routePath: '/dashboard', routeName: 'Dashboard',
      routeComponent: 'home/home', name: '首页', icon: 'HomeFilled'
    }]
    const leaves = store.flattenLeafRoutes(menus)
    expect(leaves[0].path).toBe('dashboard')
  })
})
