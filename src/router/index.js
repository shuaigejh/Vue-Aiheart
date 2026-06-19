import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import BackendLayout from '@/components/BackendLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'

// 管理员端路由配置
const backendRouter = [
  {
    path: '/back',
    redirect: '/back/dashboard',
    component: BackendLayout,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart',
        }
      },
      {
        path: 'knowledge',
        component: () => import('@/views/Knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare',
        }
      },
      {
        path: 'consultation',
        component: () => import('@/views/Consultation.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message',
        }
      },
      {
        path: 'emotional',
        component: () => import('@/views/Emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'User',
        }
      },
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: () => import('@/views/Login.vue'),
        meta: {
          title: '登录',
        }
      },
      {
        path: 'register',
        component: () => import('@/views/Register.vue'),
        meta: {
          title: '注册',
        }
      },
    ]
  },
]
// 用户端路由配置
const frontendRouter = [
  {
    path: '/',
    component: FrontendLayout,
    children:[
      {
        path: '',
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'consultation',
        component: () => import('@/views/frontendConsultation.vue'),
      },
      {
        path: 'emotion-diary',
        component: () => import('@/views/EmotionDiary.vue'),
      },
      {
        path: 'knowledge',
        component: () => import('@/views/frontendKnowledge.vue'),
      },
      {
        path: 'knowledge/article/:id',
        component: () => import('@/views/articleDetail.vue'),
        props: true,
      },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...backendRouter, ...frontendRouter]
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 检查用户是否已登录
  if(token){
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    // 如果已登录，继续导航
    if(userInfo.userType === 2){
      if(to.path.startsWith('/back/dashboard') || to.path.startsWith('/back/knowledge') || to.path.startsWith('/back/consultation') || to.path.startsWith('/back/emotional')){
        next()
      }else{
        next('/back/dashboard')
      }
    }else if(userInfo.userType === 1){
      if(to.path.startsWith('/back') || to.path.startsWith('/auth')){
        next('/')
      }else{
        next()
      }
    }
  }else{
    // 如果未登录，重定向到登录页
    if(to.path.startsWith('/back') || to.path.startsWith('/consultation') || to.path.startsWith('/emotion-diary')){
      next('/auth/login')
    }else{
      next()
    }
  }
})

export default router