<template>
  <div class="page">
    <!-- 搜索 -->
    <el-card shadow="never">
      <el-form :model="query" inline class="search-form">
        <el-form-item label="菜单名称">
          <el-input v-model.trim="query.name" placeholder="请输入菜单名称" clearable
                    @keyup.enter="handleSearch" @clear="handleSearch" style="width: 200px" />
        </el-form-item>
        <el-form-item label="路径">
          <el-input v-model.trim="query.routePath" placeholder="请输入路由地址" clearable
                    @keyup.enter="handleSearch" @clear="handleSearch" style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 菜单树形表格(后端返回树,默认折叠,分页按根节点,对齐旧项目) -->
    <el-card shadow="never">
      <el-button v-permission="'sys:menu:add'" type="primary" class="add-btn" @click="openAdd(0)">新增</el-button>

      <el-table ref="tableRef" v-loading="loading" :data="pagedData" row-key="id" border table-layout="fixed"
                :tree-props="{ children: 'children' }" :default-expand-all="false"
                :expand-row-keys="expandedKeys">
        <el-table-column type="index" label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ (page - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="parentId" label="父级菜单" width="90" align="center" />
        <el-table-column label="菜单名称" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="name-cell">
              <el-icon class="name-icon" :class="'icon-' + row.type">
                <component :is="MENU_TYPE_ICON[row.type]" />
              </el-icon>
              <span>{{ row.name }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="菜单类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="MENU_TYPE_TAG[row.type]" effect="plain">{{ MENU_TYPE[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="routeName" label="路由名称" min-width="110" show-overflow-tooltip />
        <el-table-column prop="routePath" label="路由地址" min-width="110" show-overflow-tooltip />
        <el-table-column prop="routeComponent" label="组件路径" min-width="130" show-overflow-tooltip />
        <el-table-column label="显示状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ COMMON_STATUS[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="60" align="center" />
        <el-table-column prop="icon" label="图标" width="90" align="center" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.type !== 3" v-permission="'sys:menu:add'" link type="primary"
                       @click="openAdd(row.id)">新增</el-button>
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button v-permission="'sys:menu:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-permission="'sys:menu:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager-wrap">
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize"
                       :total="total" :page-sizes="[10, 20, 50, 100]"
                       layout="total, sizes, prev, pager, next, jumper" background />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜单' : '新增菜单'" width="620px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">目录</el-radio>
            <el-radio :value="2">页面</el-radio>
            <el-radio :value="3">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentTree"
            check-strictly
            :render-after-expand="false"
            node-key="id"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择上级菜单"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <template v-if="form.type !== 3">
          <el-form-item label="路由名称">
            <el-input v-model.trim="form.routeName" placeholder="路由组件name" />
          </el-form-item>
          <el-form-item label="路由地址">
            <el-input v-model.trim="form.routePath" placeholder="如：/system/user" />
          </el-form-item>
          <el-form-item label="组件路径">
            <el-input v-model.trim="form.routeComponent" placeholder="如：system/user/index">
              <template #prepend>@/views/</template>
              <template #append>.vue</template>
            </el-input>
          </el-form-item>
        </template>
        <el-form-item v-if="form.type === 3" label="权限标识" prop="perm">
          <el-input v-model.trim="form.perm" placeholder="如：sys:user:add" />
        </el-form-item>
        <el-form-item label="显示状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="显示排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="图标">
          <IconSelect v-model="form.icon" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="菜单详情" width="560px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="菜单名称">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="菜单类型">{{ MENU_TYPE[detail.type] }}</el-descriptions-item>
        <el-descriptions-item label="父级菜单">{{ detail.parentId ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="显示状态">{{ COMMON_STATUS[detail.status] }}</el-descriptions-item>
        <el-descriptions-item label="路由名称">{{ detail.routeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="路由地址">{{ detail.routePath || '-' }}</el-descriptions-item>
        <el-descriptions-item label="组件路径" :span="2">{{ detail.routeComponent || '-' }}</el-descriptions-item>
        <el-descriptions-item label="权限标识">{{ detail.perm || '-' }}</el-descriptions-item>
        <el-descriptions-item label="显示排序">{{ detail.sort }}</el-descriptions-item>
        <el-descriptions-item label="图标">{{ detail.icon || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Folder, Document, Pointer } from '@element-plus/icons-vue'
import { getMenuTree, addMenu, updateMenu, deleteMenu } from '@/api/menu'
import { COMMON_STATUS, MENU_TYPE } from '@/constants/dict'
import IconSelect from '@/components/IconSelect.vue'

const MENU_TYPE_TAG = { 1: 'primary', 2: 'success', 3: 'warning' }
const MENU_TYPE_ICON = { 1: Folder, 2: Document, 3: Pointer }

const loading = ref(false)
const tableRef = ref()
const query = reactive({ name: '', routePath: '' })

// 菜单树(后端返回根节点数组,children嵌套) + 前端分页(按根节点,对齐旧项目)
const allData = ref([])       // 全部菜单树根节点
const expandedKeys = ref([])  // 默认折叠,仅展开用户手动点击的行
const page = ref(1)
const pageSize = ref(10)
const total = computed(() => filteredData.value.length)

function nodeMatch(n, kw, rp) {
  if (kw && !(n.name || '').includes(kw)) return false
  if (rp && !(n.routePath || '').includes(rp)) return false
  return true
}
function filterTree(list, kw, rp) {
  const out = []
  ;(list || []).forEach(n => {
    const selfMatch = nodeMatch(n, kw, rp)
    const kids = filterTree(n.children, kw, rp)
    if (selfMatch || kids.length) {
      out.push({ ...n, children: kids.length ? kids : undefined })
    }
  })
  return out
}
const filteredData = computed(() => {
  const kw = query.name.trim()
  const rp = query.routePath.trim()
  if (!kw && !rp) return allData.value
  return filterTree(allData.value, kw, rp)
})
const pagedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref()
const editId = ref(null)

const detailVisible = ref(false)
const detail = ref({})

const emptyForm = () => ({
  type: 1, parentId: 0, name: '', icon: '', routePath: '',
  routeName: '', routeComponent: '', perm: '', sort: 0, status: 1
})
const form = reactive(emptyForm())

const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

/* 上级菜单选择器：直接基于后端返回的菜单树(过滤按钮 type=3) */
const parentTree = computed(() => {
  const prune = (list) =>
    (list || [])
      .filter(i => i.type !== 3)
      .map(i => ({ ...i, children: prune(i.children) }))
  return [{ id: 0, name: '主类目', children: prune(allData.value) }]
})

async function load() {
  loading.value = true
  try {
    allData.value = (await getMenuTree()) || []
  } finally {
    loading.value = false
  }
  await nextTick()
  collapseAll()
}

function collapseAll() {
  const table = tableRef.value
  if (!table) return
  try {
    const walk = (list) => {
      ;(list || []).forEach(n => {
        if (n.children && n.children.length) table.toggleRowExpansion(n, false)
        walk(n.children)
      })
    }
    walk(allData.value)
  } catch (e) {}
}

function handleSearch() {
  page.value = 1
}
function handleReset() {
  query.name = ''
  query.routePath = ''
  page.value = 1
}

function openAdd(parentId) {
  isEdit.value = false
  editId.value = null
  Object.assign(form, emptyForm(), { parentId })
  dialogVisible.value = true
}

function openDetail(row) {
  detail.value = { ...row }
  detailVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, emptyForm(), {
    type: row.type,
    parentId: row.parentId ?? 0,
    name: row.name,
    icon: row.icon || '',
    routePath: row.routePath || '',
    routeName: row.routeName || '',
    routeComponent: row.routeComponent || '',
    perm: row.perm || '',
    sort: row.sort ?? 0,
    status: row.status ?? 1
  })
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    const data = { ...form }
    if (isEdit.value) {
      await updateMenu(editId.value, data)
      ElMessage.success('修改成功')
    } else {
      await addMenu(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除菜单「${row.name}」？`, '删除确认', { type: 'error' })
    .then(async () => {
      await deleteMenu(row.id)
      ElMessage.success('删除成功')
      load()
    })
    .catch(() => {})
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
.search-form {
  margin-bottom: 0;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pager-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
.add-btn {
  margin-bottom: 14px;
}
.name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.name-icon {
  flex: none;
  font-size: 16px;
}
.name-icon.icon-1 { color: #67c23a; }
.name-icon.icon-2 { color: #409eff; }
.name-icon.icon-3 { color: #e6a23c; }
</style>
