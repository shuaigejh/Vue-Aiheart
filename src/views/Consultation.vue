<template>
    <div>
      <PageHead title="咨询记录"></PageHead>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="会话ID" width="80">
          <template #default="scope">
            <el-avatar :size="45">{{scope.row.userNickname}}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="情绪日志">
           <template #default="scope">
            <div class="session-title">
             {{ scope.row.sessionTitle }}
            </div>
            <div class="session-content">
             {{ scope.row.lastMessageContent }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="messageCount" label="对话数量" width="100"></el-table-column>
        <el-table-column prop="lastMessageTime" label="最后对话" width="170"></el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="primary" text size="mini" @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
      style="margin-top: 25px"
      layout="prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.size"
      @change="handleCurrentChange"
    />
    <el-dialog v-model="showDetailDialog" title="会话详情" width="70%" :close-on-click-modal="false" >
      <div class="session-detail">
        <div class="detail-header">
          <div class="detail-row">
            <div class="detail-label">用户：</div>
            <div class="detail-value">{{ sessionDetail.userNickname || '无' }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">起始时间：</div>
            <div class="detail-value">{{ sessionDetail.startedAt}}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">对话数量：</div>
            <div class="detail-value">{{ sessionDetail.messageCount}}</div>
          </div>
        </div>
        <div class="messages-container">
          <div class="message-header">
            <h4>对话记录</h4>
          </div>
          <div class="messages-list" v-loading="loadingMessages">
            <div v-for="message in sessionMessages" :key="message.id" class="message-item" :class="message.senderType === 1 ? 'user-message' : 'ai-message'">
            <div class="message-header">
              <span class="sender">{{ message.senderType === 1 ? '用户' : 'AI小助手' }}</span>
              <span class="time">{{ message.createdAt }}</span>
            </div>
            <div class="message-content">
              {{ message.content }}
            </div>
          </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="danger" @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
    </div>
  </template>


<script setup>
import PageHead from '@/components/PageHead.vue'
import { consultationPage, consultationDetail } from '@/api/admin'
import { ref, onMounted } from 'vue'

// 1.咨询记录列表
const tableData = ref([])

// 6.控制详情弹窗打开或隐藏
const showDetailDialog = ref(false)

// 7.会话详情头部用户信息
const sessionDetail = ref({})

// 8.会话详情具体对话内容
const sessionMessages = ref([])

// 9.会话详情加载中
const loadingMessages = ref(false)

// 2.调用咨询纪录列表需要的分页参数
const pagination = ref({
  currentPage: 1,
  size: 10,
  total: 0
})

// 3.分页查询咨询记录列表
const handleSearch = async () => {
  const res = await consultationPage(pagination.value)
  tableData.value = res.records
  pagination.value.total = res.total
}

// 3.分页查询咨询记录列表
onMounted(async () => {
  handleSearch()
})

// 4.查看详情
const viewDetail = async (row) => {
  loadingMessages.value = true
  showDetailDialog.value = true
  const res = await consultationDetail(row.id)
  loadingMessages.value = false
  sessionMessages.value = res
  sessionDetail.value = row
  
}

// 5.分页改变
const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  handleSearch()
}
</script>


<style lang="scss" scoped>
.session-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }
  .session-preview {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .session-detail {
    max-height: 70vh;
    overflow-y: auto;
    .detail-header {
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      :last-child {
        margin-bottom: 0;
      }
      .detail-label {
        font-weight: 500;
        color: #495057;
        min-width: 80px;
        margin-right: 8px;
      }

      .detail-value {
        color: #333;
      }
    }
  }
  .messages-container {
    margin-top: 20px;
    .messages-header {
      margin-bottom: 16px;
      h4 {
        margin: 0;
        color: #333;
        font-size: 16px;
        font-weight: 500;
      }
    }
    .messages-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      background: #fff;
      .message-item {
        margin-bottom: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        :last-child {
          margin-bottom: 0;
        }
        &.user-message {
          background: #e8f4fd;
        }

        &.ai-message {
          background: #f0f9f0;
        }
      }
      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        .sender {
          font-weight: 500;
          color: #333;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .time {
          font-size: 12px;
          color: #999;
        }

        .message-content {
          color: #333;
          line-height: 1.6;
          white-space: pre-wrap;
          margin-top: 8px;
          font-size: 14px;
        }
      }
    }
  }
</style>
