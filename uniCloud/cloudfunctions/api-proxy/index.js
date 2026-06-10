const axios = require('axios')

// 目标后端服务器地址
const TARGET_BASE_URL = 'http://159.75.169.224:1235'

exports.main = async (event, context) => {
  const { 
    path = '',           // 请求路径，例如 /user/login
    method = 'GET',      // 请求方法
    data = {},           // 请求体数据
    params = {},         // URL 查询参数
    headers = {}         // 自定义请求头
  } = event

  // 构建完整 URL
  const url = `${TARGET_BASE_URL}${path}`

  // 提取需要透传的头（token 等）
  const forwardHeaders = {}
  if (headers.token) {
    forwardHeaders.token = headers.token
  }
  if (headers['content-type']) {
    forwardHeaders['Content-Type'] = headers['content-type']
  }

  try {
    const response = await axios({
      url,
      method: method.toUpperCase(),
      data: method.toUpperCase() !== 'GET' ? data : undefined,
      params: method.toUpperCase() === 'GET' ? params : undefined,
      headers: forwardHeaders,
      timeout: 30000,
      // 允许接收流式响应（SSE）
      responseType: headers.accept === 'text/event-stream' ? 'stream' : 'json'
    })

    // 如果是流式响应，直接返回原始数据
    if (headers.accept === 'text/event-stream') {
      return {
        statusCode: response.status,
        headers: response.headers,
        data: response.data
      }
    }

    return {
      statusCode: response.status,
      data: response.data
    }
  } catch (error) {
    console.error('代理请求失败:', error.message)
    
    if (error.response) {
      return {
        statusCode: error.response.status,
        data: error.response.data
      }
    }
    
    return {
      statusCode: 500,
      data: {
        code: '-1',
        msg: '代理请求失败: ' + error.message
      }
    }
  }
}
