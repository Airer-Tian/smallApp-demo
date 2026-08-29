<template>
  <div class="page">
    <el-card shadow="never" class="search-bar">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="角色名称">
          <el-input v-model.trim="query.name" placeholder="角色名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button v-permission="'sys:role:add'" type="primary" @click="openAdd">新增角色</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ COMMON_STATUS[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="165" />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'sys:role:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-permission="'sys:role:assign'" link type="warning" @click="openAssign(row)">授权</el-button>
            <el-button v-permission="'sys:role:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination class="pager" :page="page" :total="total" @change="(p) => Object.assign(page, p) && load()" />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>

    <!-- 授权弹窗 -->
    <el-dialog v-model="assignVisible" title="分配菜单权限" width="480px" destroy-on-close>
      <el-tree
        ref="treeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        :default-expand-all="true"
      />
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignSaving" @click="handleAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageRoles, addRole, updateRole, deleteRoles, getRoleMenus, assignRoleMenus } from '@/api/role'
import { getMenuTree } from '@/api/menu'
import Pagination from '@/components/Pagination.vue'
import { COMMON_STATUS } from '@/constants/dict'

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({ name: '' })
const page = reactive({ pageNum: 1, pageSize: 10 })

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref()
const editId = ref(null)

const assignVisible = ref(false)
const assignSaving = ref(false)
const treeRef = ref()
const menuTree = ref([])
const assignRoleId = ref(null)

const emptyForm = () => ({ name: '', status: 1, remark: '' })
const form = reactive(emptyForm())

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

function getLeafIds(tree, leafSet = new Set()) {
  for (const node of tree) {
    if (node.children && node.children.length) {
      getLeafIds(node.children, leafSet)
    } else {
      leafSet.add(node.id)
    }
  }
  return leafSet
}

async function load() {
  loading.value = true
  try {
    const data = await pageRoles({ ...page, ...query })
    rows.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.name = ''
  page.pageNum = 1
  load()
}

function openAdd() {
  isEdit.value = false
  editId.value = null
  Object.assign(form, emptyForm())
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, emptyForm(), {
    name: row.name,
    status: row.status,
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    if (isEdit.value) {
      await updateRole(editId.value, { ...form })
      ElMessage.success('修改成功')
    } else {
      await addRole({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除角色「${row.name}」？`, '删除确认', { type: 'error' })
    .then(async () => {
      await deleteRoles([row.id])
      ElMessage.success('删除成功')
      load()
    })
    .catch(() => {})
}

async function openAssign(row) {
  assignRoleId.value = row.id
  if (!menuTree.value.length) {
    menuTree.value = await getMenuTree()
  }
  assignVisible.value = true
  await nextTick()
  const tree = treeRef.value
  tree.setCheckedKeys([])
  const checkedIds = await getRoleMenus(row.id)
  const leafSet = getLeafIds(menuTree.value)
  const leafCheckedIds = checkedIds.filter((id) => leafSet.has(id))
  tree.setCheckedKeys(leafCheckedIds)
}

async function handleAssign() {
  const tree = treeRef.value
  const checkedKeys = tree.getCheckedKeys()
  const halfCheckedKeys = tree.getHalfCheckedKeys()
  const menuIds = [...new Set([...checkedKeys, ...halfCheckedKeys])]
  assignSaving.value = true
  try {
    await assignRoleMenus(assignRoleId.value, menuIds)
    ElMessage.success('授权成功')
    assignVisible.value = false
  } finally {
    assignSaving.value = false
  }
}

onMounted(() => {
  load()
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
.pager {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
