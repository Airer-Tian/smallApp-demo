<template>
  <div class="about-page">
    <el-card shadow="never">
      <template #header><span>关于系统</span></template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="系统名称">SmallApp 管理系统</el-descriptions-item>
        <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
        <el-descriptions-item label="前端框架">Vue 3</el-descriptions-item>
        <el-descriptions-item label="UI 框架">Element Plus</el-descriptions-item>
        <el-descriptions-item label="构建工具">Vite</el-descriptions-item>
        <el-descriptions-item label="语言">JavaScript</el-descriptions-item>
        <el-descriptions-item label="状态管理">Pinia</el-descriptions-item>
        <el-descriptions-item label="路由">Vue Router 4</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <template #header><span>项目结构</span></template>
      <pre class="tree">src/
├── api/            # 接口请求
├── assets/         # 静态资源
├── components/     # 公共组件
├── constants/      # 常量定义
├── directives/     # 自定义指令
├── layout/         # 布局组件
├── router/         # 路由配置
├── store/          # Pinia 状态管理
│   ├── auth.js     # 认证状态（token/权限/角色）
│   └── menu.js     # 菜单状态
├── utils/          # 工具函数
│   └── request.js  # Axios 封装
└── views/          # 页面视图
    ├── about/      # 关于
    ├── home/       # 首页
    ├── login/      # 登录
    ├── system/     # 系统管理
    │   ├── dict/   # 字典管理
    │   ├── log/    # 日志管理
    │   ├── menu/   # 菜单管理
    │   └── user/   # 用户管理
    └── userCenter/ # 个人中心</pre>
    </el-card>

    <el-card shadow="never">
      <template #header><span>后端技术栈</span></template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="语言">Java 17</el-descriptions-item>
        <el-descriptions-item label="框架">Spring Boot 3</el-descriptions-item>
        <el-descriptions-item label="ORM">MyBatis-Plus</el-descriptions-item>
        <el-descriptions-item label="数据库">MySQL</el-descriptions-item>
        <el-descriptions-item label="缓存">Redis</el-descriptions-item>
        <el-descriptions-item label="认证">JWT</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.about-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tree {
  margin: 0;
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  overflow-x: auto;
}
</style>
