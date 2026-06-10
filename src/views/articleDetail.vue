<template>
<div class="articleDetail-container">
  <div class="header-section">
    <div class="header-content">
        <el-image style="width: 60px; height: 60px; margin-right: 10px;" :src="logoUrl" alt="logo" class="logo-image" />
        <h1 style="color: white;">知识文章详情~</h1>
      </div>
  </div>
  <div class="content" v-loading="loading">
    <div class="diary-card">
      <p class="article-title">文章信息</p>
      <div class="sub-title">
        <el-tag type="primary" size="large" class="category-tag">{{ articleDetail.categoryName }}</el-tag>
        <div class="flex-box">
          <el-icon style="margin-right: 5px; color: #8eb9e5;"><Timer /></el-icon>
          <span style="color: #8eb9e5; font-size: 12px;">{{ dayjs(articleDetail.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
      </div>
      <h1 class="article-title">{{ articleDetail.title }}</h1>
      <div class="summary-content" v-if="articleDetail.summary">
          {{ articleDetail.summary }}
      </div>
      <div class="flex-box" style="margin-top: 20px;">
        <div class="flex-box item">
          <el-icon style="margin-right: 1px; font-size: 12px;"><Avatar /></el-icon>
          <span>{{ articleDetail.authorName }}</span>
        </div>
        <div class="flex-box item">
          <el-icon style="margin-right: 3px; font-size: 12px;"><View /></el-icon>
          <span>{{ articleDetail.readCount }} 次阅读</span>
        </div>
      </div>
    </div>
    <div class="diary-card">
      <div class="title">文章内容</div>
      <div class="content-wrapper" v-html="formatContent(articleDetail.content)"></div>
      <div class="tags-content" v-if="articleDetail.tagArray?.length && articleDetail.tagArray">
        <h4 class="tags-title"> 情绪标签 </h4>
        <div class="tags-list">
          <el-tag v-for="tag in articleDetail.tagArray" :key="tag" type="primary" size="large" class="tag-item" effect="light">{{ tag }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</div>
</template>


<script setup>
import { dayjs,ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
import { getKnowledgeArticleDetail } from '@/api/frontend'
import { useRouter } from 'vue-router'
import { Platform } from '@element-plus/icons-vue'
const router = useRouter()

// 获取id
 const props = defineProps({
  id: String
})

// logo 图片
const logoUrl = new URL('@/assets/图书.svg', import.meta.url).href

// 基本的HTML清理和格式化
const formatContent = (content) => {
  if (!content) return ''
  let formatted = content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
  return formatted
}

// 文章详情
const articleDetail = ref({})

// 加载中
const loading = ref(true)

// onMounted 获取文章详情
onMounted(() => {
  loading.value = true
  getKnowledgeArticleDetail(props.id).then(res => {
    console.log(res)
    articleDetail.value = res
    loading.value = false
  })
})

</script>



<style lang="scss" scoped>
.articleDetail-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
  min-height: 100vh;
  background-image: url('@/assets/images/小新背景.png');
  background-size: cover;
  background-position: center;

  .flex-box {
    display: flex;
    align-items: center;

    .item {
      margin-right: 20px;
      color: #8eb9e5;

      span {
        margin-left: 5px;
      }
    }
  }

  .header-section {
    // background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
    // color: white;
    padding: 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .content {
    margin: 0 auto;
    width: 980px;
    padding: 20px;

    .diary-card {
      margin-bottom: 20px;
      // background: white;
      border-radius: 10px;
      padding: 20px;
      // box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

      background: rgb(229 225 225 / 0.01);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 10px;
      border: 1px solid rgb(229 225 225 / 0.16);
      box-shadow: rgb(0 0 0 / 0.35) 0px 8px 32px 0px;

      .title {
        margin-bottom: 15px;
        font-size: 20px;
        font-weight: 600;
        color: #dcd3cd;

      }

      .sub-title {
        margin-top: 20px;
        display: flex;
        align-items: center;

        .category-tag {
          margin-right: 20px;
        }
      }

      .article-title {
        font-size: 28px;
        font-weight: bold;
        color: #dcd3cd;
        // color: #8eb9e5;
        margin-top: 10px;
        margin-bottom: 15px;
      }

      .summary-content {
        background: rgba(218, 232, 204, 0.1);
        border-left: 4px solid #000000;
        padding: 10px 15px;
        border-radius: 0 8px 8px 0;
        position: relative;
        color: #dcd3cd;
      }

      .content-wrapper {
        font-size: 15px;
        color: #dcd3cd;

        :deep(p) {
          margin-bottom: 10px;
        }

        :deep(h1),
        :deep(h2),
        :deep(h3),
        :deep(h4),
        :deep(h5),
        :deep(h6) {
          margin: 15px 0 10px;
          color: #111827;
          font-weight: 600;
        }

        :deep(h2) {
          font-size: 15px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
        }

        :deep(h3) {
          font-size: 13px;
        }

        :deep(ul),
        :deep(ol) {
          padding-left: 15px;
          margin-bottom: 10px;
        }

        :deep(li) {
          margin-bottom: 5px;
        }
      }

      .tags-content {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;

        .tags-title {
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #dcd3cd;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
      }
    }
  }
}
</style>
