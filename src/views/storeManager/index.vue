<template>
  <div class="store-manager-container">
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
        <el-col :span="6">
          <el-button v-if="isAdmin" type="primary" @click="handleCreating">+新增店铺</el-button>
        </el-col>
      </el-row>

    </div>
    <div class="store-list">
      <el-table
        v-loading="listLoading"
        :data="storeList"
        style="width: 100%">
        <el-table-column
          prop="id"
          label="ID"
          width="180">
        </el-table-column>
        <el-table-column
          prop="name"
          label="店铺名">
        </el-table-column>
        <el-table-column
          prop="desc"
          label="店铺描述">
        </el-table-column>
        <el-table-column
          prop="shopId"
          label="关联店铺ID">
        </el-table-column>
        <el-table-column
          prop="status"
          label="是否启用"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status" type="success">是</el-tag>
            <el-tag v-else type="danger">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="$router.push(`/store-manager/${scope.row.id}/knowledge`)">详情</el-button>
            <el-button v-if="isAdmin" type="text" @click="handleEditAuth(scope.$index)">权限</el-button>
            <el-button v-if="isAdmin" type="text" @click="editStore(scope.$index)">编辑</el-button>
            <el-button v-if="isAdmin" type="text" @click="deleteStore(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      :title="isCreating ? '创建店铺' : '修改店铺'"
      :visible.sync="dialogVisible"
      width="50%">
      <el-form ref="knowledgeForm" :model="knowledgeFormData" :rules="knowledgeFormDataRules" label-width="100px">
        <el-form-item label="店铺名" prop="name">
          <el-input v-model="knowledgeFormData.name"></el-input>
        </el-form-item>
        <el-form-item label="关联店铺ID" prop="shopId">
          <el-input v-model="knowledgeFormData.shopId"></el-input>
        </el-form-item>
        <el-form-item label="店铺描述" prop="desc">
          <el-input v-model="knowledgeFormData.desc" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-radio-group v-model="knowledgeFormData.status">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('knowledgeForm')">确 定</el-button>
       </span>
    </el-dialog>

    <el-dialog title="授权用户" :visible.sync="userAuthVisible" width="40%">
      <el-select v-model="authUserList" filterable multiple placeholder="请选择" style="width: 100%">
        <el-option
          v-for="item in userList"
          :key="item.id"
          :label="item.username"
          :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userAuthVisible = false">取 消</el-button>
        <el-button type="primary" @click="doUpdateAuthUserList()">确 定</el-button>
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
import { mapGetters } from 'vuex'
import _ from 'lodash'
import { getStoreList, createStore, deleteStore, updateStore, updateStoreUser } from '@/api/store'
import { getUserList } from '@/api/user'

const DEFAULT_KNOWLEDGE_FORM = {
  name: '',
  shopId: '',
  desc: '',
  status: true
}

export default {
  name: 'Dashboard',
  data() {
    return {
      userAuthVisible: false,
      pagination: {
        pageSize: 10,
        total: 0,
        page: 1
      },
      searchInfo: '',
      dialogVisible: false,
      isCreating: true,
      storeList: [],
      listLoading: false,
      knowledgeFormData: {
        name: '',
        shopId: '',
        desc: '',
        status: true
      },
      knowledgeFormDataRules: {
        name: [
          {
            required: true,
            message: '请输入店铺名',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 200,
            message: '最多可输入200字符',
            trigger: 'blur'
          }
        ],
        shopId: [
          {
            required: true,
            message: '请输入关联店铺ID',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 200,
            message: '最多可输入200字符',
            trigger: 'blur'
          }
        ],
        desc: [
          {
            required: true,
            message: '请输入描述信息',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 200,
            message: '最多可输入200字符',
            trigger: 'blur'
          }
        ]
      },
      userList: [],
      authUserList: [],
      activateStoreIndex: 0
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'userId',
      'roles'
    ]),
    isAdmin() {
      return this.roles.includes('admin')
    }
  },
  created() {
    this.fetchData()
    this.fetchUserList()
  },
  methods: {
    fetchData() {
      this.storeList = []
      this.listLoading = true
      const params = {
        page_size: this.pagination.pageSize,
        page: this.pagination.page
      }
      if (this.searchInfo) {
        params.search = this.searchInfo
      }
      getStoreList(params).then(res => {
        this.pagination.total = res.value.count
        res.value.results.map(item => {
          this.storeList.push({
            id: item.id,
            name: item.name,
            desc: item.desc,
            status: item.running_status,
            shopId: item.shop_id,
            createdBy: item.created_by,
            userList: item.users
          })
        })
      }).catch(err => {
        console.log(err)
        this.$message.error('获取店铺列表失败')
      }).finally(() => {
        this.listLoading = false
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const data = {
            'name': this.knowledgeFormData.name,
            'shop_id': this.knowledgeFormData.shopId,
            'desc': this.knowledgeFormData.desc,
            'running_status': this.knowledgeFormData.status,
            'created_by': this.userId
          }
          if (this.isCreating) {
            createStore(data).then(() => {
              this.$message.info('创建成功')
              this.fetchData()
            }).catch(err => {
              this.$message.error('店铺名或gua关联店铺名重复')
              console.log(err)
            })
          } else {
            updateStore(this.knowledgeFormData.id, data).then(() => {
              this.fetchData()
            }).catch(err => {
              this.$message.error('店铺名或关联店铺名重复')
              console.log(err)
            })
          }
          this.resetForm('knowledgeForm')
        } else {
          console.log('error submit!!')
          return false
        }
      })
      this.dialogVisible = false
    },
    deleteStore(storeIndex) {
      // this.$confirm('此操作将永久删除该店铺, 是否继续?', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(() => {
      //   deleteStore(this.storeList[storeIndex].id).then(() => {
      //     this.fetchData()
      //   }).catch(err => {
      //     this.$message.error('删除失败')
      //     console.log(err)
      //   })
      // })

      this.$prompt('此操作将永久删除该店铺，请输入店铺名确认删除', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        // eslint-disable-next-line no-eval
        inputPattern: eval(`\/^${this.storeList[storeIndex].name}$\/`),
        inputErrorMessage: '输入店铺名不匹配'
      }).then(({ value }) => {
        deleteStore(this.storeList[storeIndex].id).then(() => {
          this.fetchData()
        }).catch(err => {
          this.$message.error('删除失败')
          console.log(err)
        })
      })
    },
    editStore(index) {
      _.assign(this.knowledgeFormData, this.storeList[index])
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
    fetchUserList() {
      getUserList().then(res => {
        res.value.results.map(item => {
          this.userList.push({
            id: item.id,
            username: item.username
          })
        })
      })
    },
    handleEditAuth(index) {
      console.log(index)
      this.activateStoreIndex = index
      this.userAuthVisible = true
      this.authUserList = _.cloneDeep(this.storeList[index].userList)
      console.log(this.authUserList, this.storeList[index].userList)
    },
    doUpdateAuthUserList() {
      console.log(this.storeList[this.activateStoreIndex].id, this.authUserList)
      updateStoreUser(this.storeList[this.activateStoreIndex].id, this.authUserList).then(res => {
        this.$message.success('更新成功')
        this.fetchData()
      }).catch(() => {
        this.$message.error('更新失败')
      }).finally(() => {
        this.userAuthVisible = false
      })
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.page = 1
      this.fetchData()
    },
    handleCurrentChange(page) {
      this.pagination.page = page
      this.fetchData()
    },
    handleSearch() {
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped>
.store-manager-container {
  margin: 30px;
  .command-bar {
    /*margin: 30px;*/
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
