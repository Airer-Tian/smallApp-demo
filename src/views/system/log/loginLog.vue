<template>
  <div class="page">
    <el-card shadow="never" class="search-bar">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model.trim="query.userName" placeholder="用户名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="IP">
          <el-input v-model.trim="query.ip" placeholder="IP地址" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 110px">
            <el-option label="成功" :value="0" />
            <el-option label="失败" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header"><span>登录日志</span></div>
      </template>

      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="userName" label="用户名" min-width="100" />
        <el-table-column prop="ip" label="登录IP" width="130" />
        <el-table-column prop="browser" label="浏览器" min-width="120" show-overflow-tooltip />
        <el-table-column prop="os" label="操作系统" min-width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? '成功' : '失败' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="msg" label="消息" min-width="160" show-overflow-tooltip />
        <el-table-column prop="loginTime" label="登录时间" width="165" />
      </el-table>

      <Pagination class="pager" :page="page" :total="total" @change="(p) => Object.assign(page, p) && load()" />
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { pageLoginLogs } from '@/api/log'
import Pagination from '@/components/Pagination.vue'

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({ userName: '', ip: '', status: undefined })
const page = reactive({ pageNum: 1, pageSize: 20 })

async function load() {
  loading.value = true
  try {
    const data = await pageLoginLogs({ ...page, ...query })
    rows.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.userName = ''
  query.ip = ''
  query.status = undefined
  page.pageNum = 1
  load()
}

onMounted(() => load())
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-bar {
  :deep(.el-form-item) { margin-bottom: 0; }
}
.pager {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
