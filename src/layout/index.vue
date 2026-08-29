<template>
  <el-container class="layout">
    <Sidebar />
    <el-container direction="vertical">
      <Header />
      <Tabs />
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import Tabs from './components/Tabs.vue'
</script>

<style scoped lang="scss">
.layout {
  height: 100vh;
}
.main {
  background: #f5f7fa;
  overflow-y: auto;
}
</style>
