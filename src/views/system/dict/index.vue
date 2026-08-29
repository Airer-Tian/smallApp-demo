<template>
  <div class="dict-page">
    <div class="dict-left">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>字典列表</span>
            <el-button v-permission="'sys:dict:add'" type="primary" @click="openAddDict">新增</el-button>
          </div>
        </template>

        <el-table
          v-loading="dictLoading"
          :data="dictRows"
          border
          highlight-current-row
          :row-class-name="({ row }) => row.id === currentDict?.id ? 'current-row' : ''"
          @row-click="handleDictClick"
        >
          <el-table-column prop="name" label="字典名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="code" label="字典编码" min-width="120" show-overflow-tooltip />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '正常' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button v-permission="'sys:dict:edit'" link type="primary" @click.stop="openEditDict(row)">编辑</el-button>
              <el-button v-permission="'sys:dict:delete'" link type="danger" @click.stop="handleDeleteDict(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <Pagination class="pager" :page="dictPage" :total="dictTotal" @change="(p) => Object.assign(dictPage, p) && loadDicts()" />
      </el-card>
    </div>

    <div class="dict-right">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>{{ currentDict ? `字典项 - ${currentDict.name}` : '请选择字典' }}</span>
            <el-button v-permission="'sys:dict:add'" type="primary" :disabled="!currentDict" @click="openAddItem">新增</el-button>
          </div>
        </template>

        <el-table v-loading="itemLoading" :data="itemRows" border stripe>
          <el-table-column prop="name" label="字典项名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="code" label="字典项编码" min-width="120" show-overflow-tooltip />
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '正常' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button v-permission="'sys:dict:edit'" link type="primary" @click="openEditItem(row)">编辑</el-button>
              <el-button v-permission="'sys:dict:delete'" link type="danger" @click="handleDeleteItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <Pagination class="pager" :page="itemPage" :total="itemTotal" @change="(p) => Object.assign(itemPage, p) && loadItems()" />
      </el-card>
    </div>

    <!-- 字典 新增/编辑弹窗 -->
    <el-dialog v-model="dictDialogVisible" :title="isDictEdit ? '编辑字典' : '新增字典'" width="480px" destroy-on-close>
      <el-form ref="dictFormRef" :model="dictForm" :rules="dictRules" label-width="90px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model.trim="dictForm.name" placeholder="如：性别" />
        </el-form-item>
        <el-form-item label="字典编码" prop="code">
          <el-input v-model.trim="dictForm.code" :disabled="isDictEdit" placeholder="如：sys_user_sex" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dictForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="dictForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dictDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dictSaving" @click="handleSaveDict">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字典项 新增/编辑弹窗 -->
    <el-dialog v-model="itemDialogVisible" :title="isItemEdit ? '编辑字典项' : '新增字典项'" width="480px" destroy-on-close>
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model.trim="itemForm.name" placeholder="如：男" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model.trim="itemForm.code" placeholder="如：0" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="itemForm.sort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="itemForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="itemForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="itemSaving" @click="handleSaveItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  pageDicts, addDict, updateDict, deleteDict,
  pageDictItems, addDictItem, updateDictItem, deleteDictItems
} from '@/api/dict'
import Pagination from '@/components/Pagination.vue'

const dictLoading = ref(false)
const dictRows = ref([])
const dictTotal = ref(0)
const dictPage = reactive({ pageNum: 1, pageSize: 10 })
const currentDict = ref(null)

const itemLoading = ref(false)
const itemRows = ref([])
const itemTotal = ref(0)
const itemPage = reactive({ pageNum: 1, pageSize: 10 })

// --- Dict dialog ---
const dictDialogVisible = ref(false)
const isDictEdit = ref(false)
const dictSaving = ref(false)
const dictFormRef = ref()
const dictEditId = ref(null)

const emptyDictForm = () => ({ name: '', code: '', status: 1, remark: '' })
const dictForm = reactive(emptyDictForm())
const dictRules = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入字典编码', trigger: 'blur' }]
}

// --- Item dialog ---
const itemDialogVisible = ref(false)
const isItemEdit = ref(false)
const itemSaving = ref(false)
const itemFormRef = ref()
const itemEditId = ref(null)

const emptyItemForm = () => ({ dictId: null, name: '', code: '', sort: 0, status: 1, remark: '' })
const itemForm = reactive(emptyItemForm())
const itemRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}

// --- Dict CRUD ---
async function loadDicts() {
  dictLoading.value = true
  try {
    const data = await pageDicts({ ...dictPage })
    dictRows.value = data.list || []
    dictTotal.value = data.total || 0
  } finally {
    dictLoading.value = false
  }
}

function openAddDict() {
  isDictEdit.value = false
  dictEditId.value = null
  Object.assign(dictForm, emptyDictForm())
  dictDialogVisible.value = true
}

function openEditDict(row) {
  isDictEdit.value = true
  dictEditId.value = row.id
  Object.assign(dictForm, emptyDictForm(), { name: row.name, code: row.code, status: row.status, remark: row.remark || '' })
  dictDialogVisible.value = true
}

async function handleSaveDict() {
  await dictFormRef.value.validate()
  dictSaving.value = true
  try {
    if (isDictEdit.value) {
      await updateDict(dictEditId.value, { ...dictForm })
      ElMessage.success('修改成功')
    } else {
      await addDict({ ...dictForm })
      ElMessage.success('新增成功')
    }
    dictDialogVisible.value = false
    loadDicts()
  } finally {
    dictSaving.value = false
  }
}

function handleDeleteDict(row) {
  ElMessageBox.confirm(`确认删除字典「${row.name}」及其所有字典项？`, '删除确认', { type: 'error' })
    .then(async () => {
      await deleteDict(row.id)
      ElMessage.success('删除成功')
      if (currentDict.value?.id === row.id) {
        currentDict.value = null
        itemRows.value = []
        itemTotal.value = 0
      }
      loadDicts()
    })
    .catch(() => {})
}

// --- Item CRUD ---
function handleDictClick(row) {
  currentDict.value = row
  itemPage.pageNum = 1
  loadItems()
}

async function loadItems() {
  if (!currentDict.value) return
  itemLoading.value = true
  try {
    const data = await pageDictItems({ ...itemPage, dictId: currentDict.value.id })
    itemRows.value = data.list || []
    itemTotal.value = data.total || 0
  } finally {
    itemLoading.value = false
  }
}

function openAddItem() {
  isItemEdit.value = false
  itemEditId.value = null
  Object.assign(itemForm, emptyItemForm(), { dictId: currentDict.value.id })
  itemDialogVisible.value = true
}

function openEditItem(row) {
  isItemEdit.value = true
  itemEditId.value = row.id
  Object.assign(itemForm, emptyItemForm(), {
    dictId: currentDict.value.id,
    name: row.name,
    code: row.code,
    sort: row.sort,
    status: row.status,
    remark: row.remark || ''
  })
  itemDialogVisible.value = true
}

async function handleSaveItem() {
  await itemFormRef.value.validate()
  itemSaving.value = true
  try {
    if (isItemEdit.value) {
      await updateDictItem(itemEditId.value, { ...itemForm })
      ElMessage.success('修改成功')
    } else {
      await addDictItem({ ...itemForm })
      ElMessage.success('新增成功')
    }
    itemDialogVisible.value = false
    loadItems()
  } finally {
    itemSaving.value = false
  }
}

function handleDeleteItem(row) {
  ElMessageBox.confirm(`确认删除字典项「${row.name}」？`, '删除确认', { type: 'error' })
    .then(async () => {
      await deleteDictItems([row.id])
      ElMessage.success('删除成功')
      loadItems()
    })
    .catch(() => {})
}

onMounted(() => loadDicts())
</script>

<style scoped lang="scss">
.dict-page {
  display: flex;
  gap: 12px;
  height: calc(100vh - 120px);
}
.dict-left {
  width: 420px;
  flex-shrink: 0;
  :deep(.el-card) { height: 100%; }
}
.dict-right {
  flex: 1;
  min-width: 0;
  :deep(.el-card) { height: 100%; }
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pager {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
