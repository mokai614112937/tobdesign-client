/* global localStorage */
import _ from 'lodash'
import Vue from 'vue'
import axios from 'axios'
import ELEMENT from 'element-ui'
import config from './config.js'
import util from './common/util.js'
import userLoginEditPwdDialog from './views/userLoginEditPwdDialog.vue'
import {setToken} from './auth.js'
_.merge(axios.defaults, config.axios)

Vue.use(ELEMENT)

axios.interceptors.response.use(res => {
  return res
}, err => {
  if (err.message.includes('code 500')) {
    util.showErrorMessageBox('服务器发生500异常，未获取到数据！')
  }
  if (err.message === 'Network Error') {
    util.showErrorMessageBox('服务器繁忙或网络错误，请检查网络是否通畅，稍后再试.')
  }
  return Promise.reject(err)
})

window.app = new Vue({
  el: '#app',
  data: {
    userName: localStorage.userName || '',
    password: '',
    serverURL: config.serverURL,
    executing: false,
    logout: '',
    modalTitle: '', // 修改密码弹窗的标题
    licenseData: {}
  },
  watch: {
    serverURL(val, oldVal) {
      axios.defaults.baseURL = val
    }
  },
  methods: {
    reset() {
      this.userName = ''
      this.password = ''
    },
    async login() {
      if (!this.userName) {
        this.$message({
          message: '用户名必须填写！',
          title: '提示',
          type: 'warning'
        })
        this.$refs.userNameRef.focus()
        return
      }
      if (!this.password) {
        this.$message({
          message: '密码必须填写！',
          title: '提示',
          type: 'error'
        })
        this.$refs.passwordRef.focus()
        return
      }
      localStorage.userName = this.userName
      localStorage.serverURL = this.serverURL
      let data = {username: this.userName, password: this.password}
      if (this.logout === 'Y') {
        data.logout = 'Y'
      }
      this.executing = true
      try {
        let res = await axios.post('/auth/login', data)
        if (res.data.status === 1) {
          if (res.data.access_token) {
            setToken(res.data.access_token)
          }
          localStorage.logined = '1'
          window.location = 'index.html'
        } else if (res.data && res.data.status === 20000) {
          this.modalTitle = '重置密码信息'
        } else if (res.data && res.data.status === 30000) {
          this.modalTitle = '初始密码信息'
        } else if (res.data.status === 10000) {
          this.executing = false
          var r = window.confirm(
            '该用户正在登录状态，可能是其他人正在使用或您上一次登录没有正常退出，是否强制注销并登录？'
          )
          if (r) {
            this.logout = 'Y'
            this.login()
          }
        } else {
          this.$message({
            message: res.data.message,
            type: 'error'
          })
          this.executing = false
        }
      } catch (err) {
        this.$message({
          message: err.message,
          type: 'error'
        })
        this.executing = false
      }
    },
    handleBlurServerURL(e) {
      if (!this.serverURL.endsWith('/')) {
        this.serverURL = this.serverURL + '/'
      }
    }
  },
  components: {
    'edit-pwd-dialog': userLoginEditPwdDialog
  }
})
