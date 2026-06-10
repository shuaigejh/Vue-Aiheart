<template>
  <div class="knowledge">
    <PageHead title="知识文章">
      <template #btns>
        <el-button type="primary" @click="handleEdit({})">新增</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSearch"></TableSearch>
    <el-table :data="tableData" style="margin-top: 25px" >
      <el-table-column label="序号" width="100">
    <template #default="scope">
      {{ getSerialNo(scope.$index) }}
    </template>
  </el-table-column>
      <el-table-column prop="title" label="文章标题" width="300" >
      </el-table-column>
      <el-table-column label="文章分类" width="250">
        <template #default="scope" >
          <div style="display: flex; align-items: center;">
            <el-icon style="margin-right: 5px;"><Ship /></el-icon>
            {{ categoryMap[scope.row.categoryId] }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="authorName" label="作者" width="200">
      </el-table-column>
      <el-table-column prop="readCount" label="阅读量" width="120"></el-table-column>
      <el-table-column prop="createdAt" label="发布时间" width="250"></el-table-column>
       <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope" >
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status === 0 || scope.row.status === 2" type="success" size="mini" @click="handlePublish(scope.row)">发布</el-button>
          <el-button v-else type="warning" size="mini" @click="handleOffline(scope.row)">下线</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
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
  </div>
  <ArticleDialog v-model:dialogVisible="dialogVisible" :categories="categories" @success="handleSuccess" :currentArticle="currentArticle"></ArticleDialog>
</template>

<script setup>
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
import { ref, onMounted } from 'vue'
import { categoryTree, articlePage, articleDetail, updateArticleStatus, deleteArticle } from '@/api/admin'
import ArticleDialog from '@/components/ArticleDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const getSerialNo = (index) => {
  return (pagination.value.currentPage - 1) * pagination.value.size + index + 1
}

const formItem = [
  {
    label: '文章标题',
    prop: 'title',
    comp: 'input',
    placeholder: '请输入文章标题'
  },
  {
    label: '文章分类',
    prop: 'categoryId',
    comp: 'select',
    placeholder: '请选择文章分类'
  },
  {
    label: '状态',
    prop: 'status',
    comp: 'select',
    placeholder: '请选择文章状态',
    options: [
      {
        label: '草稿',
        value: 0
      },
      {
        label: '已发布',
        value: 1
      },
      {
        label: '已下线',
        value: 2
      }
    ]
  }
]
// 分类映射
const categoryMap = ref({})
// 分类列表
const categories = ref([])
// 分页参数
const pagination = ref({
  currentPage: 1,
  size: 10,
  total: 0
})
// 文章列表数据
const tableData = ref([])

// 弹窗是否显示
const dialogVisible = ref(false)
// 判断是编辑文章还是新增文章
const isAdd = ref(false)

// 当前文章详情(编辑文章时回显)
const currentArticle = ref(null)

onMounted(async () =>{
  const res = await categoryTree()
  categories.value = res.map(item => {
    categoryMap.value[item.id] = item.categoryName
    return{
      label: item.categoryName,
      value: item.id
    }
  })
  formItem[1].options = categories.value
  // 初始化查询文章
  handleSearch()
})
 // 判断是编辑文章还是新增文章
const handleEdit = async (row) => {
  // console.log(row, '编辑文章')
  if(!row.id){
    currentArticle.value = null
    dialogVisible.value = true
    isAdd.value = true
  }else{
    const res = await articleDetail(row.id)
    // console.log(res, '文章详情666')
    currentArticle.value = res
    dialogVisible.value = true
    isAdd.value = false
  }
}


// 渲染查询文章
const handleSearch = async (formData) => {
  console.log(formData, '查询')
  const params = {
    ...formData,
    ...pagination.value
  }
  const res = await articlePage(params)
  console.log(res, '查询文章')
  tableData.value = res.records
  pagination.value.total = res.total
}
// 分页改变
const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  handleSearch()
}
//  新增或文章成功后刷新列表
const handleSuccess = () => {
  if(isAdd.value){
    dialogVisible.value = false
    handleSearch()
    ElMessage.success('新增文章成功')
  }else{
    dialogVisible.value = false
    handleSearch()
    ElMessage.success('更新文章成功')
  }
}
// 发布文章
const handlePublish = async (row)=>{
  ElMessageBox.confirm('确认发布文章吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await updateArticleStatus(row.id, {status: 1})
    handleSearch()
    ElMessage.success('发布文章成功')
  }).catch(() => {
    ElMessage({
      type: 'warning',
      message: '已取消发布'
    })
  })
}
// 下线文章
const handleOffline = async (row)=>{
  ElMessageBox.confirm('确认下线文章吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await updateArticleStatus(row.id, {status: 2})
    handleSearch()
    ElMessage.warning('下线文章成功')
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消下线'
    })
  })
}
// 删除文章
const handleDelete = async (row)=>{
  ElMessageBox.confirm('确认删除文章吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    await deleteArticle(row.id)  
    handleSearch()
    ElMessage.success('删除文章成功')
  }).catch(() => {
    ElMessage({
      type: 'warning',
      message: '已取消删除'
    })
  })
}



</script>
