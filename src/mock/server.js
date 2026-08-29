// 纯前端 demo 的「伪后端」：在浏览器内拦截请求并基于 src/mock/data.js（localStorage）返回数据。
// handleMock(method, url, body, params, headers) → { code, msg, data }
import {
  getDb, paginate, nextId,
  toUserRow, listUsers, getUser, addUser, updateUser, deleteUsers, resetUserPwd,
  listRoles, addRole, updateRole, deleteRoles, getRoleMenus, assignRoleMenus,
  getMenus, addMenu, updateMenu, deleteMenu,
  getDepts, addDept, updateDept, deleteDept,
  listDicts, addDict, updateDict, deleteDict, listDictItems, addDictItem, updateDictItem, deleteDictItems, getDictItemsByCode
} from './data'

function pad(n) { return n < 10 ? '0' + n : '' + n }
function now() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// 验证码暂存（仅内存态，刷新即失效）
const captchaStore = {}
function genCaptchaKey() { return 'cap_' + Math.random().toString(36).slice(2) + Date.now().toString(36) }

function svgCaptcha(text) {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  const spans = text.split('').map((ch, i) => {
    const c = colors[i % colors.length]
    const x = 18 + i * 26
    const y = 34 + Math.floor(Math.random() * 8)
    const rot = (Math.random() * 30 - 15).toFixed(1)
    return `<text x="${x}" y="${y}" font-size="28" font-family="Arial" fill="${c}" transform="rotate(${rot} ${x} ${y})" font-weight="bold">${ch}</text>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="48" viewBox="0 0 140 48">
    <rect width="140" height="48" fill="#f5f7fa"/>
    <path d="M0 24 Q35 10 70 24 T140 24" stroke="#dcdfe6" fill="none" stroke-width="1.5"/>
    ${spans}
  </svg>`
  return 'data:image/svg+xml;base64,' + btoa(svg)
}

function currentToken(headers) {
  const h = (headers && (headers.Authorization || headers.authorization)) || ''
  return h.startsWith('Bearer ') ? h.slice(7) : ''
}
function authUser(headers) {
  if (!currentToken(headers)) return null
  // 简易 token：'MOCK.<userName>'
  const userName = decodeURIComponent(currentToken(headers).split('.')[1] || '')
  const db = getDb()
  return db.users.find(u => u.userName === userName) || null
}

function collectMenuPerms(menuIds) {
  const db = getDb()
  const idSet = new Set(menuIds)
  const perms = new Set()
  const collectUnder = (list) => (list || []).forEach(n => {
    if (n.type === 3 && n.perm) { perms.add(n.perm); return }
    if (n.children) collectUnder(n.children)
  })
  const walk = (list) => list.forEach(n => {
    // 角色拥有某页面，则该页面下的全部按钮权限都生效
    if (idSet.has(n.id)) collectUnder(n.children)
    if (n.children) walk(n.children)
  })
  walk(db.menus)
  return [...perms]
}

function buildUserInfo(u, db) {
  const roleIds = u.roleIds || []
  const roles = roleIds.map(id => { const r = db.roles.find(x => x.id === id); return r ? { id: r.id, name: r.name } : { id, name: '未知' } })
  const perms = collectMenuPerms(roleIds.flatMap(id => getRoleMenus(id)))
  return {
    userId: u.id,
    username: u.userName,
    nickName: u.nickName,
    avatar: '',
    roles,
    perms,
    menus: db.menus
  }
}

function ok(data) { return { code: 200, msg: 'ok', data } }
function fail(code, msg) { return { code, msg, data: null } }

function matchPath(url) {
  // 去掉查询串
  const path = url.split('?')[0]
  return path
}

export async function handleMock(method, url, body, params, headers) {
  await new Promise(r => setTimeout(r, 120 + Math.random() * 220)) // 模拟网络延迟
  const path = matchPath(url)
  const db = getDb()
  const seg = path.split('/').filter(Boolean) // e.g. ['users','1']

  // ---- 认证 ----
  if (method === 'get' && path === '/auth/captcha') {
    const code = String(Math.floor(1000 + Math.random() * 9000))
    const key = genCaptchaKey()
    captchaStore[key] = code
    return ok({ captchaKey: key, imageBase64: svgCaptcha(code) })
  }
  if (method === 'post' && path === '/auth/login') {
    const captcha = captchaStore[body.captchaKey]
    if (!captcha || captcha.toLowerCase() !== String(body.captchaCode || '').toLowerCase()) {
      return fail(500, '验证码错误')
    }
    delete captchaStore[body.captchaKey]
    const u = db.users.find(x => x.userName === body.userName)
    if (!u) return fail(500, '用户名或密码错误')
    // demo 仅支持统一口令 123456（UI 强密码策略只约束真实注册，这里放宽以便体验）
    if (body.password !== '123456') return fail(500, '密码错误（demo 统一口令 123456）')
    const token = 'MOCK.' + encodeURIComponent(u.userName)
    return ok({ token, nickName: u.nickName })
  }
  if (method === 'get' && path === '/auth/userinfo') {
    const u = authUser(headers)
    if (!u) return fail(401, '未登录或登录已过期')
    return ok(buildUserInfo(u, db))
  }
  if (method === 'post' && path === '/auth/logout') {
    return ok({})
  }

  // 其余接口均需登录
  const me = authUser(headers)
  if (!me) return fail(401, '未登录或登录已过期')

  // ---- 用户 ----
  if (method === 'get' && path === '/users') {
    return ok(paginate(listUsers(), params))
  }
  if (method === 'get' && seg[0] === 'users' && seg[1] && !isNaN(seg[1])) {
    const u = getUser(Number(seg[1]))
    return u ? ok(u) : fail(500, '用户不存在')
  }
  if (method === 'post' && path === '/users') {
    const u = addUser({ ...body, createTime: now() })
    return ok(u)
  }
  if (method === 'put' && seg[0] === 'users' && seg[1] && seg[1] !== 'password' && !seg[2] && isNaN(Number(seg[1])) === false) {
    const u = updateUser(Number(seg[1]), body)
    return ok(u)
  }
  if (method === 'put' && seg[0] === 'users' && seg[1] === 'password') {
    return ok({})
  }
  if (method === 'put' && seg[0] === 'users' && seg[1] && seg[2] === 'resetPassword') {
    resetUserPwd(Number(seg[1]))
    return ok({})
  }
  if (method === 'delete' && path === '/users') {
    deleteUsers(body || [])
    return ok({})
  }

  // ---- 角色 ----
  if (method === 'get' && path === '/roles') {
    return ok(paginate(listRoles(), params))
  }
  if (method === 'get' && path === '/roles/simple') {
    return ok(listRoles().map(r => ({ id: r.id, name: r.name })))
  }
  if (method === 'get' && seg[0] === 'roles' && seg[1] && seg[2] === 'menus') {
    return ok(getRoleMenus(Number(seg[1])))
  }
  if (method === 'post' && path === '/roles') {
    return ok(addRole({ ...body, createTime: now() }))
  }
  if (method === 'put' && seg[0] === 'roles' && seg[1] && seg[2] === 'menus') {
    assignRoleMenus(Number(seg[1]), body || [])
    return ok({})
  }
  if (method === 'put' && seg[0] === 'roles' && seg[1]) {
    return ok(updateRole(Number(seg[1]), body))
  }
  if (method === 'delete' && path === '/roles') {
    deleteRoles(body || [])
    return ok({})
  }

  // ---- 菜单 ----
  if (method === 'get' && path === '/menus/tree') {
    return ok(getMenus())
  }
  if (method === 'post' && path === '/menus') {
    return ok(addMenu(body))
  }
  if (method === 'put' && seg[0] === 'menus' && seg[1]) {
    return ok(updateMenu(Number(seg[1]), body))
  }
  if (method === 'delete' && seg[0] === 'menus' && seg[1]) {
    deleteMenu(Number(seg[1]))
    return ok({})
  }

  // ---- 部门 ----
  if (method === 'get' && path === '/depts/tree') {
    return ok(getDepts())
  }
  if (method === 'get' && seg[0] === 'depts' && seg[1]) {
    return ok(getDb().depts)
  }
  if (method === 'post' && path === '/depts') {
    return ok(addDept(body))
  }
  if (method === 'put' && seg[0] === 'depts' && seg[1]) {
    return ok(updateDept(Number(seg[1]), body))
  }
  if (method === 'delete' && seg[0] === 'depts' && seg[1]) {
    deleteDept(Number(seg[1]))
    return ok({})
  }

  // ---- 字典 ----
  if (method === 'get' && path === '/dicts') {
    return ok(paginate(listDicts(), params))
  }
  if (method === 'get' && seg[0] === 'dicts' && seg[1] === 'code' && seg[2] && seg[3] === 'items') {
    return ok(getDictItemsByCode(seg[2]))
  }
  if (method === 'post' && path === '/dicts') {
    return ok(addDict({ ...body, createTime: now() }))
  }
  if (method === 'put' && seg[0] === 'dicts' && seg[1]) {
    return ok(updateDict(Number(seg[1]), body))
  }
  if (method === 'delete' && seg[0] === 'dicts' && seg[1]) {
    deleteDict(Number(seg[1]))
    return ok({})
  }
  if (method === 'get' && path === '/dict-items') {
    return ok(paginate(listDictItems(params), params))
  }
  if (method === 'post' && path === '/dict-items') {
    return ok(addDictItem(body))
  }
  if (method === 'put' && seg[0] === 'dict-items' && seg[1]) {
    return ok(updateDictItem(Number(seg[1]), body))
  }
  if (method === 'delete' && path === '/dict-items') {
    deleteDictItems(body || [])
    return ok({})
  }

  // ---- 日志 ----
  if (method === 'get' && path === '/operLogs/page') {
    return ok(paginate(db.operLogs, params))
  }
  if (method === 'get' && path === '/loginLogs/page') {
    return ok(paginate(db.loginLogs, params))
  }

  return fail(404, '接口不存在: ' + method.toUpperCase() + ' ' + path)
}
