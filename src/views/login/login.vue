<template>
  <div class="login-page">
    <!-- 背景柔和光晕 -->
    <div class="halo halo-1"></div>
    <div class="halo halo-2"></div>
    <div class="halo halo-3"></div>

    <!-- 漂浮光球（梦幻） -->
    <span v-for="i in 12" :key="'b' + i" class="bubble" :class="'bubble-' + i"></span>

    <div class="login-card">
      <div class="card-head">
        <div class="brand-logo">
          <el-icon :size="26" color="#fff"><Monitor /></el-icon>
        </div>
        <h1 class="brand-title">SmallApp 管理系统</h1>
      </div>

      <div class="card-body">
        <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="handleLogin">
          <el-form-item prop="userName">
            <el-input v-model.trim="form.userName" placeholder="用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model.trim="form.password" type="password" show-password
                      placeholder="密码" :prefix-icon="Lock" />
          </el-form-item>
          <el-form-item prop="captchaCode">
            <div class="captcha-row">
              <el-input v-model.trim="form.captchaCode" placeholder="验证码" maxlength="4" />
              <img v-if="captcha.imageBase64" :src="captcha.imageBase64" class="captcha-img"
                   title="点击刷新" @click="loadCaptcha" />
            </div>
          </el-form-item>
          <el-button type="primary" class="submit" :loading="loading" @click="handleLogin">登 录</el-button>
        </el-form>
      </div>

      <div class="card-foot">
        <span>© {{ year }} SmallApp · All Rights Reserved</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, Monitor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCaptcha } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { useMenuStore } from '@/store/menu'
import { useTabsStore } from '@/store/tabs'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const year = new Date().getFullYear()

const formRef = ref()
const loading = ref(false)
const captcha = ref({})
const form = reactive({ userName: '', password: '', captchaKey: '', captchaCode: '' })

const rules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

async function loadCaptcha() {
  let lastErr
  for (let i = 0; i < 3; i++) {
    try {
      const data = await getCaptcha()
      captcha.value = data
      form.captchaKey = data.captchaKey
      form.captchaCode = ''
      return
    } catch (e) {
      lastErr = e
      // 退避重试,应对 Redis 瞬时抖动导致的验证码接口 500
      await new Promise(r => setTimeout(r, 300 * (i + 1)))
    }
  }
  // 仍失败则保留空值(图片不渲染),用户点击图片可再次触发本函数重试
  console.error('loadCaptcha failed after retries', lastErr)
}

async function handleLogin() {
  await formRef.value.validate()
  loading.value = true
  try {
    await authStore.doLogin({ ...form })
    useMenuStore().$patch({ menus: [], registered: false })
    useTabsStore().$reset()
    ElMessage.success('欢迎回来')
    router.replace(route.query.redirect || '/home')
  } catch (e) {
    // 登录失败已由响应拦截器提示,这里仅兜底避免未处理的 Promise 拒绝
    loadCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(loadCaptcha)
</script>

<style scoped lang="scss">
body {
  margin: 0;
}

.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  overflow: hidden;
  background:
    radial-gradient(1000px 600px at 10% 0%, rgba(196, 181, 253, 0.5), transparent 60%),
    radial-gradient(900px 600px at 90% 10%, rgba(129, 214, 255, 0.4), transparent 60%),
    radial-gradient(1000px 700px at 80% 100%, rgba(255, 200, 231, 0.45), transparent 60%),
    radial-gradient(800px 600px at 0% 100%, rgba(190, 242, 210, 0.45), transparent 60%),
    linear-gradient(135deg, #f6f2ff 0%, #eef9ff 45%, #fdf2f8 100%);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 背景大光晕 */
.halo {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.5;
  pointer-events: none;
  animation: haloFloat 14s ease-in-out infinite;
}
.halo-1 {
  width: 420px; height: 420px; top: -120px; left: 15%;
  background: radial-gradient(circle, rgba(196, 181, 253, 0.7), transparent 70%);
}
.halo-2 {
  width: 380px; height: 380px; bottom: -100px; right: 12%;
  background: radial-gradient(circle, rgba(255, 182, 224, 0.6), transparent 70%);
  animation-delay: -5s;
}
.halo-3 {
  width: 340px; height: 340px; top: 45%; right: 30%;
  background: radial-gradient(circle, rgba(139, 220, 255, 0.55), transparent 70%);
  animation-delay: -9s;
}

@keyframes haloFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -25px) scale(1.06); }
}

/* 漂浮光球 */
.bubble {
  position: absolute;
  bottom: -120px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(0.5px);
  opacity: 0.85;
  animation: rise linear infinite;
  box-shadow: inset -6px -6px 14px rgba(255, 255, 255, 0.25);
}
.bubble::after {
  content: '';
  position: absolute;
  top: 15%;
  left: 20%;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.3) 70%);
  filter: blur(0.5px);
}

.bubble-1  { left: 6%;  width: 40px; height: 40px; background: radial-gradient(circle at 35% 30%, #fff, #b39dff 70%); animation-duration: 9s;  animation-delay: 0s; }
.bubble-2  { left: 14%; width: 26px; height: 26px; background: radial-gradient(circle at 35% 30%, #fff, #67e8f9 70%); animation-duration: 7.5s; animation-delay: 1.2s; }
.bubble-3  { left: 22%; width: 34px; height: 34px; background: radial-gradient(circle at 35% 30%, #fff, #f9a8d4 70%); animation-duration: 10s; animation-delay: 2.5s; }
.bubble-4  { left: 30%; width: 30px; height: 30px; background: radial-gradient(circle at 35% 30%, #fff, #b39dff 70%); animation-duration: 8s;  animation-delay: 0.8s; }
.bubble-5  { left: 42%; width: 36px; height: 36px; background: radial-gradient(circle at 35% 30%, #fff, #34d399 70%); animation-duration: 9.5s; animation-delay: 3s; }
.bubble-6  { left: 54%; width: 28px; height: 28px; background: radial-gradient(circle at 35% 30%, #fff, #93c5fd 70%); animation-duration: 8.5s; animation-delay: 1.8s; }
.bubble-7  { left: 63%; width: 42px; height: 42px; background: radial-gradient(circle at 35% 30%, #fff, #f9a8d4 70%); animation-duration: 11s; animation-delay: 4s; }
.bubble-8  { left: 72%; width: 24px; height: 24px; background: radial-gradient(circle at 35% 30%, #fff, #67e8f9 70%); animation-duration: 7s;  animation-delay: 2s; }
.bubble-9  { left: 81%; width: 34px; height: 34px; background: radial-gradient(circle at 35% 30%, #fff, #b39dff 70%); animation-duration: 9s;  animation-delay: 1s; }
.bubble-10 { left: 90%; width: 28px; height: 28px; background: radial-gradient(circle at 35% 30%, #fff, #34d399 70%); animation-duration: 8s;  animation-delay: 4.5s; }
.bubble-11 { left: 36%; width: 20px; height: 20px; background: radial-gradient(circle at 35% 30%, #fff, #f9a8d4 70%); animation-duration: 6.5s; animation-delay: 2.8s; }
.bubble-12 { left: 50%; width: 22px; height: 22px; background: radial-gradient(circle at 35% 30%, #fff, #93c5fd 70%); animation-duration: 7.8s; animation-delay: 5s; }

@keyframes rise {
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  8%   { opacity: 0.9; }
  85%  { opacity: 0.8; }
  100% { transform: translateY(-118vh) translateX(30px); opacity: 0; }
}

.login-card {
  position: relative;
  z-index: 2;
  width: min(400px, 100%);
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 60px rgba(139, 120, 200, 0.22),
              inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.card-head {
  background: linear-gradient(135deg, #c084fc 0%, #818cf8 45%, #60a5fa 100%);
  padding: 34px 24px 28px;
  text-align: center;
  position: relative;
}
.card-head::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.35), transparent 50%);
}
.brand-logo {
  position: relative;
  width: 54px;
  height: 54px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  box-shadow: 0 6px 18px rgba(120, 100, 200, 0.35);
}
.brand-title {
  position: relative;
  margin: 0;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(100, 80, 180, 0.35);
}

.card-body {
  padding: 28px 30px 6px;
}

.captcha-row {
  display: flex;
  gap: 10px;
  width: 100%;
}
.captcha-img {
  height: 40px;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #e8e0f5;
  transition: transform 0.2s;
}
.captcha-img:hover {
  transform: scale(1.04);
}

.submit {
  width: 100%;
  margin-top: 4px;
  height: 46px;
  font-size: 16px;
  letter-spacing: 4px;
  border: none;
  background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%);
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 22px rgba(124, 92, 246, 0.32);
  transition: transform 0.2s, box-shadow 0.2s;
}
.submit:hover,
.submit:focus {
  background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(124, 92, 246, 0.45);
}

.card-foot {
  padding: 18px 30px 24px;
  text-align: center;
  color: #a899c7;
  font-size: 12px;
}

.login-card :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 1px #e8e0f5 inset;
  border-radius: 10px;
  transition: box-shadow 0.2s, background 0.2s;
}
.login-card :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px #8b5cf6 inset,
              0 0 0 3px rgba(139, 92, 246, 0.16);
}
.login-card :deep(.el-input__prefix .el-input__icon) {
  color: #a78bfa;
}
</style>
