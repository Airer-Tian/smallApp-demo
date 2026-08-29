<template>
  <el-header class="header">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="item in crumbs" :key="item.path" :to="item.redirectable ? { path: item.path } : undefined">
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-right">
      <el-popover placement="bottom-end" :width="340" trigger="click">
        <template #reference>
          <button class="theme-btn">
            <el-icon><MagicStick /></el-icon>
          </button>
        </template>
        <div class="theme-panel">
          <div class="theme-title">主题配色</div>
          <div class="theme-grid">
            <div
              v-for="t in themeStore.themeList"
              :key="t.id"
              :class="['theme-card', { active: t.id === themeStore.currentId }]"
              @click="themeStore.setTheme(t.id)"
            >
              <div class="theme-swatches">
                <span v-for="(c, i) in t.preview" :key="i" :style="{ background: c }"></span>
              </div>
              <div class="theme-name">{{ t.name }}</div>
              <div class="theme-desc">{{ t.desc }}</div>
              <el-icon v-if="t.id === themeStore.currentId" class="theme-check"><Check /></el-icon>
            </div>
          </div>
        </div>
      </el-popover>

      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="30">{{ avatarText }}</el-avatar>
          <span class="nick">{{ authStore.nickName || '用户' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="center">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, MagicStick, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { useMenuStore } from '@/store/menu'
import { useTabsStore } from '@/store/tabs'
import { useThemeStore } from '@/store/theme'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const crumbs = computed(() =>
  route.matched
    .filter((r) => r.meta?.title)
    .map((r) => ({ path: r.path, title: r.meta.title, redirectable: r.path !== route.path }))
)

const avatarText = computed(() => (authStore.nickName || 'U').charAt(0))

async function handleCommand(cmd) {
  if (cmd === 'center') {
    router.push('/userCenter')
  } else if (cmd === 'logout') {
    await authStore.doLogout()
    useMenuStore().reset()
    useTabsStore().reset()
    ElMessage.success('已退出登录')
    router.replace('/login')
  }
}
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    outline: none;
    :deep(.el-avatar) {
      background: linear-gradient(135deg, var(--app-logo-from), var(--app-logo-to));
      color: #fff;
      font-weight: 600;
    }
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .theme-btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--app-sb-text);
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      background: var(--app-sb-hover-bg);
      color: var(--app-sb-hover-text);
    }
  }
}

.theme-panel {
  padding: 4px 2px;
  .theme-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }
  .theme-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .theme-card {
    position: relative;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      border-color: var(--app-sb-hover-text);
      transform: translateY(-1px);
    }
    &.active {
      border-color: var(--app-sb-hover-text);
      box-shadow: 0 0 0 2px var(--app-sb-hover-bg);
    }
    .theme-swatches {
      display: flex;
      gap: 2px;
      margin-bottom: 8px;
      span {
        width: 20px;
        height: 20px;
        border-radius: 5px;
        border: 1px solid rgba(0, 0, 0, 0.06);
      }
    }
    .theme-name {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }
    .theme-desc {
      font-size: 11px;
      color: #999;
      margin-top: 2px;
      line-height: 1.4;
    }
    .theme-check {
      position: absolute;
      top: 8px;
      right: 8px;
      color: var(--app-sb-hover-text);
      font-weight: 700;
    }
  }
}
</style>
