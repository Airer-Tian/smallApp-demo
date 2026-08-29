import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from '@/router'
import { bindRouter } from '@/utils/request'
import permissionDirective from '@/directives/permission'
import { useThemeStore } from '@/store/theme'
import './css/globale.css'
// Element Plus 命令式组件(ElMessage / ElMessageBox)在 JS 中直接调用,
// 其样式不会被"模板按需引入"插件自动加载,需手动引入,否则确认弹框无背景/阴影/内边距
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

const app = createApp(App)
const pinia = createPinia().use(piniaPersist)
app.use(pinia)
app.use(router)
app.directive('permission', permissionDirective)
bindRouter(router)
// 先应用持久化的主题变量,避免首屏闪色
useThemeStore(pinia).init()
app.mount('#app')
console.log(import.meta.env.VITE_APP_TITLE, 'bootstrapped')
