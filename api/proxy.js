// Vercel Serverless Function - API代理
// 将所有 /api/* 请求转发到后端服务器

const axios = require('axios')

// 目标后端服务器地址
const TARGET_BASE_URL = 'http://159.75.169.224:1235'

module.exports = async (req, res) => {
  // 设置CORS响应头，允许所有来源访问
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, token')

  // 处理预检请求（OPTIONS）
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 从 query 中获取原始请求路径，并加回 /api 前缀
  const originalPath = req.query.path || '/'
  const path = '/api' + originalPath
  const url = `${TARGET_BASE_URL}${path}`

  // 透传请求头
  const forwardHeaders = {}
  if (req.headers.token) {
    forwardHeaders.token = req.headers.token
  }
  if (req.headers['content-type']) {
    forwardHeaders['Content-Type'] = req.headers['content-type']
  }

  // GET 请求参数（去掉 path，保留原始查询参数）
  const params = { ...req.query }
  delete params.path

  try {
    const response = await axios({
      url,
      method: req.method,
      data: req.method !== 'GET' ? req.body : undefined,
      params: req.method === 'GET' ? params : undefined,
      headers: forwardHeaders,
      timeout: 30000
    })

    // 返回后端响应
    res.status(response.status).json(response.data)
  } catch (error) {
    console.error('代理请求失败:', error.message)

    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({
        code: '-1',
        msg: '代理请求失败: ' + error.message
      })
    }
  }
}
