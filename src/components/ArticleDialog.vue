<template>
<el-dialog
  :title="isEdit ? '编辑文章' : '新增文章'"
  v-model="controlDialogVisible"
  width="50%"
  @close="handleClose"
  top="30px"
>
  <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
    <el-form-item label="文章标题" prop="title">
      <el-input v-model="formData.title" placeholder="请输入文章标题" clearable maxlength="30" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="文章分类" prop="categoryId">
      <el-select v-model="formData.categoryId" placeholder="请选择文章分类" >
        <el-option v-for="item in props.categories" :key="item.id" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="文章摘要" prop="summary">
      <el-input type="textarea" v-model="formData.summary" placeholder="请输入文章摘要(可选)" clearable maxlength="100" show-word-limit :rows="3"></el-input>
    </el-form-item>
    <el-form-item label="标签" prop="tags">
      <el-select v-model="formData.tagArray" placeholder="请选择文章标签"  style="width: 100%"  multiple filterable allow-create>
        <el-option v-for="item in commonTags" :key="item" :label="item" :value="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="封面图片">
      <div class="cover-upload">
        <el-upload
          class="avatar-uploader"
          action="3"
          :before-upload="beforeUpload"
          :http-request="handleUploadRequest"
          accept="image/*"
          :show-file-list="false"
        >
          <div v-if="!imgUrl" class="cover-placeholder">
            <p>点击上传封面</p>
          </div>
          <img v-else :src="imgUrl" alt="封面图片" class="cover-image">
        </el-upload>
        <div class="cover-remove" v-if="imgUrl">
          <el-button type="danger" size="mini" @click="handleRemove">移除图片</el-button>
        </div>
      </div>
    </el-form-item>
    <el-form-item label="文章内容" prop="content">
      <RichTextEditor 
      v-model="formData.content" 
      placeholder="请输入文章内容" 
      :max-char-count="5000"
      @change="handleContentChange"
      @created="handleEditorCreated"
      min-height="180px"
       />
    </el-form-item>
  </el-form>
  <div v-if="btnpreview">
    <h2>预览内容~</h2><br>
    <div v-html="formData.content"></div>
  </div>
  <template #footer>
     <el-button type="danger" @click="handleClose">取消</el-button>
    <el-button  @click="btnpreview = !btnpreview">{{btnpreview ? '关闭预览' : '预览效果'}}</el-button>
    <el-button type="primary" @click="handleSubmit" :loading="loading">{{isEdit ? '更新文章' : '创建文章'}}</el-button>
  </template>
</el-dialog>
</template>



<script setup>
import { ref,computed,nextTick,watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile, createArticle, updateArticle } from '@/api/admin'
import { FILE_BASE_URL } from '@/config/index'
import RichTextEditor from '@/components/RichTextEditor.vue'
// 父亲组件控制弹窗是否可见
const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  // 分类列表
  categories: {
    type: Array,
    default: () => []
  },
  // 当前文章详情(编辑文章时回显)
  currentArticle: {
    type: Object,
    default: null
  }
})
// 表单实例引用
const formRef = ref(null)
// 预览效果
const btnpreview = ref(false)
// 新增文章表单数据
const formData = ref({
 "title": '',
 "content": '',
 "coverImage": '',    
 "categoryId": '',
 "summary": '',
 "tags": '',
 "id": ''
})
const isEdit = computed(() => !!props.currentArticle?.id)
// 常用标签
const commonTags = [ '情绪管理','焦虑','抑郁','压力','睡眠','冥想','正念','放松','心理健康','自我成长','人际关系','工作压力','学习方法','生活技巧' ]

// 提交表单给父组件
const emit = defineEmits(['update:dialogVisible', 'success' ])

const controlDialogVisible = computed({
  get: () => {
    return props.dialogVisible
  },
  set: (val) => {
    emit('update:dialogVisible', val)
  }
})
// 表单验证规则
const rules = ref({
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    {max: 5000, message: '文章内容长度必须在0到5000之间字符', trigger: 'blur' }
  ],
})

// 定义是否已上传封面图片
const imgUrl = ref('')
// 上传封面图片前
const beforeUpload = (file)=>{
  // 限制上传图片大小
  if (file.size > 1024 * 1024 * 5) {
    ElMessage.error('上传图片大小不能超过5MB')
    return false
  }
  // 限制上传图片类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return false
  }
  return true
}
// 上传封面图片后
const businessId = ref('')
const handleUploadRequest = async ({file})=>{
  // 生成uuid
  businessId.value = crypto.randomUUID()
  const res = await uploadFile(file, {
    businessId: businessId.value
  })
  // console.log(res)
    imgUrl.value = FILE_BASE_URL + res.filePath
    formData.value.coverImage = res.filePath
}
// 移除封面图片
const handleRemove = () => {
  imgUrl.value = ''
  formData.value.coverImage = ''
}

// 会返回html和text文本
const handleContentChange = (data) => {
  formData.value.content = data.html
}
// 富文本框创建完成时触发
// const editorRef = ref(null)
const handleEditorCreated = (editor) => {
  // editorRef.value = editor
  if (formData.value.content && editor) {
    nextTick(() => {
      editor.setHtml(formData.value.content)
    })
  }
}
// 监听当前文章详情变化
watch(() => props.currentArticle, (newVal) => {
  if (newVal) {
   nextTick(() => {
    Object.assign(formData.value, newVal)
    businessId.value = newVal.id
    imgUrl.value = FILE_BASE_URL + newVal.coverImage
   })
  }
})



// 提交表单控制不能多次提交
const loading = ref(false)
// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  loading.value = true
  console.log(formData.value)
  const submitData = {
    ...formData.value,
    tags: formData.value.tagArray.join(',')
  }
  delete submitData.tagArray
  if(!isEdit.value){
    // 新增文章
    submitData.id = businessId.value
    const res = await createArticle(submitData)
    loading.value = false
    // 新增文章成功后刷新列表
    emit('success')
  }else{
    // 更新文章
    const res = await updateArticle(props.currentArticle.id, submitData)
    loading.value = false
    // 更新文章成功后刷新列表
    emit('success')
  }
}

// 关闭弹窗
const handleClose = () => {
  // 重置表单数据
  formRef.value.resetFields()
  // businessId 重置为空
  businessId.value = null
  // 移除封面图片
  handleRemove()
  // 重置标签数组
  formData.value.tagArray = []
  emit('update:dialogVisible', false)
  
}



</script>


<style lang="scss" scoped>
.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 120px;
  color: #999;
  background: #f6f8fa;
}
.cover-image {
  width: 200px;
  height: 120px;
  display: block;
}



</style>
