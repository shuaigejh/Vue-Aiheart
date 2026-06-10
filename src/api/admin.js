import request from '@/utils/request'


// 登录接口
export const login = (data = {}) => {
  return request.post('/user/login', data)
}

// 获取分类接口
export const categoryTree = (data = {}) => {
  return request.get('/knowledge/category/tree', data)
}

// 获取文章列表接口
export const articlePage = (params = {}) => {
  return request.get('/knowledge/article/page', {params})
}

// 图片文件上传接口
export const uploadFile = (file, businessInfo) =>{
  const formData = new FormData()
  formData.append('file', file)
  formData.append('businessType', 'ARTICLE')
  formData.append('businessId', businessInfo.businessId)
  formData.append('businessField', 'cover')
  return request.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 新增知识文章接口
export const createArticle = (data = {}) => {
  return request.post('/knowledge/article', data)
}

// 更新知识文章接口
export const updateArticle = (id, data = {}) => {
  return request.put(`/knowledge/article/${id}`, data)
}

// 获取知识文章详情接口
export const articleDetail = (id) => {
  return request.get(`/knowledge/article/${id}`)
}

// 更新文章状态接口
export const updateArticleStatus = (id, data = {}) => {
  return request.put(`/knowledge/article/${id}/status`, data)
}

// 删除知识文章接口
export const deleteArticle = (id) => {
  return request.delete(`/knowledge/article/${id}`)
}

// 分页查询咨询会话接口
export const consultationPage = (params = {}) => {
  return request.get('/psychological-chat/sessions', {params})
}

// 获取咨询会话详情接口
export const consultationDetail = (sessionId) => {
  return request.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

// 分页查询情绪日志接口
export const emotionalPage = (params = {}) => {
  return request.get('/emotion-diary/admin/page', {params})
}

// 删除情绪日志接口
export const deleteEmotional = (id) => {
  return request.delete(`/emotion-diary/admin/${id}`)
}

// 获取综合数据分析接口
export const getDashboardData = () => {
  return request.get('/data-analytics/overview')
}

// 用户退出登录接口
export const logout = () => {
  return request.post('/user/logout')
}