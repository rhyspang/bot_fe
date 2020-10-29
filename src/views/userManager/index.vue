<template>
  <div class="user-manager-container">
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
          <el-button type="primary" @click="handleCreating">+新增用户</el-button>
        </el-col>
      </el-row>

    </div>
    <div class="user-list">
      <el-table
        v-loading="listLoading"
        :data="userList"
        style="width: 100%">
        <el-table-column
          prop="id"
          label="ID"
          width="180">
        </el-table-column>
        <el-table-column
          prop="username"
          label="用户名">
        </el-table-column>
        <el-table-column
          prop="email"
          label="电子邮件">
        </el-table-column>
        <el-table-column
          prop="isStaff"
          label="是否为管理员"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isStaff" type="success">是</el-tag>
            <el-tag v-else type="danger">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="editUser(scope.$index)">编辑</el-button>
            <el-button type="text" @click="deleteUser(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      :title="isCreating ? '创建用户' : '修改用户'"
      :visible.sync="dialogVisible"
      width="50%">
      <el-form ref="userForm" :model="userFormData" :rules="userFormDataRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userFormData.username"></el-input>
        </el-form-item>
        <el-form-item label="电子邮件" prop="email">
          <el-input v-model="userFormData.email"></el-input>
        </el-form-item>
        <el-form-item label="是否为管理员">
          <el-radio-group v-model="userFormData.isStaff">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userFormData.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPassword">
          <el-input v-model="userFormData.checkPassword" show-password></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('userForm')">确 定</el-button>
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
import { getUserList, createUser, deleteUser, updateUser } from '@/api/user'

const DEFAULT_KNOWLEDGE_FORM = {
  username: '',
  email: '',
  isStaff: false,
  password: ''
}

export default {
  name: 'UserManager',
  data() {
    const checkEmail = (rule, value, callback) => {
      const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
      if (!value) {
        return callback(new Error('邮箱不能为空'))
      }
      setTimeout(() => {
        if (mailReg.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的邮箱格式'))
        }
      }, 100)
    }
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.userFormData.checkPassword !== '') {
          this.$refs.userForm.validateField('checkPassword')
        }
        callback()
      }
    }
    // <!--二次验证密码-->
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.userFormData.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
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
      listLoading: false,
      userFormData: {
        username: '',
        email: '',
        isStaff: false,
        password: '',
        checkPassword: ''
      },
      userFormDataRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 100,
            message: '最少3个字符，最多可输入100字符',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入email',
            trigger: 'blur'
          },
          { validator: checkEmail, trigger: 'blur' }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPassword: [
          {
            required: true,
            message: '请再次输入密码',
            trigger: 'blur'
          },
          { validator: validatePass2, trigger: 'blur' }
        ]
      },
      userList: []
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'userId'
    ])
  },
  created() {
    this.fetchUserList()
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const data = {
            'username': this.userFormData.username,
            'email': this.userFormData.email,
            'is_staff': this.userFormData.isStaff,
            'password': this.userFormData.password
          }
          if (this.isCreating) {
            console.log(data)
            createUser(data).then(() => {
              this.$message.info('创建成功')
              this.fetchUserList()
            }).catch(err => {
              this.$message.error('用户名重复')
              console.log(err)
            })
          } else {
            updateUser(this.userFormData.id, data).then(() => {
              this.fetchUserList()
            }).catch(err => {
              this.$message.error('用户名重复')
              console.log(err)
            })
          }
          this.resetForm('userForm')
          this.dialogVisible = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    deleteUser(userId) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(userId).then(() => {
          this.fetchUserList()
        }).catch(err => {
          this.$message.error('删除失败')
          console.log(err)
        })
      })
    },
    editUser(index) {
      _.assign(this.userFormData, this.userList[index])
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
      this.userList = []
      this.listLoading = true
      const params = {
        page_size: this.pagination.pageSize,
        page: this.pagination.page,
        ordering: '-id'
      }
      if (this.searchInfo) {
        params.search = this.searchInfo
      }
      getUserList(params).then(res => {
        this.pagination.total = res.value.count
        res.value.results.map(item => {
          this.userList.push({
            id: item.id,
            username: item.username,
            isStaff: item.is_staff,
            email: item.email
          })
        })
      }).catch(err => {
        this.$message.error('获取用户列表失败')
        console.log(err)
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.page = 1
      this.fetchUserList()
    },
    handleCurrentChange(page) {
      this.pagination.page = page
      this.fetchUserList()
    },
    handleSearch() {
      this.fetchUserList()
    }
  }
}
</script>

<style lang="scss" scoped>
  .user-manager-container {
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
