<template>
  <div class="page">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-bar">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="部门名称">
          <el-input v-model.trim="query.name" placeholder="部门名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>部门列表</span>
          <el-button v-permission="'sys:dept:add'" type="primary" @click="openAdd()">新增部门</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="rows"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        border
        stripe
      >
        <el-table-column prop="name" label="部门名称" min-width="180" />
        <el-table-column prop="code" label="部门编码" min-width="120" />
        <el-table-column prop="leader" label="负责人" width="120" />
        <el-table-column prop="tel" label="联系电话" width="130" />
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ COMMON_STATUS[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'sys:dept:add'" link type="primary" @click="openAdd(row.id)">新增</el-button>
            <el-button v-permission="'sys:dept:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-permission="'sys:dept:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑部门' : '新增部门'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="deptTree"
            check-strictly
            :render-after-expand="false"
            node-key="id"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择上级部门(不选则为顶级)"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model.trim="form.code" placeholder="请输入部门编码" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model.trim="form.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="tel">
          <el-input v-model.trim="form.tel" maxlength="11" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDeptTree, addDept, updateDept, deleteDept } from '@/api/dept'
import { COMMON_STATUS } from '@/constants/dict'

const loading = ref(false)
const rows = ref([])
const query = reactive({ name: '', status: undefined })

const deptTree = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref()
const editId = ref(null)

const emptyForm = () => ({
  parentId: null,
  name: '',
  code: '',
  sort: 0,
  leader: '',
  tel: '',
  status: 1
})
const form = reactive(emptyForm())

const rules = {
  parentId: [{ required: true, message: '请选择上级部门', trigger: 'change' }],
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }]
}

async function load() {
  loading.value = true
  try {
    const data = await getDeptTree()
    rows.value = filterTree(data || [])
  } finally {
    loading.value = false
  }
}

function filterTree(tree) {
  if (!query.name && (query.status === undefined || query.status === '')) return tree
  return tree.reduce((acc, node) => {
    const childResult = filterTree(node.children || [])
    const nameMatch = !query.name || node.name.includes(query.name)
    const statusMatch = query.status === undefined || query.status === '' || String(node.status) === String(query.status)
    if ((nameMatch && statusMatch) || childResult.length > 0) {
      acc.push({ ...node, children: childResult.length > 0 ? childResult : undefined })
    }
    return acc
  }, [])
}

function resetQuery() {
  query.name = ''
  query.status = undefined
  load()
}

function openAdd(parentId = null) {
  isEdit.value = false
  editId.value = null
  Object.assign(form, emptyForm())
  form.parentId = parentId
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, emptyForm(), {
    parentId: row.parentId,
    name: row.name,
    code: row.code,
    sort: row.sort ?? 0,
    leader: row.leader || '',
    tel: row.tel || '',
    status: row.status
  })
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    const payload = { ...form, parentId: form.parentId || 0 }
    if (isEdit.value) {
      await updateDept(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await addDept(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    load()
    getDeptTree().then((d) => (deptTree.value = d))
  } finally {
    saving.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除部门「${row.name}」？`, '删除确认', { type: 'error' })
    .then(async () => {
      await deleteDept(row.id)
      ElMessage.success('删除成功')
      load()
      getDeptTree().then((d) => (deptTree.value = d))
    })
    .catch((e) => {
      if (e !== 'cancel') ElMessage.error(e?.message || '删除失败')
    })
}

onMounted(() => {
  load()
  getDeptTree().then((d) => (deptTree.value = d))
})
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
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
</style>
