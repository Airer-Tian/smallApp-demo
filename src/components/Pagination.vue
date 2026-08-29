<template>
  <el-pagination
    :current-page="page.pageNum"
    :page-size="page.pageSize"
    :total="total"
    :page-sizes="[10, 20, 50]"
    layout="total, sizes, prev, pager, next, jumper"
    background
    @current-change="(p) => emit('change', { ...page, pageNum: p })"
    @size-change="(s) => emit('change', { ...page, pageSize: s, pageNum: 1 })"
  />
</template>

<script setup>
defineProps({ page: Object, total: Number })
const emit = defineEmits(['change'])
</script>
