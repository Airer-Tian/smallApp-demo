<template>
  <!-- 目录:递归渲染子菜单 -->
  <el-sub-menu v-if="menu.type === 1 && menu.children?.length" :index="String(menu.id)">
    <template #title>
      <el-icon v-if="iconComp" :style="iconColor"><component :is="iconComp" /></el-icon>
      <span>{{ menu.name }}</span>
    </template>
    <MenuItem v-for="child in menu.children" :key="child.id" :menu="child" />
  </el-sub-menu>

  <!-- 菜单页面 -->
  <el-menu-item v-else-if="menu.type === 2 && menu.routePath" :index="menu.routePath">
    <el-icon v-if="iconComp" :style="iconColor"><component :is="iconComp" /></el-icon>
    <template #title>{{ menu.name }}</template>
  </el-menu-item>
</template>

<script setup>
import { computed } from 'vue'
import * as Icons from '@element-plus/icons-vue'

const props = defineProps({
  menu: { type: Object, required: true },
  color: { type: String, default: '' }
})

defineOptions({ name: 'MenuItem' })

const iconComp = computed(() => Icons[props.menu.icon] || null)
const iconColor = computed(() => (props.color ? { color: props.color } : undefined))
</script>
