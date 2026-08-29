<template>
  <div class="page">
    <el-card shadow="never" class="search-bar">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="操作用户">
          <el-input v-model.trim="query.userName" placeholder="用户名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="模块">
          <el-input v-model.trim="query.module" placeholder="模块名称" clearable style="width: 150px" />
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
        <div class="card-header"><span>操作日志</span></div>
      </template>

      <el-table v-loading="loading" :data="rows" border stripe row-key="id">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-box">
              <div v-if="row.requestParam" class="expand-section">
                <span class="expand-label">请求参数：</span>
                <pre class="json-pre">{{ formatJson(row.requestParam) }}</pre>
              </div>
              <div v-if="row.status === 1 && row.errorMsg" class="expand-section">
                <span class="expand-label">错误信息：</span>
                <pre class="json-pre error">{{ row.errorMsg }}</pre>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="操作用户" min-width="100" />
        <el-table-column prop="module" label="模块" min-width="100" show-overflow-tooltip />
        <el-table-column prop="operation" label="操作" min-width="100" show-overflow-tooltip />
        <el-table-column prop="method" label="方法" min-width="160" show-overflow-tooltip />
        <el-table-column prop="requestUrl" label="请求地址" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? '成功' : '失败' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="costMs" label="耗时(ms)" width="90" align="center" />
        <el-table-column prop="operIp" label="操作IP" width="130" show-overflow-tooltip />
        <el-table-column prop="operTime" label="操作时间" width="165" />
      </el-table>

      <Pagination class="pager" :page="page" :total="total" @change="(p) => Object.assign(page, p) && load()" />
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { pageOperLogs } from '@/api/log'
import Pagination from '@/components/Pagination.vue'

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({ userName: '', module: '', status: undefined })
const page = reactive({ pageNum: 1, pageSize: 20 })

async function load() {
  loading.value = true
  try {
    const data = await pageOperLogs({ ...page, ...query })
    rows.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.userName = ''
  query.module = ''
  query.status = undefined
  page.pageNum = 1
  load()
}

function formatJson(str) {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
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
.expand-box {
  padding: 12px 20px;
}
.expand-section {
  margin-bottom: 8px;
}
.expand-label {
  font-weight: 600;
  color: #606266;
}
.json-pre {
  margin: 4px 0 0;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow: auto;
  &.error { color: #f56c6c; background: #fef0f0; }
}
</style>
