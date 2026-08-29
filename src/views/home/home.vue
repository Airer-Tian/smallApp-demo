<template>
  <div class="home-page">
    <div class="hero">
      <div class="hero-blob b1"></div>
      <div class="hero-blob b2"></div>
      <div class="hero-blob b3"></div>
      <div class="hero-content">
        <div class="hero-badge">{{ greeting }}</div>
        <h2 class="hero-title">{{ auth.nickName || '用户' }}，欢迎回来</h2>
        <p class="hero-sub">SmallApp 管理系统 · 一切尽在掌控</p>
        <div class="hero-time">
          <el-icon :size="16"><Clock /></el-icon>
          {{ weekDay }} · {{ currentTime }}
        </div>
      </div>
      <div class="hero-card glass">
        <div class="glass-icon"><el-icon :size="26"><Menu /></el-icon></div>
        <div class="glass-num">{{ menuCount }}</div>
        <div class="glass-label">菜单数量</div>
      </div>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="(s, i) in stats" :key="i" :xs="12" :sm="6">
        <div class="stat-card" :style="{ '--sc1': s.c1, '--sc2': s.c2 }">
          <div class="stat-icon">
            <el-icon :size="28"><component :is="s.icon" /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value" :class="{ time: s.time }">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="never" class="quick-card">
      <template #header><span>快捷入口</span></template>
      <div class="quick-links">
        <div
          v-for="(item, idx) in quickMenus"
          :key="item.id"
          class="quick-item"
          :style="{ '--qc1': qcColors[idx % qcColors.length][0], '--qc2': qcColors[idx % qcColors.length][1] }"
          @click="goPage(item.routePath)"
        >
          <div class="quick-icon">
            <el-icon :size="22"><component :is="item.icon || 'Document'" /></el-icon>
          </div>
          <span class="quick-name">{{ item.name }}</span>
        </div>
        <div v-if="!quickMenus.length" class="empty-tip">暂无菜单权限</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, User, Avatar, Clock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { useMenuStore } from '@/store/menu'

const router = useRouter()
const auth = useAuthStore()
const menuStore = useMenuStore()

const menuCount = ref(0)
const currentTime = ref('')
let timer = null

const weekDay = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date().getDay()]
})

const stats = computed(() => [
  { icon: Menu, c1: 'var(--app-logo-from)', c2: 'var(--app-logo-to)', value: menuCount.value, label: '菜单数量' },
  { icon: User, c1: '#f59e0b', c2: '#fb923c', value: auth.roles.length, label: '角色数量' },
  { icon: Avatar, c1: '#10b981', c2: '#34d399', value: auth.nickName || '-', label: '当前用户' },
  { icon: Clock, c1: '#0ea5e9', c2: '#60a5fa', value: currentTime.value, label: '当前时间', time: true }
])

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const quickMenus = computed(() => {
  const flat = []
  function walk(list) {
    for (const m of list || []) {
      if (m.type === 2 && m.routePath) flat.push(m)
      if (m.children?.length) walk(m.children)
    }
  }
  walk(menuStore.menus)
  return flat.slice(0, 6)
})

// 快捷入口的多彩渐变
const qcColors = [
  ['#e11d48', '#fb7185'],
  ['#f97316', '#fb923c'],
  ['#8b5cf6', '#a78bfa'],
  ['#0ea5e9', '#38bdf8'],
  ['#10b981', '#34d399'],
  ['#ec4899', '#f471b5']
]

function countMenus(list) {
  let n = 0
  for (const m of list || []) {
    if (m.type !== 3) n++
    if (m.children?.length) n += countMenus(m.children)
  }
  return n
}

function refreshTime() {
  const d = new Date()
  currentTime.value = d.toLocaleTimeString('zh-CN', { hour12: false })
}

function goPage(path) {
  if (path) router.push(path)
}

onMounted(() => {
  menuCount.value = countMenus(menuStore.menus)
  refreshTime()
  timer = setInterval(refreshTime, 1000)
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ---------- Hero 横幅 ---------- */
.hero {
  position: relative;
  overflow: hidden;
  min-height: 168px;
  border-radius: 18px;
  padding: 30px 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: linear-gradient(120deg, var(--app-logo-from) 0%, var(--app-accent) 45%, var(--app-logo-to) 100%);
  color: #fff;
  box-shadow: 0 12px 30px -12px var(--app-btn-shadow);
}
.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  opacity: 0.35;
  background: rgba(255, 255, 255, 0.5);
  animation: float 8s ease-in-out infinite;
}
.b1 { width: 220px; height: 220px; top: -80px; right: 90px; }
.b2 { width: 160px; height: 160px; bottom: -70px; right: 260px; animation-delay: 2s; }
.b3 { width: 120px; height: 120px; top: 26px; left: 55%; animation-delay: 4s; }
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(14px, -16px) scale(1.08); }
}
.hero-content { position: relative; z-index: 1; }
.hero-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.4);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
  backdrop-filter: blur(4px);
}
.hero-title { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; }
.hero-sub { margin: 6px 0 12px; font-size: 14px; opacity: 0.92; }
.hero-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
}
.hero-card {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 190px;
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  &.glass {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(8px);
  }
  .glass-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 10px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.28);
  }
  .glass-num { font-size: 30px; font-weight: 800; line-height: 1.2; }
  .glass-label { font-size: 13px; opacity: 0.92; margin-top: 4px; }
}

/* ---------- 统计卡片 ---------- */
.stat-row { .el-col { margin-bottom: 8px; } }
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 20px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #f0f0f5;
  box-shadow: 0 4px 16px -8px rgba(0, 0, 0, 0.06);
  transition: all 0.25s ease;
  cursor: pointer;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 28px -12px rgba(0, 0, 0, 0.16);
  }
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  background: linear-gradient(135deg, var(--sc1) 0%, var(--sc2) 100%);
  box-shadow: 0 6px 14px -6px var(--sc1);
}
.stat-value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
  background: linear-gradient(120deg, var(--sc1) 0%, var(--sc2) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  &.time { font-size: 17px; }
}
.stat-label { font-size: 13px; color: #909399; margin-top: 2px; }

/* ---------- 快捷入口 ---------- */
.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.quick-item {
  width: 118px;
  height: 96px;
  border-radius: 14px;
  border: 1px solid #f0f0f5;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 13px;
  color: #4b4b61;
  &:hover {
    transform: translateY(-4px);
    border-color: transparent;
    box-shadow: 0 14px 28px -12px rgba(0, 0, 0, 0.16);
    .quick-icon {
      transform: scale(1.12) rotate(-6deg);
      box-shadow: 0 8px 18px -6px var(--qc1);
    }
    .quick-name { color: var(--qc1); }
  }
}
.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, var(--qc1) 0%, var(--qc2) 100%);
  box-shadow: 0 6px 14px -8px var(--qc1);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.quick-name {
  font-weight: 600;
  transition: color 0.2s;
}
.empty-tip {
  color: #c0c4cc;
  font-size: 14px;
}
</style>
