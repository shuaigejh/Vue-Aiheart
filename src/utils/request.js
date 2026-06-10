import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: '/api',  // 基础URL，Vercel代理和本地开发都用/api
  timeout: 30000     // 超时时间
})


// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const {data, config} = response
    // 处理业务状态码
    if (data.code === "200") {
      return data.data
    }else {
      if(data.code === "-1"){
        if(!config.url?.includes('/login')){
          ElMessage.error(data.msg || '登录过期，请重新登录')
          // 清除token和userInfo
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/auth/login'
        }else{
          ElMessage.error(data.msg || '网络请求失败')
          return Promise.reject("网络请求失败")
        }
      }
    }
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

export default service
