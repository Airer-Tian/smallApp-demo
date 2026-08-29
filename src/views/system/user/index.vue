<template>
  <div class="page">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-bar">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model.trim="query.userName" placeholder="用户名" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model.trim="query.nickName" placeholder="昵称" clearable style="width: 160px" />
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
          <span>用户列表</span>
          <el-button v-permission="'sys:user:add'" type="primary" @click="openAdd">新增用户</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="userName" label="用户名" min-width="100" />
        <el-table-column prop="nickName" label="昵称" min-width="100" />
        <el-table-column label="性别" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.sex === 1 ? 'danger' : 'primary'" effect="plain">{{ USER_SEX[row.sex] ?? '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="140">
          <template #default="{ row }">
            <el-tag v-for="r in row.roles" :key="r.id" size="small" class="mr4">{{ r.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="部门" min-width="150">
          <template #default="{ row }">
            <el-tag v-for="d in row.depts" :key="d.id" size="small" type="warning" effect="plain" class="mr4">{{ d.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tel" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ COMMON_STATUS[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="165" />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'sys:user:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-permission="'sys:user:resetPwd'" link type="warning" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button v-permission="'sys:user:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination class="pager" :page="page" :total="total" @change="(p) => Object.assign(page, p) && load()" />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model.trim="form.userName" :disabled="isEdit" placeholder="登录账号" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model.trim="form.nickName" placeholder="显示名称" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :value="0">男</el-radio>
            <el-radio :value="1">女</el-radio>
            <el-radio :value="2">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model.trim="form.tel" maxlength="11" />
        </el-form-item>
        <el-form-item label="座机">
          <el-input v-model.trim="form.cell" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model.trim="form.email" />
        </el-form-item>
        <el-form-item label="岗位ID">
          <el-input-number v-model="form.postId" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleIds" multiple placeholder="选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-tree-select
            v-model="form.deptIds"
            :data="deptTree"
            multiple
            check-strictly
            :render-after-expand="false"
            node-key="id"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择所属部门(可多选)"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
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
import { reactive, ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageUsers, getUserDetail, addUser, updateUser, deleteUsers, resetPassword } from '@/api/user'
import { listSimpleRoles } from '@/api/role'
import { getDeptTree } from '@/api/dept'
import Pagination from '@/components/Pagination.vue'
import { USER_SEX, COMMON_STATUS } from '@/constants/dict'

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({ userName: '', nickName: '', status: undefined })
const page = reactive({ pageNum: 1, pageSize: 10 })

const roleOptions = ref([])
const deptTree = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref()
const editId = ref(null)

const emptyForm = () => ({
  userName: '', nickName: '', sex: 0, tel: '', cell: '', email: '',
  postId: undefined, remark: '', roleIds: [], deptIds: []
})
const form = reactive(emptyForm())

const rules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

async function load() {
  loading.value = true
  try {
    const data = await pageUsers({ ...page, ...query })
    rows.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.userName = ''
  query.nickName = ''
  query.status = undefined
  page.pageNum = 1
  load()
}

function openAdd() {
  isEdit.value = false
  editId.value = null
  Object.assign(form, emptyForm())
  dialogVisible.value = true
}

async function openEdit(row) {
  isEdit.value = true
  editId.value = row.id
  const detail = await getUserDetail(row.id)
  await nextTick()
  Object.assign(form, emptyForm(), {
    userName: detail.userName,
    nickName: detail.nickName,
    sex: detail.sex,
    tel: detail.tel || '',
    cell: detail.cell || '',
    email: detail.email || '',
    postId: detail.postId,
    remark: detail.remark || '',
    roleIds: detail.roleIds || [],
    deptIds: detail.deptIds || []
  })
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    if (isEdit.value) {
      await updateUser(editId.value, { ...form })
      ElMessage.success('修改成功')
    } else {
      await addUser({ ...form })
      ElMessage.success('新增成功，默认密码 Abc@12345')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

function handleResetPwd(row) {
  ElMessageBox.confirm(`确认将用户「${row.userName}」的密码重置为默认密码 Abc@12345？`, '重置密码', { type: 'warning' })
    .then(async () => {
      await resetPassword(row.id)
      ElMessage.success('重置成功，新密码 Abc@12345')
    })
    .catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除用户「${row.userName}」？`, '删除确认', { type: 'error' })
    .then(async () => {
      await deleteUsers([row.id])
      ElMessage.success('删除成功')
      load()
    })
    .catch(() => {})
}

onMounted(async () => {
  load()
  listSimpleRoles().then((d) => (roleOptions.value = d))
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
.pager {
  margin-top: 12px;
  justify-content: flex-end;
}
.mr4 {
  margin-right: 4px;
}
</style>
