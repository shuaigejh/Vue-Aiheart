<template>
  <div class="emotionDiary-container">
    <div class="header-section">
      <div class="header-content">
        <el-image :src="url1" alt="情感日志" style="width: 60px; height: 60px;"></el-image>
        <h1>情绪日记~</h1>
      </div>
    </div>
    <div class="content" v-loading="loading">
      <!-- 情绪评分 -->
      <div class="diary-card">
        <div class="title">Hi~ 今天的心情怎么样呢</div>
        <div class="section">
          <p>给今天的心情打个分吧</p>
          <div class="rate">
            <el-rate v-model="diaryForm.moodScore" :texts="emotionStatus" :show-text="true" :max="10" size="large" />
          </div>
        </div>
      </div>
      <!-- 主要情绪 -->
      <div class="diary-card">
        <div class="title">选择一个最符合你今天心情的状态吧！</div>
        <div class="emotion-grid">
          <div v-for="emotion in emotionOptions" :key="emotion.name" class="emotion-card" :class="{'selected': emotion.name === diaryForm.dominantEmotion}" @click="handleEmotionClick(emotion.name) ">
            <el-image :src="emotion.url" alt="情感表情" style="width: 50px; height: 50px;"></el-image>
            <div class="emotion-name">{{emotion.name }}</div>
          </div>
        </div>
      </div>
      <!-- 详细记录 -->
      <div class="diary-card">
        <div class="title">与我详细分享一下今天的心情好吗~</div>
        <div class="detail-form">
          <div class="form-group">
            <div class="form-label">是什么导致了今天心情的变化呢？</div>
            <el-input class="form-input" v-model="diaryForm.emotionTriggers" placeholder="让我倾听一下导致你今天心情变化的原因...." type="textarea" rows="3"  clearable></el-input>
          </div>
          <div class="form-group">
            <div class="form-label">分享一下今天的感想吧~</div>
            <el-input class="form-input" v-model="diaryForm.diaryContent" placeholder="写下今天你的想法，感受，与我分享一下吧...." type="textarea" rows="5"  clearable></el-input>
          </div>
          <!-- 生活质量指标 -->
          <div class="life-indicators">
            <div class="indicator-group">
              <div class="form-label">睡眠质量</div>
              <el-select class="form-select" popper-class="custom-dropdown"  v-model="diaryForm.sleepQuality" placeholder="选择你昨晚睡眠质量">
                <el-option label="太棒了" value="5" />
                <el-option label="不错" value="4" />
                <el-option label="一般" value="3" />
                <el-option label="较差" value="2" />
                <el-option label="很差" value="1" />
              </el-select>
            </div>
            <div class="indicator-group">
              <div class="form-label">压力等级</div>
              <el-select class="form-select"  v-model="diaryForm.stressLevel" placeholder="选择你今天压力水平">
                <el-option label="高压" value="5" />
                <el-option label="较高" value="4" />
                <el-option label="中等" value="3" />
                <el-option label="较低" value="2" />
                <el-option label="低压" value="1" />
              </el-select>
            </div>
          </div>
          <!-- 提交按钮 -->
          <div class="action-buttons">
            <el-button plain @click="resetForm">重置</el-button>
            <el-button plain type="primary" @click="submitDiary">提交</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref,onMounted } from 'vue'
import { ElMessage,dayjs } from 'element-plus'
import { createOrUpdateEmotionDiary } from '@/api/frontend'

// 标题图片
const url1 = new URL('@/assets/开心.svg', import.meta.url).href

// 10种主要情绪状态
const emotionStatus = ['绝望崩溃','消沉抑郁','焦虑烦躁','低落不悦','平静淡然','轻松惬意','愉悦舒心','欢欣满足','兴奋欣喜','极致幸福']

// 8种表情
const emotionOptions = [
{ name: '开心', url: new URL('@/assets/images/开心.png', import.meta.url).href },
{ name: '平静', url: new URL('@/assets/images/平静.png', import.meta.url).href },
{ name: '焦虑', url: new URL('@/assets/images/焦虑.png', import.meta.url).href },
{ name: '悲伤', url: new URL('@/assets/images/悲伤.png', import.meta.url).href },
{ name: '兴奋', url: new URL('@/assets/images/兴奋.png', import.meta.url).href },
{ name: '疲惫', url: new URL('@/assets/images/疲惫.png', import.meta.url).href },
{ name: '惊讶', url: new URL('@/assets/images/惊讶.png', import.meta.url).href },
{ name: '困惑', url: new URL('@/assets/images/困惑.png', import.meta.url).href }
]


// 情绪日记数据
const diaryForm = ref({
  diaryDate: dayjs().format('YYYY-MM-DD'),
  moodScore: null,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  sleepQuality: null,
  stressLevel: null
})  

// 加载中
const loading = ref(true)

// 等待所有数据加载完成后再关闭 loading
onMounted(() => {
  loading.value = false
})

// 处理主要情绪点击事件
const handleEmotionClick = (emotion) => {
  diaryForm.value.dominantEmotion = emotion
}

// 重置表单
const resetForm = () => {
  Object.assign(diaryForm.value, {
    moodScore: null,
    dominantEmotion: '',
    emotionTriggers: '',
    diaryContent: '',
    sleepQuality: null,
    stressLevel: null
  })
}
// 提交表单
const submitDiary = () => {
  console.log(diaryForm.value)
  if (!diaryForm.value.moodScore) {
    ElMessage.error('需要填写心情评分哦~')
    return
  }
  if (!diaryForm.value.dominantEmotion) {
    ElMessage.error('需要选择主要心情状态哦~')
    return
  }

  createOrUpdateEmotionDiary(diaryForm.value).then(res => {
    ElMessage.success('提交成功')
    resetForm()
  }).catch(err => {
    ElMessage.error(err.msg || '提交失败')
  })
}



</script>


<style lang="scss" scoped>

.form-input {
  --el-input-placeholder-color: #140d0d;
}

.form-select {
  :deep(.el-select__placeholder),
  :deep(.el-select .el-input__inner::placeholder) {
    color: #182104;
  }
}
// 改变星星颜色
.el-rate {
  --el-rate-void-color: #5f5a5a;  /* 未选中星星颜色 */
  --el-rate-fill-color: rgb(251, 79, 125);  /* 选中后星星颜色 */
}

// 文本域输入区域背景
.form-input :deep(.el-textarea__inner) {
  resize: none;
  /* Glassmorphism Card */
background: rgba(255, 255, 255, 0.5);
backdrop-filter: blur(8px) saturate(131%);
-webkit-backdrop-filter: blur(8px) saturate(131%);
border-radius: 10px;
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);

}

/* 选择框输入区域背景 */
.form-select :deep(.el-select__wrapper) {
 /* Glassmorphism Card */
background: rgba(255, 255, 255, 0.5);
backdrop-filter: blur(8px) saturate(131%);
-webkit-backdrop-filter: blur(8px) saturate(131%);
border-radius: 5px;
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.emotionDiary-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
  background-image: url('@/assets/images/小新情绪日记.png');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  .header-section {
    // background: linear-gradient(135deg, #7ED321 0%, #F5A623 100%);
    color: #000;
    padding: 40px;

    // background: rgba(255, 249, 187, 0.97);
    // background: -moz-linear-gradient(45deg, rgba(255, 249, 187, 0.97) 0%, rgba(247, 188, 188, 0.83) 100%);
    // background: -webkit-gradient(right top, left bottom, color-stop(0%, rgba(255, 249, 187, 0.97)), color-stop(100%, rgba(247, 188, 188, 0.83)));
    // background: -webkit-linear-gradient(45deg, rgba(255, 249, 187, 0.97) 0%, rgba(247, 188, 188, 0.83) 100%);
    // background: -o-linear-gradient(45deg, rgba(255, 249, 187, 0.97) 0%, rgba(247, 188, 188, 0.83) 100%);
    // background: -ms-linear-gradient(45deg, rgba(255, 249, 187, 0.97) 0%, rgba(247, 188, 188, 0.83) 100%);
    // background: linear-gradient(45deg, rgba(255, 249, 187, 0.97) 0%, rgba(247, 188, 188, 0.83) 100%);
    // filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f7bcbc', endColorstr='#fff9bb', GradientType=1 );


    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .content {
    margin: 0 auto;
    width: 1300px;
    padding: 20px;

    // background: rgba(249, 250, 238, 0.83);
    // background: -moz-linear-gradient(-45deg, rgba(249, 250, 238, 0.83) 0%, rgba(250, 238, 158, 0.97) 100%);
    // background: -webkit-gradient(left top, right bottom, color-stop(0%, rgba(249, 250, 238, 0.83)), color-stop(100%, rgba(250, 238, 158, 0.97)));
    // background: -webkit-linear-gradient(-45deg, rgba(249, 250, 238, 0.83) 0%, rgba(250, 238, 158, 0.97) 100%);
    // background: -o-linear-gradient(-45deg, rgba(249, 250, 238, 0.83) 0%, rgba(250, 238, 158, 0.97) 100%);
    // background: -ms-linear-gradient(-45deg, rgba(249, 250, 238, 0.83) 0%, rgba(250, 238, 158, 0.97) 100%);
    // background: linear-gradient(135deg, rgba(249, 250, 238, 0.83) 0%, rgba(250, 238, 158, 0.97) 100%);
    // filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f9faee', endColorstr='#faee9e', GradientType=1 );

    .diary-card {
      margin-bottom: 20px;
      // background: white;
      // border-radius: 10px;
      padding: 20px;
      // box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        /* Glassmorphism Card */
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px) saturate(180%);
  -webkit-backdrop-filter: blur(5px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);

      .title {
        margin-bottom: 20px;
        font-size: 25px;
        font-weight: 600;
        color: #000000;
      }

      .section {
        margin-bottom: 10px;
        color: #6B7280;

        p {
          font-size: 16px;
          color: #212c42;
          margin-bottom: 15px;
        }
      }

      .emotion-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .emotion-card {
          padding: 15px;
          // border: 2px solid #E5E7EB;
          border-radius: 15px;
          text-align: center;
          cursor: pointer;
          // background: #F9FAFB;
          /* Glassmorphism Card */
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px) saturate(180%);
          -webkit-backdrop-filter: blur(15px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          

          .emotion-name {
            margin-top: 10px;
            padding: 0 75px;
            color: #374151;
          }

          &.selected {
            border-color: #7ED321;
            background: #F0FDF4;
            transform: translateY(-3px);
          }
        }
      }

      .detail-form {
        .form-label {
          margin: 10px 0;
          color: #13182f;
          font-size: 17px;
          // font-weight: 600;
        }

        .life-indicators {
          display: flex;
          gap: 20px;

          .indicator-group {
            flex: 1;
          }
        }

        .action-buttons {
          margin-top: 40px
        }
      }
    }
  }
}
</style>
