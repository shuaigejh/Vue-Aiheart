import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'







const app = createApp(App)
const pinia = createPinia()
// 注册 Element Plus 组件库
app.use(ElementPlus)
// 注册路由
app.use(router)
// 注册所有 Element Plus 图标组件到 Vue 实例
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 注册 Pinia 状态管理
app.use(pinia)
// 挂载应用到 #app 元素
app.mount('#app')
