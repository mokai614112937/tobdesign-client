<template>
   <!--修改密码框-->
   <el-dialog :close-on-click-modal="false"  :title="modalTitle" :visible.sync="editPwdModal" @open="dialogOpen">
    <el-form :model="tmpUser" :rules="userRules" ref="modifyPasswordForm" label-width="100px">
      <el-form-item label="用户名" prop="userName">
        <el-input type="text" v-model="userName" :readonly="true"  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="原密码" prop="oldPassword">
        <el-input type="password" v-model="tmpUser.oldPassword"  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="tmpUser.password" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="repeatPassword">
        <el-input type="password" v-model="tmpUser.repeatPassword" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="editPwdModal = false">取 消</el-button>
      <el-button type="primary" @click="modifyPasswordHandler" :loading="handlerLoading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import util from './../common/util.js'

export default {
  props: { editPwdModal: Boolean, modalTitle: String, userName: String },
  data() {
    return {
      tmpUser: {},
      passwordVeriry: {
        maxLen: 18,
        minLen: 5
      },
      userRules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value.length < this.passwordVeriry.minLen || value.length > this.passwordVeriry.maxLen) {
                callback(new Error(`必须是${this.passwordVeriry.minLen}-${this.passwordVeriry.maxLen}位的字符`))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        repeatPassword: [
          { required: true, message: '请重复输入一次密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.tmpUser.password) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      handlerLoading: false
    }
  },
  methods: {
    dialogOpen() {
      this.handlerLoading = false
      this.initPwdCheck()
    },
    async initPwdCheck() {
      let res = await axios.get('/users/initpwdcheck')
      if (res.data.status === 1) {
        this.passwordVeriry = {maxLen: res.data.maxLen, minLen: res.data.minLen}
      }
    },
    async modifyPasswordHandler() {
      this.handlerLoading = true
      try {
        await util.validateForm(this.$refs['modifyPasswordForm'])
      } catch (e) {
        this.handlerLoading = false
        return
      }
      let res = await axios.put('/user/changeloginpassword', {
        userName: this.userName,
        oldPassword: this.tmpUser.oldPassword,
        password: this.tmpUser.password
      })
      if (res.data.status === 1 && res.data.data && res.data.data._ZVING_STATUS > 0) {
        window.location = 'index.html'
      } else {
        util.showErrorMessageBox(res.data.data._ZVING_MESSAGE)
        localStorage.removeItem('course_privilege_cache')
        localStorage.removeItem('tk_privilege_cache')
        window.location = 'login.html'
      }
      this.editPwdModal = false
      this.handlerLoading = false
    }
  }
}
</script>
