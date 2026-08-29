<template>
  <el-aside :width="menuStore.collapsed ? '64px' : '210px'" class="sidebar">
    <div class="logo">
      <div class="logo-badge" v-if="!menuStore.collapsed">S</div>
      <span v-if="!menuStore.collapsed">SmallApp</span>
      <div class="logo-badge" v-else>S</div>
    </div>
    <el-scrollbar>
      <el-menu
        :collapse="menuStore.collapsed"
        router
        :default-active="$route.path"
        class="sidebar-menu"
      >
        <el-menu-item index="/home">
          <el-icon :style="{ color: homeColor }"><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <template v-for="(m, idx) in visibleMenus" :key="m.id">
          <MenuItem :menu="m" :color="palette[idx % palette.length]" />
        </template>
      </el-menu>
    </el-scrollbar>
    <div class="collapse-btn" @click="menuStore.collapsed = !menuStore.collapsed">
      <el-icon><component :is="menuStore.collapsed ? Expand : Fold" /></el-icon>
    </div>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { Fold, Expand, HomeFilled } from '@element-plus/icons-vue'
import { useMenuStore } from '@/store/menu'
import { useThemeStore } from '@/store/theme'
import MenuItem from './MenuItem.vue'

const menuStore = useMenuStore()
const themeStore = useThemeStore()
// 静态页(首页等)不在后端菜单树里,侧边栏只渲染后端返回的 menus
const visibleMenus = computed(() => menuStore.menus)

// 多彩高亮：每个顶级菜单分配一种活泼的强调色
const palette = ['#e11d48', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#2563eb', '#14b8a6']
const homeColor = '#e11d48'
</script>

<style scoped lang="scss">
.sidebar {
  display: flex;
  flex-direction: column;
  background: var(--app-sb-bg);
  border-right: 1px solid var(--app-sb-hover-bg);
  transition: width 0.2s;
  .logo {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 2px;
    background: linear-gradient(90deg, var(--app-logo-from) 0%, var(--app-accent) 50%, var(--app-logo-to) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    .logo-badge {
      flex: none;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 900;
      color: #fff;
      background: linear-gradient(135deg, var(--app-logo-from), var(--app-logo-to));
      -webkit-text-fill-color: #fff;
      box-shadow: 0 3px 8px -2px var(--app-btn-shadow);
    }
  }
  .sidebar-menu {
    border-right: none;
    padding-top: 6px;
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      color: var(--app-sb-text);
      &:hover {
        background: var(--app-sb-hover-bg);
        color: var(--app-sb-hover-text);
      }
    }
    :deep(.el-menu-item.is-active) {
      color: var(--app-sb-active-text);
      font-weight: 600;
      background: var(--app-sb-active-bg);
      position: relative;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 8%;
        height: 84%;
        width: 4px;
        border-radius: 2px;
        background: var(--app-sb-bar);
      }
    }
    :deep(.el-sub-menu .el-menu) {
      background: transparent;
    }
  }
  .collapse-btn {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--app-sb-text);
    cursor: pointer;
    &:hover {
      color: var(--app-sb-hover-text);
      background: var(--app-sb-hover-bg);
    }
  }
}
</style>
