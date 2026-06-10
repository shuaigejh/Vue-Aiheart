<template>
  <div class="container">
    <div class="title">
      <div class="back-home">
        <router-link to="/"><el-icon><Back /></el-icon>
        <span>返回首页</span></router-link>
      </div>
      <div class="title-text">
        <h2>登录</h2>
        <p>请输入您的信息</p>
      </div>
    </div>
    <div class="form-container">
      <el-form
        :model="formData"
        :rules="rules"
        ref="ruleformRef"
        label-position="top"
      >
        <el-form-item label="用户名或邮箱" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名或邮箱" size="large" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" placeholder="请输入密码" type="password" size="large" show-password />
        </el-form-item>
          <el-button class="btn" type="primary" size="large" @click="submitForm(ruleformRef)">登录</el-button>
      </el-form>
      <div class="footer">
        <p>还没有账号？<router-link to="/auth/register" type="primary" size="medium"> 去注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '@/api/admin'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

// 获取路由实例
const router = useRouter()

// 获取登录表单实例
const ruleformRef = ref()

// 登录表单数据
const formData = ref({
  username: '',
  password: ''
})
// 登录表单验证规则
const rules = ref({
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})



// 登录提交
const submitForm = async (formRef) => {
  if (!formRef) return

  await formRef.validate((valid) => {
    if (valid) {
      login(formData.value).then(res => {
        if (!res.token) {
          return console.error("登录失败")
        }
        ElMessage.success('登录成功')
        localStorage.setItem('token', res.token)
        localStorage.setItem('userInfo', JSON.stringify(res.userInfo))
        // 根据用户类型跳转不同页面
        if(res.userInfo.userType === 2){
          router.push('/back/dashboard')
        }else{
          router.push('/')
        }
      })
    }
  })
}
</script>



<style lang="scss" scoped>
.container {
   width: 384px;
   .title {
    .back-home {
      margin-bottom: 50px;
      a {
    color: rgb(79, 94, 13);
    &:hover {
      color: #e43939;
    }
  }
    }
    .title-text {
      text-align: center;
      h2 {
        font-size: 36px;
        margin-bottom: 10px;
      }
      p {
        font-size: 18px;
        color: #6b7280;
      }
    }
   }
   .form-container {
    margin-top: 40px;
    .btn {
      margin-top: 30px;
      width: 100%;
    }
    .footer {
      padding: 30px;
      text-align: center;
      a:hover {
        text-decoration: underline;
      }
    }
   }
}

</style>
