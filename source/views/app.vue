<template>
  <div :class="'app-wrap'+ (navBarCollapsed?' navbar-is-open':'')">
    <div class="navbar navbar-color-bg select-disable">
      <div class="navbar-header">
        <el-button type="text" @click="toggleNavbar" class="navbar-toggle">
          <i class="fa fa-align-justify"></i>
        </el-button>
        <a class="logo">
          <img src="../assets/images/product/system-logo.png" style="max-width: 150px;margin-left: 20px;"/>
        </a>
      </div>
      <div class="buttons-right">
        <el-tooltip class="item" effect="dark" content="退出登录" placement="bottom">
          <a class="fa fa-sign-out" @click="logout"></a>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="全屏" placement="bottom">
          <a class="fa fa-arrows-alt" @click="handleFullscreen"></a>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="消息" placement="bottom">
          <a class="ringer-on-navbar">
            <i class="fa fa-bell-o"></i>
            <span class="badge msg-count" :style="message.count ? '':'opacity: 0.5'">{{message.count}}</span>
          </a>
        </el-tooltip>
        <el-dropdown @command="handleCommand" style="cursor:pointer;">
          <span class="el-dropdown-link">
            {{userName}}
            <img :src="avatarPath" alt="" class="img-circle b-a b-lter" style="max-width:36px;max-height:36px;"
                 onerror="this.src='./assets/images/picture404.png';this.onerror=null;"/>
            <i class="el-icon-arrow-down f12"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="passwd">修改密码</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div class="vertical-navbar select-disable">
      <div :class="'navbar-collapse'+ (navBarCollapsed?' is-open':'')" @mouseenter="expandNavbar"
           @mouseleave="collapseNavbar">
        <el-menu theme="primary" :default-active="activeMenu">
          <template v-for="menu in menus">
            <el-menu-item v-if="menu.meta && menu.meta.title" :index="menu.path" :key="menu.path"
                          @click="onSelectMenun(menu)">
              <i :class="menu.meta.icon" class="menu-icon"></i>
              <span class="menu-title">{{menu.meta.title}}</span>
            </el-menu-item>
          </template>
        </el-menu>

      </div>
    </div>
    <router-view :key="routerName"></router-view>
    <el-dialog :close-on-click-modal="false" title="修改密码" :visible.sync="modifyPasswordModal"
               class="modify-password-dialog">
      <el-form :model="temp" :rules="tempRules" ref="modifyPasswordForm" label-width="100px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input type="password" v-model="temp.oldPassword" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input type="password" v-model="temp.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="repeatPassword">
          <el-input type="password" v-model="temp.repeatPassword" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="modifyPasswordModal = false">取 消</el-button>
        <el-button type="primary" @click="modifyPasswordHandler" :loading="handlerLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import routes from '../router/routes.js'
import TreeSelect from '../components/TreeSelect.vue'
import util from '../common/util.js'
import {removeToken} from '../auth.js'

export default {
  data() {
    let routePath = location.hash.substr(1)
    if (routePath && routePath.split('/').length > 2) {
      routePath = routePath
        .split('/')
        .slice(0, 2)
        .join('/')
    }
    return {
      userName: localStorage.userName || 'anonymous',
      routerName: this.$route.name || '/',
      menus: routes,
      activeMenu: routePath,
      navBarCollapsed: false, // 导航是否展开
      modifyPasswordModal: false,
      frontAppContext: window.app.frontAppContext,
      passwordVerify: {
        maxLen: 18,
        minLen: 5
      },
      handlerLoading: false,
      temp: {
        oldPassword: '',
        password: '',
        repeatPassword: ''
      },
      tempRules: {
        oldPassword: [{required: true, message: '请输入当前密码', trigger: 'blur'}],
        password: [
          {required: true, message: '请输入新密码', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (value.length < this.passwordVerify.minLen || value.length > this.passwordVerify.maxLen) {
                callback(new Error(`必须是${this.passwordVerify.minLen}-${this.passwordVerify.maxLen}位的字符`))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        repeatPassword: [
          {required: true, message: '请重复输入一次新密码', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (value !== this.temp.password) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      message: {
        count: 0
      },
      fullScreened: false // 是否为全屏
    }
  },
  computed: {
    avatarPath() {
      return util.url.join(window.SERVER, '/avatar/' + this.userName)
    }
  },
  components: {
    'tree-select': TreeSelect
  },
  async created() {
    let self = this
    // 监听全屏切换事件
    document.addEventListener('fullscreenchange', function () {
      self.fullScreened = !self.fullScreened
    })
    document.addEventListener('mozfullscreenchange', function () {
      self.fullScreened = !self.fullScreened
    })
    document.addEventListener('webkitfullscreenchange', function () {
      self.fullScreened = !self.fullScreened
    })
    document.addEventListener('msfullscreenchange', function () {
      self.fullScreened = !self.fullScreened
    })

    let res = await axios.get('/message/unread')
    this.message = res.data.data
  },
  watch: {
    '$route.name'(val, oldVal) {
      this.routerName = this.$route.name || '/'
    }
  },
  methods: {
    // 切换全屏
    handleFullscreen() {
      var bd = document.body
      this.fullScreened ? document.exitFullscreen ? document.exitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen ? document.webkitCancelFullScreen() : document.msExitFullscreen && document.msExitFullscreen() : bd.requestFullscreen ? bd.requestFullscreen() : bd.mozRequestFullScreen ? bd.mozRequestFullScreen() : bd.webkitRequestFullScreen ? bd.webkitRequestFullScreen() : bd.msRequestFullscreen && bd.msRequestFullscreen()
    },
    onSelectMenun(menu) {
      let hash = (menu.children && menu.children.length && menu.children[0].path) || ''
      if (hash.charAt(0) !== '/') {
        hash = '/' + hash
      }
      if (hash.indexOf(menu.path) === -1) {
        hash = menu.path + hash
      }
      window.location.hash = hash
      localStorage.lastRoutePath = hash
    },
    toggleNavbar() {
      this.navBarCollapsed = !this.navBarCollapsed
    },
    expandNavbar() {
      let self = this
      this.hoverIntent = setTimeout(_ => {
        self.navBarCollapsed = true
      }, 200)
    },
    collapseNavbar() {
      if (this.hoverIntent) {
        clearTimeout(this.hoverIntent)
      }
      this.navBarCollapsed = false
    },
    async logout() {
      await axios.get('/member/logout')
      localStorage.removeItem('logined')
      localStorage.removeItem('realName')
      localStorage.removeItem('adminUserName')
      removeToken()
      location.href = 'login.html'
    },
    async handleCommand(cmd) {
      if (cmd === 'logout') {
        this.logout()
      }
      if (cmd === 'passwd') {
        this.temp = {
          oldPassword: '',
          password: '',
          repeatPassword: ''
        }
        this.modifyPasswordModal = true
      }
    },
    async modifyPasswordHandler() {
      try {
        await util.validateForm(this.$refs['modifyPasswordForm'])
      } catch (e) {
        util.showErrorNotification(e)
        this.handlerLoading = false
        return
      }

      if (this.temp.oldPassword === this.temp.password) {
        util.showWarningMessageBox('原始密码与新密码相同，请输入新密码')
        return
      }

      this.handlerLoading = true
      let res = await axios.put('/application/password', this.temp)
      this.handlerLoading = false
      if (res.data.status === 1) {
        this.modifyPasswordModal = false
        this.temp = {
          oldPassword: '',
          password: '',
          repeatPassword: ''
        }
        try {
          await this.$confirm(`密码修改成功，请退出重新登录！`, '提示', {
            confirmButtonText: '确定',
            showCancelButton: false,
            showClose: false,
            type: 'warning'
          })
          this.logout()
        } catch (e) {
        }
      } else {
        util.showResponseMessage(res.data)
      }
    },
    jump() {
      window.location.href = this.frontAppContext
    }

  }
}
</script>

<style scoped>
  .app-wrap {
    width: 100%;
    height: 100%;
    position: relative;
    overflow-x: hidden;
    background-color: #f6f7f9;
  }

  .vertical-navbar {
    position: fixed;
    left: 0;
    top: 55px;
    bottom: 0;
    z-index: 103;
    background-color: #1960bc;
    /* box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.1), inset -1px 0 2px rgba(0, 0, 0, 0.1); */
  }

  .vertical-navbar .navbar-collapse {
    position: relative;
    padding: 0;
    width: 50px;
    overflow: hidden;
    transition: width ease 0.3s;
  }

  .vertical-navbar .el-menu {
    border-right: 0 none;
    background-color: transparent;
  }

  .vertical-navbar .el-menu .el-menu-item {
    height: 50px;
    line-height: 50px;
    padding: 0 14px;
    font-size: 14px;
  }

  .vertical-navbar .el-menu .el-menu-item,
  .vertical-navbar .el-menu .el-menu-item i {
    color: #A3CCC2;
  }

  .vertical-navbar .el-menu .el-menu-item:hover,
  .vertical-navbar .el-menu .el-menu-item:hover i,
  .vertical-navbar .el-menu .el-menu-item.is-active,
  .vertical-navbar .el-menu .el-menu-item.is-active i {
    color: #fff;
  }

  .navbar-collapse .menu-icon {
    width: 20px;
  }

  .navbar-collapse .menu-title {
    visibility: hidden;
  }

  .vertical-navbar .el-menu .el-menu-item:hover, .vertical-navbar .el-menu .el-menu-item:focus {
    background-color: #4CE0BE;
    border-bottom: 0px solid #1ACEA4;
  }

  .vertical-navbar .el-menu .el-menu-item.is-active:hover,
  .vertical-navbar .el-menu .el-menu-item.is-active {
    border-bottom: 0px solid #1ACEA4;
  }

  .navbar-collapse.is-open {
    width: 150px;
  }

  .navbar-collapse.is-open .menu-title {
    visibility: visible;
  }

  .navbar {
    height: 55px;
    line-height: 55px;
    padding: 0;
    border: 0;
    border-radius: 0;
    position: relative;
    /* box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.1), inset 0 -1px 2px rgba(0, 0, 0, 0.1); */
    z-index: 101;
  }

  .logo {
    padding-left: 0;
    width: 300px;
    max-width: 300px;
    display: inline-block;
    height: 55px;
    vertical-align: middle;
    font-size: 0px;
    display: table-cell;
    border-radius: 0;
  }

  .buttons-left {
    float: left;
    position: relative;
    z-index: 103;
    padding-left: 46px;
  }

  .buttons-right {
    text-align: right;
    float: right;
    position: relative;
    z-index: 103;
    padding-right: 15px;
  }

  .buttons-right > a,
  .buttons-right button {
    padding: 8px;
  }

  .buttons-right .fa {
    font-size: 124%;
  }

  @media (max-width: 576px) {
    .navbar-collapse {
      z-index: 102;
      transition: all 0.3s;
    }

    .logo {
      background-color: transparent;
    }

    .buttons-right {
      display: none;
    }

    .navbar-toggle {
      width: 55px;
      line-height: 30px;
    }

    .navbar-collapse.is-open .el-menu--horizontal .el-menu-item {
      float: none;
      border-bottom-width: 1px;
    }
  }

  @media (min-width: 576px) {
    .navbar-toggle {
      display: none;
    }
  }

  .visible-on-mobile.el-menu .el-menu-item {
    padding-left: 40px;
  }

  .msg-count {
    background-color: #ff6f4b;
    position: relative;
    top: -10px;
    left: -10px;
    margin-right: -5px;
    font-weight: 400;
    transform: scale(0.75, 0.75);
  }

  .el-dropdown-link {
    padding: 10px 0;
  }
</style>
<style>
  .modify-password-dialog .el-dialog {
    width: 400px;
  }

  @media (max-width: 480px) {
    .modify-password-dialog .el-dialog {
      width: 96%;
    }
  }

  .navbar-is-open .layout-row-main {
    left: 150px;
  }

  .site-selector {
    margin-right: 10px;
  }

  .site-selector .el-input__inner {
    background-color: transparent;
    border-color: #bfcbd9;
    color: #eef;
    border-radius: 20px;
    height: 28px;
    font-size: 12px;
  }
</style>
