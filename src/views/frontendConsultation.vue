<template>
  <div class="consultation-container">
    <div class="sidebar">
      <!-- AI助手信息 -->
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <el-image :src="robotUrl" alt="AI助手" style="width: 25px; height: 25px;" />
        </div>
        <h3 class="assistant-name">恒星AI助手</h3>
        <div class="online-status">
          <div class="status-dot"></div>
          <span>已连接</span>
        </div>
      </div>
      <!-- 情绪花园 -->
      <div class="emotion-garden">
        <div class="garden-header">
          <div class="garden-title">情绪花园</div>
        </div>
        <div :class="currentEmotion.emotionScore >50 || currentEmotion.emotionScore < 31 ? 'emotion-info2' : 'emotion-info'">
          <div class="emotion-name">{{ currentEmotion.primaryEmotion === 'neutral' ? '中性' : currentEmotion.primaryEmotion }}</div>
          <div class="emotion-score">{{ currentEmotion.emotionScore || 50 }}</div>
        </div>
        <div class="warm-tips">
          <div class="emotion-status-text">
            <span class="status-label">今日状态</span>
            <span class="status-emotion">{{ currentEmotion.isNegative ? '需要关注' : '很不错哦' }}</span>
          </div>
          <div class="emotion-intensity">
            <span class="intensity-dots">
              <span v-for="i in 3" :key="i" class="dot" :class="{'active': getIntensityClass(currentEmotion.emotionScore) >= i}"></span>
            </span>
            <span class="intensity-text">{{ getRiskText(currentEmotion.riskLevel) }}</span>
          </div>
          <!-- ai建议卡片 -->
          <div class="warm-suggestion">
            <div class="suggestion-icon" >
              <el-image :src="heartUrl" alt="heart" style="width: 35px; height: 35px; margin-right: 5px;" />
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">小暖给你的一个小建议</div>
              <div class="suggestion-text">{{ currentEmotion.suggestion }}</div>
            </div>
          </div>
          <!-- 治愈小行动 -->
          <div class="healing-actions" v-if="currentEmotion.improvementSuggestions?.length > 0">
            <div class="actions-title">治愈小行动</div>
            <div class="actions-list">
              <div v-for="action in currentEmotion.improvementSuggestions" :key="action" class="action-item">
                <div class="action-icon">
                  <el-image :src="actionIcon" alt="action" style="width: 30px; height: 30px; " />
                </div>
                <div class="action-text">{{ action }}</div>
              </div>
            </div>
          </div>
          <!-- 风险提示 -->
          <div class="risk-notice" v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1">
            <div class="notice-icon">
              <el-image :src="warningIcon" alt="warning" style="width: 35px; height: 35px; margin-right: 5px;" />
            </div>
            <div class="notice-content">
              <div class="notice-title">风险提示！</div>
              <div class="notice-text">
                {{ currentEmotion.riskDescription }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 会话历史列表 -->
      <div class="session-history">
        <h4 class="section-title">会话历史</h4>
        <div class="session-list">
          <div v-for="item in sessionList" :key="item.id" @click="handleSessionClick(item)" class="session-item">
            <div class="session-info">
              <div class="session-title">
                <span>{{ item.sessionTitle }}</span>
                <div class="session-meta">
                  <span class="session-time">{{ item.startedAt ? item.startedAt : '刚创建' }}</span>
                </div>
                <div class="session-preview">{{ item.lastMessageContent }}</div>
                <div class="session-stats">
                  <span>
                    <el-icon><ChatRound /></el-icon>
                    {{ item.messageCount || 0 }}
                  </span>
                  <span>
                    <el-icon><Clock /></el-icon>
                    {{ item.durationMinutes || 0 }}分钟前
                  </span>
                </div>
              </div>
              <div class="session-actions">
                <el-button text type="danger" size="mini" @click="handleDelete(item.id)"><el-icon><DeleteFilled /></el-icon></el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-main" v-loading="loading">
      <!-- 对话顶栏 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <el-image :src="likeUrl" alt="AI助手" style="width: 30px; height: 30px;" />
          </div>
          <div class="chat-info">
            <h2>恒星AI助手</h2>
            <p>您贴心的AI心理健康助手</p>
          </div>
        </div>
        <el-button circle @click="createNewChat" title="创建新对话"><el-icon><Plus /></el-icon></el-button> 
      </div>
      <!-- 对话内容区 -->
      <div class="chat-messages">
        <!-- 无历史消息，显示欢迎用语 -->
        <div class="message-item ai-message" v-if="messages.length === 0">
          <div class="message-avatar">
            <el-image :src="robotUrl" alt="AI助手" style="width: 18px; height: 18px;" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>您好!我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。请告诉我，今天您感觉怎么样?有什么想要分享的吗?</p>
            </div>
            <div class="message-time">
              刚刚
            </div>
          </div>
        </div>
        <!-- 显示对话消息 -->
        <div v-for="msg in messages" :key="msg.id" class="message-item" :class="msg.senderType === 1 ? 'user-message' : 'ai-message'">
          <div class="message-avatar">
            <el-image v-if="msg.senderType === 1" :src="userUrl" alt="用户" style="width: 18px; height: 18px;" />
            <el-image v-if="msg.senderType === 2" :src="robotUrl" alt="AI助手" style="width: 18px; height: 18px;" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <!-- ai助手正在思考中，还没返回消息 -->
              <div v-if="msg.senderType === 2 && isAiTyping && !msg.content" class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
                <!-- ai错误提示 -->
              <div v-else-if="msg.isError" class="err-message">
                {{ msg.content }}
              </div>
                <!-- ai助手正常回复 -->
                <MarkdownRenderer v-else-if="msg.senderType === 2 && !msg.isError" :content="msg.content" :is-ai-message="true" />
                <!-- 用户消息 -->
                <p v-else-if="msg.senderType === 1 && msg.content" v-html="formatMarkdown(msg.content)"></p>
            </div>
            <div class="message-time">
              {{ msg.senderType ===2 && isAiTyping ? '正在思考中...' : msg.createdAt }}
            </div>
          </div>
        </div>
      </div>
      <!-- 消息框输入区 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input
           class="message-input"
           v-model="userMessage" 
           placeholder="尽情与我倾诉您的一切委屈...." 
           type="textarea"
           :rows="3"
           :disabled="isAiTyping"
           @keyup.enter="handleKeyDown"
           clearable
           >
          </el-input>
          <div class="input-footer">
            <span> Enter可发送，Shift+Enter换行</span>
            <span>{{ userMessage.length }} / 500</span>
          </div>
        </div>
        <el-button :disabled="userMessage.length > 500" class="send-btn" type="primary" @click="sendMessage">
          <el-icon><Promotion /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ChatRound, Promotion } from '@element-plus/icons-vue'
import { createSession, getSessionList, deleteSession, getSessionMessages, getSessionEmotion } from '@/api/frontend'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'

// 引入五张小图片
const robotUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
const likeUrl = new URL('@/assets/images/like.png', import.meta.url).href
const userUrl = new URL('@/assets/images/users.png', import.meta.url).href
const heartUrl = new URL('@/assets/爱心.svg', import.meta.url).href
const actionIcon = new URL('@/assets/星星.svg', import.meta.url).href
const warningIcon = new URL('@/assets/悲伤.svg', import.meta.url).href

// 创建临时对话
const createNewChat = () => {
  // 创建临时会话对象
  const newSession = {
    sessionId: `temp_${Date.now()}`,
    status: 'TEMP',
    sessionTitle: '新对话',
  }
  currentSession.value = newSession
}


// 定义当前是哪个会话
const currentSession = ref(null)
// 定义历史会话列表
const sessionList = ref([])
// 定义对话页面消息展示
const messages = ref([])
// 定义用户输入的消息
const userMessage = ref('')
// 定义AI助手是否正在处理用户消息
const isAiTyping = ref(false)
// 情绪花园
const currentEmotion = ref({
  primaryEmotion: '中性',
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  suggestion: '情绪状态保持平稳',
  improvementSuggestions: [],
})

const loadSessionEmotion = (sessionId) =>{
  // 确保sessionId格式正确
  const id = sessionId.toString().startsWith('session_') ? sessionId : `session_${sessionId}`
  // 调用API获取会话情绪分析结果
  getSessionEmotion(id).then(res => {
      console.log(res)
      currentEmotion.value = {
        improvementSuggestions: [],
        suggestion: '情绪状态保持平稳',
        ...res
      }
  })
}

// 计算情绪小圆点强度等级
const getIntensityClass = (i) => {
  if(i >=67){
    return 3
  }
  if(i >=31){
    return 2
  }
  return 1
}

// 计算情绪风险等级文本
const getRiskText = (level) => {
  switch(level){
    case 3:
      return '情况危机'
    case 2:
      return '轻微预警'
    case 1:
      return '需要关注'
    case 0:
      return '情绪稳定'
    default:
      return '正常'
  }
}


// 处理用户按下Enter键事件
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    // 阻止默认换行行为
    e.preventDefault()
    // 处理用户按下Enter键事件
    sendMessage()
  }
}

//用户发送消息
const sendMessage =()=>{
  // 检查用户是否输入为空
  if(!userMessage.value.trim()) return
  // 检查ai是否在输入中
  if(isAiTyping.value){
    ElMessage.warning('小暖正在思考中,请稍后')
    return
  }
  // 存储用户输入的消息
  const message = userMessage.value.trim()
  // 清空用户输入框
  userMessage.value = ''
  // 如果没有会话或者是临时会话，创建正式的新对话
  if(currentSession.value.status === 'TEMP'){
    startNewSession(message)
  }else{
    // 如果有会话，继续现有对话
    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createAt: new Date().toISOString(),
    })
    // 开始流式对话
    startAiResponse(currentSession.value.sessionId, message)
  }


} 
//创建一个正式的新对话
const startNewSession = (message) => {
  // 构建会话参数
  const sessionParams = {
    initialMessage: message,
  }
  // 判断是传递历史标题还是新标题
  if(currentSession.value.sessionTitle === '新对话'){
    // 如果是新对话，使用当前时间作为标题
    sessionParams.sessionTitle = `恒星AI助手-${new Date().toLocaleString()}`
  }else{
    // 如果是历史标题，直接使用历史标题
    sessionParams.sessionTitle = currentSession.value.sessionTitle
  }

  // 调用创建正式的新会话接口
  createSession(sessionParams).then(res => {
    // 处理返回的会话对象
    console.log(res)
    // 创建正式会话的对象
    const sessionData = {
      sessionId: res.sessionId,
      status: res.status,
      sessionTitle: sessionParams.sessionTitle,
    }
    // 如果当前是临时会话页面，更新覆盖当前会话
    if(currentSession.value && currentSession.value.status === 'TEMP'){
      // 更新为正式会话
      Object.assign(currentSession.value, sessionData)
    }else{
      // 如果不是临时会话页面，直接创建正式会话
      currentSession.value = sessionData
    }
    // 更新会话历史列表
    getSessionPage()

    // 渲染用户消息到页面
    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createAt: new Date().toISOString(),
    })

    // 开始流式对话
    startAiResponse(currentSession.value.sessionId, message)
  })
}

// 流式对话
const startAiResponse = (sessionId, userMessage) => {
  // 防止重复发送
  if(isAiTyping.value) {
    ElMessage.warning('小暖正在思考中,请稍后')
    return
  }
  // 开启ai助手思考状态
  isAiTyping.value = true
  // 定义ai助手回复的对象
  const aiMessage = {
    id: `ai_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
    senderType: 2,
    content: '',
    createAt: new Date().toISOString(),
  }
  // 渲染ai助手回复
  messages.value.push(aiMessage)

  // 调用流式对话接口
  // 创建停止对话流的函数
  const ctrl = new AbortController()
  fetchEventSource(`/api/psychological-chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': localStorage.getItem('token'),
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ 
      sessionId,
      userMessage,
    }),
    // 控制流式数据的停止和继续
    signal: ctrl.signal,
    // 监听是否返回流式数据
    onopen: (res) => {
      console.log(res)
      if(res.headers.get('Content-Type') !== 'text/event-stream'){
        ElMessage.error('服务器返回非流式数据')
      }
    },
    // 成功返回的流式数据
    onmessage: (event) => {
      const raw = event.data.trim()
      if(!raw) return
      // ai回复状态在输出还是结束了
      const eventName = event.event
      // 获取当前ai回复的消息
      const aiMessage = messages.value[messages.value.length - 1]
      if(eventName === 'done'){
        // 关闭ai助手思考状态
        isAiTyping.value = false
        // 终止ai助手回复
        ctrl.abort()
        // 调用获取会话情绪分析结果接口
        loadSessionEmotion(currentSession.value.sessionId)
        return
      }
      const payload = JSON.parse(raw)
      if(String(payload.code) === '200' && payload.data.content && payload.data){
        // 渲染ai助手回复
        aiMessage.content += payload.data.content
      }else{
        handleError(payload.message || 'AI助手回复失败')
      }
    },
    // 监听错误事件
    onerror: (error) => {
      handleError(error || 'AI助手回复失败')
      throw error
    },
    // 监听关闭事件
    onclose: () => {
      // 开始情绪分析
      loadSessionEmotion(currentSession.value.sessionId)
    }
  })

}

// ai流式回复错误处理函数
const handleError = (error) => {
  // 获取当前ai回复的消息
  const aiMessage = messages.value[messages.value.length - 1]
  if(aiMessage){
    aiMessage.content = 'AI回复失败，请重试'
  }
  isAiTyping.value = false
  ElMessage.error(error)
}


// 会话历史列表展示
const getSessionPage = () => {
  getSessionList({
    pageNum: 1,
    pageSize: 10,
  }).then(res => {
    // 处理返回的会话列表
    console.log(res)
    // 更新会话列表
    sessionList.value = res.records || []
  })
}
const loading = ref(false)
// 点击会话历史列表渲染更新当前会话
const handleSessionClick = (item) => {
  console.log(item)
  // 开启loading状态
  loading.value = true
  
  Promise.all([
  // 调用获取会话消息列表接口
  getSessionMessages(item.id).then(res => {
     // 处理返回的消息列表
    console.log(res)
     // 更新消息列表
    messages.value = res || []
  }),
  // 调用获取会话情绪分析结果接口
  loadSessionEmotion(item.id)
]).finally(() => {
  loading.value = false  // 等两个请求都完成后再关闭loading状态
})

  // 更新sessionData
  const sessionData = {
    sessionId: `session_${item.id}`,
    status: 'ACTIVE',
    sessionTitle: item.sessionTitle,
  }
  // 更新当前会话
  currentSession.value = sessionData
  
}

// 删除某条历史会话
const handleDelete = (sessionId) => {
  deleteSession(sessionId).then(res => {
    // 提示用户删除成功
    ElMessage.success('已删除')
    // 更新会话历史列表
    getSessionPage()
  })
}

// 简单格式化换行规则
const formatMarkdown = (markdown) => {
  return markdown.replace(/\n/g, '<br>')
}

// 页面加载完成后默认创建临时对话
onMounted(() => {
  // 调用会话历史列表展示接口
  getSessionPage()
  // 创建临时对话
  createNewChat()
})



</script>


<style lang="scss" scoped>
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
  .sidebar {
    width: 320px;

    .ai-assistant-info {
      margin-bottom: 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(251, 146, 60, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      .breathing-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        animation: breathing 4s ease-in-out infinite;
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
        position: relative;
      }

      .assistant-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #fb923c, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        background-clip: text;
        margin: 0 0 12px;
      }

      .online-status {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        font-size: 12px;
        font-weight: 600;

        .status-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
        }
      }
    }

    .session-history {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      min-height: 250px;
      display: flex;
      flex-direction: column;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

      }

      .session-list {
        overflow-y: auto;
        max-height: 200px;
        scrollbar-width: thin;
        scrollbar-color: rgba(64, 150, 255, 0.3) transparent;

        .session-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;

          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
          }

          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }

          .session-info {
            flex: 1;

            .session-title {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              .session-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;

                .session-time {
                  font-size: 12px;
                  color: #999;
                }
              }

              .session-preview {
                width: 200px;
                font-size: 12px;
                color: #666;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .session-stats {
                display: flex;
                align-items: center;
                gap: 12px;

                span {
                  font-size: 12px;
                  color: #999;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }

            .session-actions {
              position: absolute;
              top: 10px;
              right: 12px;
            }
          }
        }

        .no-sessions-text {
          text-align: center;
          font-size: 14px;
          color: #999;
        }
      }
    }

    .emotion-garden {
      background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      .garden-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;

        .garden-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #8b4513;
        }
      }

      .emotion-info {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        color: #fff;

        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }

        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }

      .emotion-info2 {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(135deg, #9e0409 0%, #bd0d0d 50%, #d73b3b 100%);
        color: #fff;

        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }

        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }



      .warm-tips {
        text-align: center;
        margin-bottom: 16px;

        .emotion-status-text {
          margin-bottom: 12px;

          .status-label {
            font-size: 14px;
            color: #8b7355;
            margin-right: 8px;
          }

          .status-emotion {
            font-size: 16px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-block;
          }
        }

        .emotion-intensity {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          .intensity-dots {
            display: flex;
            gap: 4px;

            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #e0e0e0;
              transition: all 0.3s ease;

              &.active {
                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
              }
            }
          }

          .intensity-text {
            font-size: 12px;
            color: #8b7355;
            font-weight: 500;
          }
        }

        .warm-suggestion {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

          .suggestion-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .suggestion-content {
            text-align: left;
            flex: 1;

            .suggestion-title {
              font-size: 14px;
              font-weight: 600;
              color: #8b7355;
              margin-bottom: 6px;
            }

            .suggestion-text {
              font-size: 13px;
              color: #6b5b47;
              line-height: 1.5;
            }
          }
        }

        .healing-actions {
          margin-bottom: 16px;

          .actions-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 16px;
          }

          .actions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .action-item {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
              border-radius: 12px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(255, 255, 255, 0.5);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
              text-align: left;

              .action-icon {
                font-size: 14px;
                color: #ffd700;
                flex-shrink: 0;
              }

              .action-text {
                font-size: 12px;
                color: #6b5b47;
                line-height: 1.4;
                flex: 1;
              }
            }
          }
        }

        .risk-notice {
          background: linear-gradient(135deg, #fff9e6, #ffeaa7);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(255, 234, 167, 0.6);
          box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);

          .notice-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .notice-content {
            flex: 1;

            .notice-title {
              font-size: 14px;
              font-weight: 600;
              color: #d4840f;
              margin-bottom: 6px;
            }

            .notice-text {
              font-size: 13px;
              color: #b8740c;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }

  .chat-main {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;

    .chat-header {
      background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;

      .header-left {
        display: flex;
        align-items: center;

        .chat-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }

        .chat-info {
          h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          p {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
      min-height: 0;
      max-height: calc(100vh - 200px);
      scrollbar-width: thin;
      scrollbar-color: rgba(251, 146, 60, 0.3) transparent;

      .message-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }

        &.ai-message {
          .message-avatar {
            background: linear-gradient(135deg, #fb923c, #f59e0b);
            box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
          }
        }

        &.user-message {
          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }
        }

        .message-content {
          max-width: 70%;

          .message-bubble {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 12px 16px;
            position: relative;
            animation: fadeInUp 0.4s ease-out;
            border: 1px solid rgba(251, 146, 60, 0.1);
            box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);

            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 8px 0;

              .typing-dot {
                width: 8px;
                height: 8px;
                background: #ccc;
                border-radius: 50%;
                animation: typing 1.5s ease-in-out infinite;

                &:nth-child(2) {
                  animation-delay: 0.2s;
                }

                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }

            /* 错误消息样式 */
            .error-message {
              background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
              border: 1px solid #F87171;
              border-radius: 12px;
              padding: 12px 16px;
              color: #991B1B;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }

          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }

    .chat-input {
      border-top: 1px solid rgba(251, 146, 60, 0.1);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
      backdrop-filter: blur(10px);
      flex-shrink: 0;

      .input-container {
        flex: 1;
        .message-input :deep(.el-textarea__inner) {
            resize: none;
          }
      }

      .input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #78716c;
        font-weight: 500;
      }

      .send-btn {
        height: 60px;
        width: 60px;
        border-radius: 16px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
        transition: all 0.3s ease;
        &:hover {
          background: linear-gradient(135deg, #dfcfb4 0%, #da9a65 100%) !important;
        }
      }

    }

  }
}
</style>
