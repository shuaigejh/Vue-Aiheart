<template>
  <div class="knowledge-container">
    <div class="header-section">
      <div class="header-content">
        <el-image style="width: 60px; height: 60px; margin-right: 10px;" :src="logoUrl" alt="logo" class="logo-image" />
        <h1>知识文章~</h1>
      </div>
    </div>
    <div class="content" v-loading="loading">
      <!-- 左侧菜单 -->
      <div class="recommend-section">
        <div class="section-title">推荐阅读</div>
        <div class="recommend-list">
          <div v-for="item in recommendList" :key="item.id" class="recommend-item" @click="handleClick(item.id)">
            <h4 style="color: #d5ddea;">{{ item.title }}</h4>
            <p class="read-count">
              <el-icon><Histogram /></el-icon>
              阅读量：{{ item.readCount }}
            </p>
          </div>
        </div>
      </div>  
      <!-- 右侧文章列表 -->
      <div class="article-list">
        <div v-for="item in articleList" :key="item.id" class="article-item" @click="handleClick(item.id)">
          <el-image :src="getImg(item.coverImage)" alt="文章封面" style="width: 240px; height: 150px; border-radius: 8px;">
            <template #error>
              <img :src="defaultCover" alt="默认封面" style="width: 240px; height: 150px; " />
            </template>
          </el-image>
          <div class="info">
            <div class="title">{{ item.title }}
              <el-tag type="primary" plain>{{ item.categoryName }}</el-tag>
            </div>
            <div :style="{marginTop: '10px' }">
              <div class="flex-box">
                <el-icon><Avatar /></el-icon>
                <span>{{ item.authorName }}</span>
              </div>
              <div class="flex-box">
                <el-icon><List /></el-icon>
                <span>{{ dayjs(item.updatedAt).format('YYYY-MM-DD') }}</span>
              </div>
            </div>
            <div :style="{marginTop: '10px' }">
              <div class="flex-box">
                <el-icon><Platform /></el-icon>
                <span>观看人数：{{ item.readCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
      style="margin-top: 25px"
      layout="prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.size"
      @change="handleCurrentChange"
    />
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted } from 'vue'
import { getKnowledgeArticleList } from '@/api/frontend'
import { dayjs } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()

// 默认封面图
const defaultCover = new URL('@/assets/images/文章封面.jpg', import.meta.url).href
// logo 图片
const logoUrl = new URL('@/assets/图书.svg', import.meta.url).href

// 左侧推荐阅读文章列表
const recommendList = ref([])
// 右侧文章列表
const articleList = ref([])
// 右侧分页数据
const pagination = ref({
  currentPage: 1,
  size: 3,
  total: 0
})

// 获取并渲染右侧文章列表
const getPageList = () => {
  const params = {
    sortField: 'publishedAt',
    sortOrder: 'desc',
    ...pagination.value
  }
  getKnowledgeArticleList(params).then(res => {
    articleList.value = res.records
    pagination.value.total = res.total
  })
}

// 判断是否返回图片（使用相对路径，通过Vercel代理访问）
const getImg = (img) => {
  return img || defaultCover
}

// 分页切换
const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  getPageList()
}

// 点击文章跳转详情页
const handleClick = (id) => {
  router.push(`/knowledge/article/${id}`)
}


// 加载中
const loading = ref(true)



onMounted(() => {
  loading.value = true
  // 初始化时获取文章列表
  const params = {
    sortField: 'readCount',
    sortOrder: 'desc',
    currentPage: 1,
    size: 5,
  }
  // 初始化时获取右侧文章列表
  getPageList()
  // 初始化时获取左侧推荐阅读文章列表
  getKnowledgeArticleList(params).then(res => {
    recommendList.value = res.records
    loading.value = false
  })
})

</script>



<style lang="scss" scoped>
.knowledge-container {
  // background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
  background-image: url('@/assets/images/小新背景.png');
    background-size: cover;
    background-position: center;
    min-height: 100vh;

  .flex-box {
    font-size: 13px;
    color: #bcbcbd;
    margin-bottom: 10px;
    display: flex;
    align-items: center;

    span {
      margin-left: 10px;
    }
  }

  .header-section {
    // background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
    // background: repeating-radial-gradient(circle farthest-corner at 87% 50%, rgb(230, 219, 219) 0%, rgba(232, 218, 125, 0.99) 50%, rgb(232, 195, 94) 100%);

    // background: radial-gradient(circle farthest-corner at 68% 50%, rgb(243, 191, 48) 3%, rgb(215, 101, 101) 46%, rgb(251, 227, 142) 64%, rgb(213, 217, 161) 92%);
    color: white;
    padding: 35px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .content {
    display: flex;
    gap: 20px;
    margin: 0 auto;
    width: 1370px;
    padding: 20px;

    .recommend-section {
      width: 280px;
      // background: white;
      // border-radius: 12px;
      // box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      padding: 15px;
      height: 400px;

      background: rgb(229 225 225 / 0.01);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border-radius: 12px;
      border: 1px solid rgb(229 225 225 / 0.16);
      box-shadow: rgb(0 0 0 / 0.35) 0px 8px 32px 0px;


      .section-title {
        font-size: 12;
        font-weight: 600;
        color: #ed8383;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .recommend-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .recommend-item {
          margin-top: 8px;
          border-left: 4px solid #f59e0b;
          padding-left: 10px;
          cursor: pointer;

          .read-count {
            margin-top: 15px;
            font-size: 12px;
            color: #bcbcbd;
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }

    .article-list {
      flex: 1;

      .article-item {
        cursor: pointer;
        // background: white;
        // border-radius: 12px;
        // box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        padding: 15px;
        margin-bottom: 20px;
        display: flex;

        background: rgb(229 225 225 / 0.01);
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        border-radius: 12px;
        border: 1px solid rgb(229 225 225 / 0.16);
        box-shadow: rgb(0 0 0 / 0.35) 0px 8px 32px 0px;

        .info {
          margin-left: 20px;

          .title {
            font-size: 20px;
            font-weight: 600;
            color: #d5ddea;
            margin-bottom: 38px;
            display: flex;
            align-items: center;
            gap: 13px;
          }
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-bottom: 30px;
  }
}
</style>
