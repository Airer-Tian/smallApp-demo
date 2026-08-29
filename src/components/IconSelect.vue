<template>
  <div class="icon-select">
    <el-popover :visible="visible" placement="bottom-start" :width="480" trigger="click" @update:visible="visible = $event">
      <template #reference>
        <el-input
          :model-value="modelValue"
          readonly
          placeholder="点击选择图标"
          @click="visible = true"
        >
          <template v-if="modelValue" #prefix>
            <el-icon :size="18">
              <component :is="modelValue" />
            </el-icon>
          </template>
        </el-input>
      </template>
      <div class="icon-panel">
        <el-input v-model="keyword" placeholder="搜索图标" clearable class="mb8" />
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane v-for="cat in filteredCategories" :key="cat.name" :label="cat.name" :name="cat.name">
            <div class="icon-grid">
              <div
                v-for="name in cat.icons"
                :key="name"
                class="icon-item"
                :class="{ active: modelValue === name }"
                :title="name"
                @click="select(name)"
              >
                <el-icon :size="20">
                  <component :is="name" />
                </el-icon>
              </div>
            </div>
            <el-empty v-if="cat.icons.length === 0" description="无匹配图标" :image-size="60" />
          </el-tab-pane>
        </el-tabs>
        <div v-if="modelValue" class="mt8" style="text-align: right">
          <el-button link type="danger" @click="select('')">清除</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const keyword = ref('')
const activeTab = ref('方向性图标')

const categories = [
  {
    name: '方向性图标',
    icons: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeftBold', 'ArrowRightBold', 'Top', 'Back', 'Right', 'Bottom', 'DArrowLeft', 'DArrowRight']
  },
  {
    name: '操作类图标',
    icons: ['Search', 'Plus', 'Minus', 'Close', 'Check', 'Setting', 'Edit', 'Delete', 'Refresh', 'Download', 'Upload', 'View', 'Hide', 'Unlock', 'Lock', 'Key', 'Position', 'Link', 'ChatDotRound', 'ChatLineRound']
  },
  {
    name: '媒体类图标',
    icons: ['Microphone', 'VideoCamera', 'Camera', 'Picture', 'Headset', 'AlarmClock', 'Bell', 'ChatDotSquare', 'Message', 'MessageBox']
  },
  {
    name: '商品类图标',
    icons: ['Goods', 'GoodsFilled', 'ShoppingCart', 'ShoppingCartFull', 'Ticket', 'Present', 'Wallet', 'CreditCard', 'Coin', 'Money', 'Discount']
  },
  {
    name: '其他图标',
    icons: ['Menu', 'More', 'MoreFilled', 'Grid', 'Star', 'StarFilled', 'User', 'UserFilled', 'House', 'Document', 'Folder', 'FolderOpened', 'Collection', 'DataLine', 'PieChart', 'TrendCharts']
  }
]

const filteredCategories = computed(() => {
  if (!keyword.value) return categories
  const kw = keyword.value.toLowerCase()
  return categories
    .map(c => ({
      ...c,
      icons: c.icons.filter(i => i.toLowerCase().includes(kw))
    }))
    .filter(c => c.icons.length > 0)
})

function select(name) {
  emit('update:modelValue', name)
  visible.value = false
  keyword.value = ''
}
</script>

<style scoped lang="scss">
.icon-panel {
  max-height: 360px;
  overflow-y: auto;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}
.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
  &.active { background: var(--el-color-primary); color: #fff; }
}
.mb8 { margin-bottom: 8px; }
.mt8 { margin-top: 8px; }
</style>
