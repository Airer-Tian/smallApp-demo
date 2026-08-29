<template>
  <div class="tabs-bar">
    <el-tag
      v-for="tab in tabsStore.tabs"
      :key="tab.path"
      :closable="tab.closable"
      :effect="tabsStore.active === tab.path ? 'dark' : 'plain'"
      class="tab-item"
      @click="$router.push(tab.path)"
      @close="handleClose(tab.path)"
    >
      {{ tab.title }}
    </el-tag>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/store/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

watch(
  () => route.fullPath,
  () => {
    if (route.meta?.title && route.path !== '/login') {
      tabsStore.addTab({ path: route.path, title: route.meta.title })
    }
  },
  { immediate: true }
)

function handleClose(path) {
  const next = tabsStore.removeTab(path)
  if (route.path === path) router.push(next)
}
</script>

<style scoped lang="scss">
.tabs-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  overflow-x: auto;
  .tab-item {
    cursor: pointer;
    flex-shrink: 0;
  }
}
</style>
