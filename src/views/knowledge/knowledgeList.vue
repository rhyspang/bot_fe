<template>
  <div class="knowledge-container">
    <div class="command-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            placeholder="输入信息回车进行搜索"
            suffix-icon="el-icon-search"
            v-model="searchInfo"
            @keyup.enter.native="handleSearch()"
          >
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="handleCreating">+新增问题</el-button>
        </el-col>
        <el-col :span="3">

          <input ref="uploads" type="file" accept=".csv" hidden @change="uploadConfig">
          <el-button type="primary" @click="$refs.uploads.click()">导入知识点</el-button>
<!--            <div slot="tip" class="el-upload__tip">只能上传csv文件，且不超过10MB</div>-->
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="downloadsCsv">导出知识点</el-button>
            <!--            <div slot="tip" class="el-upload__tip">只能上传csv文件，且不超过10MB</div>-->
        </el-col>
        <el-col :span="9">
          <el-button type="success" :loading="trainLoading" @click="trainModel" style="margin-left: 60px">{{ trainLoading ? "知识点训练中" : "知识点训练" }}</el-button>
          <!--            <div slot="tip" class="el-upload__tip">只能上传csv文件，且不超过10MB</div>-->
        </el-col>
      </el-row>

    </div>
    <div class="knowledge-list">
      <el-table
        v-loading="listLoading"
        :data="knowledgeList"
        style="width: 100%">
        <el-table-column
          prop="id"
          label="ID"
          width="180">
        </el-table-column>
        <el-table-column
          prop="question"
          label="标准问">
        </el-table-column>
        <el-table-column
          label="相似问数量"
          :formatter="d => d.similarQuestions.length"
        >
        </el-table-column>
        <el-table-column
          prop="answer"
          :formatter="d => d.answers[0]"
          label="答案"
        >
        </el-table-column>
        <el-table-column
          prop="scope"
          label="答案类型"
          align="center"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.scope === 0">售前</span>
            <span v-if="scope.row.scope === 1">售中</span>
            <span v-if="scope.row.scope === 2">售后</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template slot-scope="scope">
            <el-button type="text" @click="editKnowledge(scope.$index)">编辑</el-button>
            <el-button type="text" @click="deleteKnowledge(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      :title="isCreating ? '创建知识点' : '修改知识点'"
      :visible.sync="dialogVisible"
      width="50%">
      <el-form ref="knowledgeForm" :model="knowledgeFormData" :rules="knowledgeFormDataRules" label-width="100px">
        <el-form-item label="标准问" prop="question">
          <el-row>
            <el-col :span="20">
              <el-input v-model="knowledgeFormData.question" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="答案类型" prop="scope">
<!--          <el-input v-model="knowledgeFormData.scope"></el-input>-->
          <el-row>
            <el-col :span="20">
              <el-select
                v-model="knowledgeFormData.scope"
                placeholder="请选择类型"
                class="knowledge-scope"
              >
                <el-option
                  v-for="item in answerScopeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="相似问">
          <div
            v-if="knowledgeFormData.similarQuestions"
            class="similar-question-wrapper"
          >
            <el-row
              v-for="(_, index) in knowledgeFormData.similarQuestions"
              :key="index"
              class="simi-question"
            >
              <el-col :span="20">
                <el-input
                  v-model="knowledgeFormData.similarQuestions[index]"
                />
              </el-col>
              <el-col :span="3">
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  class="delete-item"
                  round
                  :disabled="knowledgeFormData.similarQuestions.length === 1"
                  @click="knowledgeFormData.similarQuestions.splice(index, 1)"
                />
              </el-col>
            </el-row>
          </div>
          <el-button size="mini" @click="addSimiQuestion('similarQuestions')">增加相似问</el-button>
        </el-form-item>
        <el-form-item label="答案">
          <div
            v-if="knowledgeFormData.answers.length"
            class="answer-item-wrapper"
          >
            <el-row
              v-for="(_, index) in knowledgeFormData.answers"
              :key="index"
              class="simi-question"
            >
              <el-col :span="20">
                <el-input
                  v-model="knowledgeFormData.answers[index]"
                />
              </el-col>
              <el-col :span="3">
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  class="delete-item"
                  round
                  :disabled="knowledgeFormData.answers.length === 1"
                  @click="knowledgeFormData.answers.splice(index, 1)"
                />
              </el-col>
            </el-row>
          </div>
          <el-button size="mini" @click="addSimiQuestion('answers')">增加答案</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('knowledgeForm')">确 定</el-button>
       </span>
    </el-dialog>

    <div class="pagination">
      <el-pagination
        layout="prev, pager, next, jumper"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        :current-page="pagination.page"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>

  </div>

</template>

<script>
import { createKnowledge, deleteKnowledge, getKnowledgeList, updateKnowledge, exportCsv, importCsv, trainModel } from '@/api/knowledge'
import _ from 'lodash'
import { mapGetters } from 'vuex'

export default {
  name: 'KnowledgeList',
  data() {
    return {
      answerScopeOptions: [
        {
          label: '售前',
          value: 0
        },
        {
          label: '售中',
          value: 1
        },
        {
          label: '售后',
          value: 2
        }
      ],
      knowledgeBaseId: 0,
      pagination: {
        pageSize: 10,
        total: 0,
        page: 1
      },
      searchInfo: '',
      dialogVisible: false,
      isCreating: true,
      listLoading: false,
      knowledgeFormData: {
        question: '',
        answers: [],
        scope: 0,
        similarQuestions: []
      },
      knowledgeFormDataRules: {
        question: [
          {
            required: true,
            message: '请输入标准问',
            trigger: 'blur'
          }
        ],
        scope: [
          {
            required: true
          }
        ]
      },
      knowledgeList: [],
      fileList: [],
      trainLoading: false
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'userId'
    ])
  },
  created() {
    this.knowledgeBaseId = this.$route.params.knowledgeBaseId
    this.fetchKnowledgeList()
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const answers = []
          const similarQuestions = []
          this.knowledgeFormData.answers.map(item => {
            answers.push({
              content: item
            })
          })
          this.knowledgeFormData.similarQuestions.map(item => {
            similarQuestions.push({
              content: item
            })
          })
          const data = {
            'question': this.knowledgeFormData.question,
            'scope': this.knowledgeFormData.scope,
            'answers': answers,
            'similar_questions': similarQuestions,
            'knowledge_base': +this.knowledgeBaseId,
            'created_by': this.userId
          }
          if (this.isCreating) {
            createKnowledge(this.knowledgeBaseId, data).then(() => {
              this.$message.info('创建成功')
              this.fetchKnowledgeList()
            }).catch(err => {
              this.$message.error('用户名重复')
              console.log(err)
            })
          } else {
            data.id = this.knowledgeFormData.id
            updateKnowledge(this.knowledgeBaseId, this.knowledgeFormData.id, data).then(() => {
              this.fetchKnowledgeList()
            }).catch(err => {
              this.$message.error('用户名重复')
              console.log(err)
            })
          }
          this.resetForm('knowledgeForm')
          this.dialogVisible = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    deleteKnowledge(knowledgeId) {
      this.$confirm('此操作将永久删除该知识点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteKnowledge(this.knowledgeBaseId, knowledgeId).then(() => {
          this.fetchKnowledgeList()
        }).catch(err => {
          this.$message.error('删除失败')
          console.log(err)
        })
      })
    },
    editKnowledge(index) {
      _.assign(this.knowledgeFormData, this.knowledgeList[index])
      this.isCreating = false
      this.dialogVisible = true
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    handleCreating() {
      this.isCreating = true
      this.dialogVisible = true
    },
    fetchKnowledgeList() {
      this.knowledgeList = []
      this.listLoading = true
      const params = {
        page_size: this.pagination.pageSize,
        page: this.pagination.page,
        ordering: '-id'
      }
      if (this.searchInfo) {
        params.search = this.searchInfo
      }
      getKnowledgeList(this.knowledgeBaseId, params).then(res => {
        this.pagination.total = res.value.count
        res.value.results.map(item => {
          this.knowledgeList.push({
            id: item.id,
            knowledgeBaseId: item.knowledge_base,
            question: item.question,
            created_by: item.created_by,
            scope: item.scope,
            answers: item.answers.map(ans => ans.content),
            similarQuestions: item.similar_questions.map(similar_question => similar_question.content)
          })
        })
        console.log(this.knowledgeList)
      }).catch(err => {
        this.$message.error('获取知识点列表失败')
        console.log(err)
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.page = 1
      this.fetchKnowledgeList()
    },
    handleCurrentChange(page) {
      this.pagination.page = page
      this.fetchKnowledgeList()
    },
    handleSearch() {
      this.fetchKnowledgeList()
    },
    addSimiQuestion(filedName) {
      const questionLen = this.knowledgeFormData[filedName].length
      if (this.knowledgeFormData[filedName] && this.knowledgeFormData[filedName][questionLen - 1] === '') {
        this.$message.warning('请先输入空白选项')
        return
      }
      this.knowledgeFormData[filedName].push('')
    },
    fileChange(file, fileList) {
      // 这是关键一句
      console.log(fileList)
      if (fileList.length > 0) {
        this.fileList = [fileList[fileList.length - 1]]
      }
    },
    uploadConfig(e) {
      if (e.target.files.length === 0) {
        return
      }
      const formData = new FormData()
      formData.append('file', e.target.files[0])
      importCsv(this.knowledgeBaseId, formData).then((res) => {
        console.log(res)
        if (res.status === 10001) {
          this.$message.error(res.error)
        } else {
          this.fetchKnowledgeList()
        }
      }).catch(e => {
        console.log(e)
        this.$message.error('格式错误')
      })
    },
    downloadsCsv() {
      exportCsv(this.knowledgeBaseId).then((res) => {
        const blob = new Blob([res], { type: 'application/octet-stream' })
        const blobUrl = window.URL.createObjectURL(blob)
        this.download(blobUrl)
      })
    },
    download(blobUrl) {
      const a = document.createElement('a')
      a.download = `知识库_${this.knowledgeBaseId}.csv`
      a.href = blobUrl
      a.click()
    },

    trainModel() {
      this.trainLoading = true
      trainModel(this.knowledgeBaseId).then(() => {
        this.$message.success('知识点训练完成')
      }).catch((err) => {
        console.log(err)
      }).finally(() => {
        this.trainLoading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.knowledge-container {
  margin: 30px;
  .simi-question {
    margin: 5px 0;
  }
  .delete-item {
    margin-left: 10px;
  }
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  .knowledge-scope {
    width: 100%;
  }
}

</style>
