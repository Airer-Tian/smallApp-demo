import axios from 'axios'
import { ElMessage } from 'element-plus'
import { handleMock } from '@/mock/server'

// 纯前端 demo：默认走本地伪后端（localStorage），无需任何服务端。
// 设 VITE_USE_MOCK=false 可切回真实后端（需自配 VITE_API_BASE）。
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15000
})

if (USE_MOCK) {
  service.defaults.adapter = async (config) => {
    let body = config.data
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch (e) { /* 保持原样 */ }
    }
    const res = await handleMock(
      (config.method || 'get').toLowerCase(),
      config.url,
      body,
      config.params,
      config.headers
    )
    return {
      data: res,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    }
  }
}

// 规避与 @/router 的循环依赖:由 main.js 在路由创建后注入
let routerRef = null
export function bindRouter(r) {
  routerRef = r
}

function gotoLogin() {
  localStorage.removeItem('auth')
  if (routerRef) {
    routerRef.push('/login?redirect=' + encodeURIComponent(routerRef.currentRoute.value.fullPath))
  }
}

service.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  if (auth.token) config.headers.Authorization = 'Bearer ' + auth.token
  return config
})

service.interceptors.response.use(
  (response) => {
    // blob 场景直接返回
    if (response.config.responseType === 'blob') return response
    const res = response.data
    if (res.code !== 200) {
      if (res.code === 401) {
        ElMessage.error('登录已过期，请重新登录')
        gotoLogin()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res.data
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      gotoLogin()
      return Promise.reject(error)
    }
    ElMessage.error(error.response?.data?.msg || error.message || '网络异常')
    return Promise.reject(error)
  }
)

export default service
