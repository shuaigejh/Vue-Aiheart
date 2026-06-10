import request from '@/utils/request'

// 注册接口
export const register = (data = {}) => {
  return request.post('/user/add', data)
}

// 创建新的会话
export const createSession = (data = {}) => {
  return request.post('/psychological-chat/session/start', data)
}

// 分页查询咨询会话
export const getSessionList = (params = {}) => {
  return request.get('/psychological-chat/sessions', { params })
}

// 删除咨询会话
export const deleteSession = (sessionId) => {
  return request.delete(`/psychological-chat/sessions/${sessionId}`)
}

// 获取会话消息列表
export const getSessionMessages = (sessionId) => {
  return request.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

// 获取会话情绪分析结果
export const getSessionEmotion = (sessionId) => {
  return request.get(`/psychological-chat/session/${sessionId}/emotion`)
}

// 创建或更新情绪日记
export const createOrUpdateEmotionDiary = (data = {}) => {
  return request.post('/emotion-diary', data)
}

// 查询知识文章列表
export const getKnowledgeArticleList = (params = {}) => {
  return request.get('/knowledge/article/page', { params })
}

// 获取知识文章详情
export const getKnowledgeArticleDetail = (id) => {
  return request.get(`/knowledge/article/${id}`)
}