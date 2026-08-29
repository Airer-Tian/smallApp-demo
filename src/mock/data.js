// 纯前端 demo 的「伪后端」数据层：首次运行把种子数据写入 localStorage，之后以 localStorage 为准。
// 所有增删改查都落 localStorage，刷新不丢，体验接近真实系统。

const STORAGE_KEY = 'smallapp_demo_v2'

function pad(n) { return n < 10 ? '0' + n : '' + n }
function fmt(d) {
  d = new Date(d)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randStr(len) {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * c.length)]
  return s
}

// ---------- 种子数据 ----------
function buildSeed() {
  const now = Date.now()
  const depts = [
    { id: 1, name: '总公司', children: [
      { id: 2, name: '技术部', children: [
        { id: 3, name: '研发一组', children: [] },
        { id: 4, name: '测试组', children: [] }
      ]},
      { id: 5, name: '市场部', children: [] },
      { id: 6, name: '财务部', children: [] }
    ]}
  ]

  const roles = [
    { id: 1, name: '超级管理员', status: 1, remark: '系统最高权限', createTime: fmt(now - 86400000 * 10) },
    { id: 2, name: '普通用户', status: 1, remark: '普通员工', createTime: fmt(now - 86400000 * 8) },
    { id: 3, name: '审计员', status: 1, remark: '仅查看日志', createTime: fmt(now - 86400000 * 5) }
  ]

  const mkUser = (id, userName, nickName, roleIds, deptId) => ({
    id, userName, nickName,
    sex: id % 2 === 0 ? 1 : 0,
    tel: '138' + pad(id).padStart(2, '0') + '0000'.slice(0, 4),
    cell: '', email: userName + '@smallapp.com',
    postId: 1, remark: '', status: 1,
    createTime: fmt(now - 86400000 * (12 - id)),
    roleIds, deptIds: [deptId]
  })
  const users = [
    mkUser(1, 'admin', '超级管理员', [1], 1),
    mkUser(2, 'zhangsan', '张三', [2], 2),
    mkUser(3, 'lisi', '李四', [2], 3),
    mkUser(4, 'wangwu', '王五', [2], 4),
    mkUser(5, 'zhaoliu', '赵六', [3], 5),
    mkUser(6, 'testuser01', '测试用户', [2], 2)
  ]

  // 菜单：type 1=目录 2=页面 3=按钮；routeComponent 带 /index 以匹配 /src/views/**/index.vue
  // 注：首页/个人中心为静态页（首页固定在侧边栏顶部、个人中心在顶栏头像下拉），
  //     不放入后端菜单树；关于系统需排在菜单最底部。
  const menus = [
    { id: 1, type: 1, parentId: 0, name: '系统管理', icon: 'Setting', routePath: '', routeName: '', routeComponent: '', status: 1, sort: 1, children: [
      { id: 10, type: 2, parentId: 1, name: '用户管理', icon: 'User', routePath: '/system/user', routeName: 'SystemUser', routeComponent: 'system/user/index', status: 1, sort: 1,
        children: [
          { id: 1011, type: 3, parentId: 10, name: '新增', perm: 'sys:user:add', status: 1, sort: 1 },
          { id: 1012, type: 3, parentId: 10, name: '编辑', perm: 'sys:user:edit', status: 1, sort: 2 },
          { id: 1013, type: 3, parentId: 10, name: '删除', perm: 'sys:user:delete', status: 1, sort: 3 },
          { id: 1014, type: 3, parentId: 10, name: '重置密码', perm: 'sys:user:resetPwd', status: 1, sort: 4 }
        ]},
      { id: 20, type: 2, parentId: 1, name: '角色管理', icon: 'UserFilled', routePath: '/system/role', routeName: 'SystemRole', routeComponent: 'system/role/index', status: 1, sort: 2,
        children: [
          { id: 2011, type: 3, parentId: 20, name: '授权', perm: 'sys:role:assign', status: 1, sort: 1 }
        ]},
      { id: 30, type: 2, parentId: 1, name: '菜单管理', icon: 'Menu', routePath: '/system/menu', routeName: 'SystemMenu', routeComponent: 'system/menu/index', status: 1, sort: 3 },
      { id: 40, type: 2, parentId: 1, name: '部门管理', icon: 'OfficeBuilding', routePath: '/system/dept', routeName: 'SystemDept', routeComponent: 'system/dept/index', status: 1, sort: 4 },
      { id: 50, type: 2, parentId: 1, name: '字典管理', icon: 'Collection', routePath: '/system/dict', routeName: 'SystemDict', routeComponent: 'system/dict/index', status: 1, sort: 5 },
      { id: 60, type: 1, parentId: 1, name: '日志管理', icon: 'Document', routePath: '', routeName: '', routeComponent: '', status: 1, sort: 6, children: [
        { id: 61, type: 2, parentId: 60, name: '操作日志', icon: 'List', routePath: '/system/log/operLog', routeName: 'OperLog', routeComponent: 'system/log/operLog', status: 1, sort: 1 },
        { id: 62, type: 2, parentId: 60, name: '登录日志', icon: 'Clock', routePath: '/system/log/loginLog', routeName: 'LoginLog', routeComponent: 'system/log/loginLog', status: 1, sort: 2 }
      ]}
    ]},
    { id: 103, type: 2, parentId: 0, name: '关于系统', icon: 'InfoFilled', routePath: '/about', routeName: 'About', routeComponent: 'about/about', status: 1, sort: 2 }
  ]

  const dicts = [
    { id: 1, name: '用户性别', code: 'sys_user_sex', status: 1, remark: '性别字典', createTime: fmt(now - 86400000 * 9) },
    { id: 2, name: '系统开关', code: 'sys_common_status', status: 1, remark: '', createTime: fmt(now - 86400000 * 9) },
    { id: 3, name: '菜单类型', code: 'sys_menu_type', status: 1, remark: '', createTime: fmt(now - 86400000 * 9) }
  ]
  const dictItems = [
    { id: 1, dictId: 1, name: '男', code: '0', sort: 0, status: 1, remark: '' },
    { id: 2, dictId: 1, name: '女', code: '1', sort: 1, status: 1, remark: '' },
    { id: 3, dictId: 1, name: '未知', code: '2', sort: 2, status: 1, remark: '' },
    { id: 4, dictId: 2, name: '正常', code: '1', sort: 0, status: 1, remark: '' },
    { id: 5, dictId: 2, name: '停用', code: '0', sort: 1, status: 1, remark: '' },
    { id: 6, dictId: 3, name: '目录', code: '1', sort: 0, status: 1, remark: '' },
    { id: 7, dictId: 3, name: '页面', code: '2', sort: 1, status: 1, remark: '' },
    { id: 8, dictId: 3, name: '按钮', code: '3', sort: 2, status: 1, remark: '' }
  ]

  const operTitles = ['用户管理-查询', '用户管理-新增', '用户管理-修改', '角色管理-授权', '菜单管理-刷新', '部门管理-查询', '字典管理-查询', '登录成功', '退出登录']
  const operLogs = Array.from({ length: 36 }, (_, i) => ({
    id: i + 1, title: randItem(operTitles), operName: 'admin',
    operUrl: '/api/system/user', method: randItem(['GET', 'POST', 'PUT', 'DELETE']),
    operTime: fmt(now - i * 3600000 - Math.random() * 3600000), status: 1,
    costTime: Math.floor(Math.random() * 200) + 8, operIp: '192.168.73.1'
  }))
  const loginLogs = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1, userName: 'admin', ip: '192.168.73.1',
    loginTime: fmt(now - i * 7200000 - Math.random() * 3600000), status: 1, msg: '登录成功'
  }))

  // 角色-菜单分配（叶子菜单id集合）：所有角色均含 关于 等基础页面，保证基础可达
  const leafIds = [103, 10, 20, 30, 40, 50, 61, 62]
  const roleMenus = {
    1: leafIds,
    2: [103, 10, 20, 30, 40, 50],
    3: [103, 61, 62]
  }

  return { users, roles, depts, menus, dicts, dictItems, operLogs, loginLogs, roleMenus }
}

// ---------- 持久化 ----------
let db
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) { db = JSON.parse(raw); return }
  } catch (e) { /* ignore */ }
  db = buildSeed()
  save()
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)) }
load()

export function getDb() { return db }
export function nextId(arr) { return arr.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1 }
export function paginate(list, params) {
  const pageNum = Number(params && params.pageNum) || 1
  const pageSize = Number(params && params.pageSize) || 10
  const start = (pageNum - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length }
}

// ---------- 部门/菜单树工具 ----------
function walk(tree, fn) {
  ;(tree || []).forEach(n => { fn(n); if (n.children) walk(n.children, fn) })
}
function findNode(tree, id) {
  let found = null
  walk(tree, n => { if (n.id === id) found = n })
  return found
}
function findDeptName(id) {
  let name = '未知'
  walk(db.depts, n => { if (n.id === id) name = n.name })
  return name
}
export function findDeptNameExport(id) { return findDeptName(id) }

// ---------- 用户 ----------
export function toUserRow(u) {
  return {
    ...u,
    roles: (u.roleIds || []).map(id => { const r = db.roles.find(x => x.id === id); return r ? { id: r.id, name: r.name } : { id, name: '未知' } }),
    depts: (u.deptIds || []).map(id => ({ id, name: findDeptName(id) }))
  }
}
export function listUsers() { return db.users.map(toUserRow) }
export function getUser(id) { return db.users.find(u => u.id === id) }
export function addUser(data) {
  const u = { id: nextId(db.users), createTime: fmt(Date.now()), status: 1, ...data }
  db.users.push(u); save(); return u
}
export function updateUser(id, data) {
  const u = db.users.find(x => x.id === id); if (!u) throw new Error('用户不存在')
  Object.assign(u, data, { id }); save(); return u
}
export function deleteUsers(ids) { db.users = db.users.filter(u => !ids.includes(u.id)); save() }
export function resetUserPwd(id) { const u = db.users.find(x => x.id === id); if (u) { save() } }

// ---------- 角色 ----------
export function listRoles() { return db.roles }
export function addRole(data) { const r = { id: nextId(db.roles), createTime: fmt(Date.now()), ...data }; db.roles.push(r); save(); return r }
export function updateRole(id, data) { const r = db.roles.find(x => x.id === id); if (!r) throw new Error('角色不存在'); Object.assign(r, data, { id }); save(); return r }
export function deleteRoles(ids) { db.roles = db.roles.filter(r => !ids.includes(r.id)); ids.forEach(i => delete db.roleMenus[i]); save() }
export function getRoleMenus(roleId) { return db.roleMenus[roleId] || [] }
export function assignRoleMenus(roleId, menuIds) { db.roleMenus[roleId] = menuIds; save() }

// ---------- 菜单 ----------
export function getMenus() { return db.menus }
export function addMenu(data) {
  const id = nextId(flatIds(db.menus))
  const node = { id, status: 1, children: data.type === 1 ? [] : undefined, ...data }
  if (!data.parentId || data.parentId === 0) db.menus.push(node)
  else { const p = findNode(db.menus, data.parentId); if (p) { p.children = p.children || []; p.children.push(node) } else db.menus.push(node) }
  save(); return node
}
export function updateMenu(id, data) { const n = findNode(db.menus, id); if (!n) throw new Error('菜单不存在'); Object.assign(n, data, { id }); save(); return n }
export function deleteMenu(id) {
  const remove = (list) => list.filter(n => { if (n.children) n.children = remove(n.children); return n.id !== id })
  db.menus = remove(db.menus)
  Object.keys(db.roleMenus).forEach(k => { db.roleMenus[k] = db.roleMenus[k].filter(x => x !== id) })
  save()
}
function flatIds(tree, acc = []) { walk(tree, n => acc.push(n.id)); return acc }

// ---------- 部门 ----------
export function getDepts() { return db.depts }
export function addDept(data) {
  const id = nextId(flatIds(db.depts))
  const node = { id, children: [], ...data }
  if (!data.parentId || data.parentId === 0) db.depts.push(node)
  else { const p = findNode(db.depts, data.parentId); if (p) { p.children = p.children || []; p.children.push(node) } else db.depts.push(node) }
  save(); return node
}
export function updateDept(id, data) { const n = findNode(db.depts, id); if (!n) throw new Error('部门不存在'); Object.assign(n, data, { id }); save(); return n }
export function deleteDept(id) { const remove = (list) => list.filter(n => { if (n.children) n.children = remove(n.children); return n.id !== id }); db.depts = remove(db.depts); save() }

// ---------- 字典 ----------
export function listDicts() { return db.dicts }
export function addDict(data) { const d = { id: nextId(db.dicts), createTime: fmt(Date.now()), ...data }; db.dicts.push(d); save(); return d }
export function updateDict(id, data) { const d = db.dicts.find(x => x.id === id); if (!d) throw new Error('字典不存在'); Object.assign(d, data, { id }); save(); return d }
export function deleteDict(id) { db.dicts = db.dicts.filter(d => d.id !== id); db.dictItems = db.dictItems.filter(it => it.dictId !== id); save() }
export function listDictItems(params) {
  let items = db.dictItems
  if (params && params.dictId) items = items.filter(it => it.dictId === Number(params.dictId))
  return items
}
export function addDictItem(data) { const it = { id: nextId(db.dictItems), ...data }; db.dictItems.push(it); save(); return it }
export function updateDictItem(id, data) { const it = db.dictItems.find(x => x.id === id); if (!it) throw new Error('字典项不存在'); Object.assign(it, data, { id }); save(); return it }
export function deleteDictItems(ids) { db.dictItems = db.dictItems.filter(it => !ids.includes(it.id)); save() }
export function getDictItemsByCode(code) {
  const d = db.dicts.find(x => x.code === code); if (!d) return []
  return db.dictItems.filter(it => it.dictId === d.id)
}
