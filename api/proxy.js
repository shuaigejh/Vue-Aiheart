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

  // 提取原始请求路径
  // Vercel rewrite: /api/knowledge/article/page -> /api/proxy/knowledge/article/page
  // 需要提取出 /knowledge/article/page，然后前面加回 /api
  const rawPath = req.url.replace('/api/proxy', '').split('?')[0] || '/'
  const path = '/api' + rawPath
  const url = `${TARGET_BASE_URL}${path}`

  // 透传请求头
  const forwardHeaders = {}
  if (req.headers.token) {
    forwardHeaders.token = req.headers.token
  }
  if (req.headers['content-type']) {
    forwardHeaders['Content-Type'] = req.headers['content-type']
  }

  // GET 请求参数（Vercel 自动解析 query string 到 req.query）
  const params = req.method === 'GET' ? { ...req.query } : undefined

  try {
    const response = await axios({
      url,
      method: req.method,
      data: req.method !== 'GET' ? req.body : undefined,
      params,
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
