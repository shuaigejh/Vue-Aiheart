<template>
  <el-form :model="formData" ref="ruleFormRef">
    <el-row :gutter="24">
      <template v-for="item in formItemAttrs" :key="item.prop">
        <el-col v-bind="item.col">
          <el-form-item :label="item.label" :prop="item.prop">
          <component v-model="formData[item.prop]" :is="isComp(item.comp)":placeholder="item.placeholder">
            <template v-if="item.comp === 'select'">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value"></el-option>
            </template>
          </component>
        </el-form-item>
        </el-col>
      </template>
    </el-row>
    <el-row>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button  @click="handleReset(ruleFormRef)">重置</el-button>
    </el-row>
  </el-form>
</template>

<script setup>
import { ref,computed } from 'vue'

// 接收表单配置
const props = defineProps({
  formItem: {
    type: Array,
    default: () => []
  }
})
// 定义事件
const emit = defineEmits(['search'])
// 计算属性
const formItemAttrs = computed(() => {
  const { formItem } = props
  formItem.forEach(item => {
      item.col = { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }
    })
    return formItem
})
// 可以拿到表单实例
const ruleFormRef = ref()
// 表单数据
const formData = ref({})

// 动态判断组件类型
const isComp = (comp) => {
  return {
    input: 'el-input',
    select: 'el-select'
  }[comp]
}
// 查询
const handleSearch = () => {
  emit('search', formData.value)
}
// 重置
const handleReset = (ruleFormRef) => {
  if (!ruleFormRef) {
    return
  }
  ruleFormRef.resetFields()
    handleSearch()
}
</script>
