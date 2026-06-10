// Vercel Serverless Function - API代理
// 将所有 /api/* 请求转发到后端服务器

import axios from 'axios'

// 目标后端服务器地址
const TARGET_BASE_URL = 'http://159.75.169.224:1235'

export default async (req, res) => {
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

  // 检查是否是 SSE 请求
  const acceptHeader = req.headers.accept || ''
  const isSSE = acceptHeader.includes('text/event-stream')

  // 检查是否是图片/文件请求（二进制）
  const isBinary = path.startsWith('/api/files/')

  // 准备请求体
  let body = undefined
  if (req.method !== 'GET' && req.body) {
    if (Buffer.isBuffer(req.body)) {
      body = req.body
    } else if (typeof req.body === 'object') {
      body = req.body
    } else {
      body = req.body
    }
  }

  // GET 请求参数（去掉 path，保留原始查询参数）
  const params = { ...req.query }
  delete params.path

  try {
    if (isSSE) {
      // SSE 流式请求：使用 axios stream 模式透传
      const response = await axios({
        url,
        method: req.method,
        data: body,
        params,
        headers: forwardHeaders,
        timeout: 60000,
        responseType: 'stream'
      })

      // 透传响应头
      res.status(response.status)
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          res.setHeader(key, value)
        }
      })

      // 管道传输流式数据
      response.data.pipe(res)
      return
    }

    if (isBinary) {
      // 二进制请求（图片/文件）：使用 arraybuffer 模式
      const response = await axios({
        url,
        method: req.method,
        data: body,
        params,
        headers: forwardHeaders,
        timeout: 30000,
        responseType: 'arraybuffer'
      })

      res.status(response.status)
      // 透传 content-type 等头
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          res.setHeader(key, value)
        }
      })
      res.send(Buffer.from(response.data, 'binary'))
      return
    }

    // 普通 JSON 请求
    const response = await axios({
      url,
      method: req.method,
      data: body,
      params,
      headers: forwardHeaders,
      timeout: 30000
    })

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
