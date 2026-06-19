<template>
  <div class="frontend-layout">
    <div class="navbar-container">
      <div class="brand-section">
        <el-image :src="iconUrl" class="brand-logo" style="height: 50px; width: 50px;" />
        <h1 class="brand-name">恒星AI心理健康助手</h1>
      </div>
      <div class="nav-section">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/consultation" class="nav-link" v-if="isLoggedIn">AI咨询</router-link>
        <router-link to="/emotion-diary" class="nav-link" v-if="isLoggedIn">情绪日记</router-link>
        <router-link to="/knowledge" class="nav-link">知识库</router-link>
        <el-button type="danger" class="logout-btn" v-if="isLoggedIn" @click="handleLogout">退出登录</el-button>
        <template v-else>
          <router-link to="/auth/login" class="nav-link">登录</router-link>
          <router-link to="/auth/register" class="nav-link">
            <el-button type="primary">注册</el-button>
          </router-link>
        </template>
      </div>
    </div>
    <div class="main-content">
      <router-view></router-view>
    </div>
    <div class="footer-container">
      <div class="footer-bottom">
        <p>&copy; 恒星 2026 心理健康AI助手</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter }  from 'vue-router'
import { logout } from '@/api/admin.js'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()


// 引入机器人图标
const iconUrl = new URL('@/assets/images/机器人.png', import.meta.url).href

// 登录状态
const isLoggedIn = ref(false)

onMounted(() => {
  // 检查是否有token
   isLoggedIn.value = localStorage.getItem('token') !== null
  
})

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    logout().then(() => {
      ElMessage.success('已退出')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/auth/login')
    })
  }).catch(() => {
    ElMessage.warning('取消退出')
  })
}



</script>







<style lang="scss" scoped>
.frontend-layout {
  background-color: #fff;

  .navbar-container {
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .brand-section {
      display: flex;
      align-items: center;

      .brand-name {
        margin-left: 10px;
        font-size: 24px;
        font-weight: 600;
        color: #333;
      }
    }

    .nav-section {
      display: flex;
      align-items: center;
      gap: 40px;

      .nav-link {
        color: #4b5563;
        font-size: 16px;
        font-weight: 500;

        &:hover {
          color: #4A90E2;
        }
      }
    }
  }

  .footer-container {
    background: #1f2937;
    color: white;
    padding: 15px 0;
    margin-top: auto;

    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 10px;
      text-align: center;
    }
  }
}
</style>
