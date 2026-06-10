import { defineStore } from 'pinia'
import { ref } from 'vue'


// 定义管理员状态管理模块
export const useAdminStore = defineStore('admin', () => {
  // 折叠状态管理
  const isCollapse = ref(false)
  // 切换折叠状态
  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
  }

  return {
    isCollapse,
    toggleCollapse
  }
})
