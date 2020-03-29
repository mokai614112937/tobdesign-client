<template>
<div class="unlock-screen-back" v-show="_showUnlock">
  <div class="unlock-con">
    <transition name="show-unlock">
        <div class="unlock-body-con" @keydown.enter="handleUnlock">
            <div @click="handleClickAvator" class="unlock-avator-con" :style="{marginLeft: avatorLeft}">
                <img class="unlock-avator-img" :src="avatorPath">
                <div  class="unlock-avator-cover">
                    <span><i class="fa fa-unlock-alt f30"></i></span>
                    <p>解锁</p>
                </div>
            </div>
            <div class="unlock-avator-under-back" :style="{marginLeft: avatorLeft}"></div>
            <div class="unlock-input-con">
                <div class="unlock-input-overflow-con">
                    <div class="unlock-overflow-body" :style="{right: inputLeft}">
                        <input ref="inputEle" v-model="password" class="unlock-input" type="password" placeholder="密码同登录密码" />
                        <button ref="unlockBtn" @mousedown="unlockMousedown" @mouseup="unlockMouseup" @click="handleUnlock" class="unlock-btn"><i class="fa fa-key"></i></button>
                    </div>
                </div>
            </div>
            <div class="unlock-locking-tip-con">已锁定</div>
        </div>
    </transition>
  </div>
</div>
</template>
<script>
import util from '../common/util.js'

export default {
  data() {
    return {
      avatorLeft: '0px',
      inputLeft: '400px',
      password: '',
      check: null
    }
  },
  props: {
    showUnlock: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    _showUnlock: {
      get() {
        return this.showUnlock
      },
      set(val) {
        this.$emit('update:showUnlock', val)
      }
    },
    avatorPath() {
      return util.url.join(window.SERVER, '/avatar/' + localStorage.userName)
    }
  },
  watch: {
    showUnlock(val) {
      if (val) {
        this.lockScreen()
      }
    }
  },
  mounted() {
    let lockScreenBack
    if (!document.getElementById('lockScreenBack')) {
      let lockdiv = document.createElement('div')
      lockdiv.setAttribute('id', 'lockScreenBack')
      lockdiv.setAttribute('class', 'lock-screen-back')
      document.body.appendChild(lockdiv)
      lockScreenBack = document.getElementById('lockScreenBack')
      window.addEventListener('resize', () => {
        let size = this.setLockBackSize()
        this.lockScreenSize = size
        lockScreenBack.style.transition = 'all 0s'
        lockScreenBack.style.width = lockScreenBack.style.height = size + 'px'
      })
    } else {
      lockScreenBack = document.getElementById('lockScreenBack')
    }
    let size = this.setLockBackSize()
    this.lockScreenSize = size
    lockScreenBack.style.transition = 'all 3s'
    lockScreenBack.style.width = lockScreenBack.style.height = size + 'px'
    lockScreenBack.style.zIndex = -1
  },
  methods: {
    setLockBackSize() {
      let x = document.body.clientWidth
      let y = document.body.clientHeight
      let r = Math.sqrt(x * x + y * y)
      return parseInt(r)
    },
    lockScreen() {
      let lockScreenBack = document.getElementById('lockScreenBack')
      lockScreenBack.style.transition = 'all 3s'
      lockScreenBack.style.zIndex = 1000
      lockScreenBack.style.boxShadow = '0 0 0 ' + this.setLockBackSize() + 'px #667aa6 inset'
      localStorage.lastRoutePath = this.$route.path // 本地存储锁屏之前打开的页面以便解锁后打开
      setTimeout(() => {
        lockScreenBack.style.transition = 'all 0s'
        this.$router.push({
          path: '/locking'
        })
      }, 800)
      localStorage.locking = '1'
    },
    handleUnlockOK() {
      let lockScreenBack = document.getElementById('lockScreenBack')
      this._showUnlock = false
      lockScreenBack.style.zIndex = -1
      lockScreenBack.style.boxShadow = '0 0 0 0 #667aa6 inset'
      this.$router.push({
        path: localStorage.lastRoutePath // 解锁之后跳转到锁屏之前的页面
      })
    },
    handleClickAvator() {
      this.avatorLeft = '-140px'
      this.inputLeft = '0px'
      this.$refs.inputEle.focus()
    },
    async handleUnlock() {
      if (!this.password) {
        this.$message({
          message: '请输入密码解锁！',
          type: 'error'
        })
        return
      }
      let res = await axios.post('/loginwithoutname', {password: this.password})
      if (res && res.data && res.data.status === 1) {
        this.avatorLeft = '0px'
        this.inputLeft = '400px'
        this.password = ''
        localStorage.locking = '0'
        this.$emit('on-unlock')
        this.handleUnlockOK()
      } else {
        this.$message({
          message: res.data.message,
          type: 'error'
        })
      }
    },
    unlockMousedown() {
      this.$refs.unlockBtn.className = 'unlock-btn click-unlock-btn'
    },
    unlockMouseup() {
      this.$refs.unlockBtn.className = 'unlock-btn'
    }
  }
}
</script>
<style>
.lock-screen-back {
  border-radius: 50%;
  z-index: -1;
  box-shadow: inset 0 0 0 0 #667aa6;
  position: fixed;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  transition: all 3s;
}
</style>
<style scoped>
.unlock-screen-back {
  width: 100%;
  height: 100%;
  background: #1960bc;
  position: fixed;
  z-index: 1001;
  top: 0;
  left: 0;
}
.unlock-body-con {
  position: absolute;
  width: 400px;
  height: 100px;
  left: 50%;
  top: 50%;
  margin-left: -200px;
  margin-top: -200px;
  -webkit-transform-origin: center center;
  transform-origin: center center;
  z-index: 10;
}

.unlock-body-con .unlock-avator-con {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  box-sizing: border-box;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  cursor: pointer;
  transition: all 0.5s;
  z-index: 12;
}

.unlock-body-con .unlock-avator-con .unlock-avator-img {
  width: 100%;
  height: 100%;
  display: block;
  z-index: 7;
}

.unlock-body-con .unlock-avator-con .unlock-avator-cover {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1160;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
}

.unlock-body-con .unlock-avator-con .unlock-avator-cover span {
  display: block;
  margin: 20px auto 5px;
  text-align: center;
}

.unlock-body-con .unlock-avator-con .unlock-avator-cover p {
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

.unlock-body-con .unlock-avator-con:hover .unlock-avator-cover {
  opacity: 1;
  transition: opacity 0.2s;
}

.unlock-body-con .unlock-avator-under-back {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-45px, -50%);
  transform: translate(-45px, -50%);
  box-sizing: border-box;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  transition: all 0.5s;
  z-index: 5;
}

.unlock-body-con .unlock-input-con {
  position: absolute;
  height: 70px;
  width: 300px;
  top: 15px;
  right: 0;
}

.unlock-body-con .unlock-input-con .unlock-input-overflow-con {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  overflow: hidden;
}

.unlock-body-con .unlock-input-con .unlock-input-overflow-con .unlock-overflow-body {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  transition: all 0.5s ease 0.5s;
}

.unlock-body-con .unlock-input-con .unlock-input-overflow-con .unlock-overflow-body .unlock-input {
  float: left;
  display: block;
  box-sizing: content-box;
  height: 19px;
  width: 175px;
  font-size: 16px;
  outline: none;
  padding: 11px 10px 11px 30px;
  border: 2px solid #e2ddde;
  margin-top: 10px;
}

.unlock-body-con .unlock-input-con .unlock-input-overflow-con .unlock-overflow-body .unlock-btn {
  float: left;
  display: block;
  font-size: 18px;
  padding: 7px 30px;
  cursor: pointer;
  border-radius: 0 25px 25px 0;
  border: 2px solid #e2ddde;
  border-left: none;
  background: #4780c9;
  outline: none;
  transition: all 0.2s;
  margin-top: 10px;
  color: #fff;
}

.unlock-body-con .unlock-input-con .unlock-input-overflow-con .unlock-overflow-body .unlock-btn:hover {
  background: #4780c9;
}

.unlock-body-con .unlock-input-con .unlock-input-overflow-con .unlock-overflow-body .click-unlock-btn {
  background: #1960bc!important;
}

.unlock-body-con .unlock-locking-tip-con {
  width: 100px;
  height: 30px;
  text-align: center;
  position: absolute;
  left: 50%;
  margin-left: -50px;
  bottom: -80px;
  color: #fff;
  font-size: 16px;
}

@-webkit-keyframes unlock-in {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }

  80% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }

  88% {
    -webkit-transform: scale(1.3);
    transform: scale(1.3);
  }

  to {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

@keyframes unlock-in {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }

  80% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }

  88% {
    -webkit-transform: scale(1.3);
    transform: scale(1.3);
  }

  to {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

@-webkit-keyframes unlock-out {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }

  60% {
    -webkit-transform: scale(1.2);
    transform: scale(1.2);
  }

  to {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
}

@keyframes unlock-out {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }

  60% {
    -webkit-transform: scale(1.2);
    transform: scale(1.2);
  }

  to {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
}

.show-unlock-enter-active {
  -webkit-animation: unlock-in 1.4s ease;
  animation: unlock-in 1.4s ease;
}

.show-unlock-leave-to {
  opacity: 0;
}

.show-unlock-leave-active {
  transition: opacity 0.2s;
}
.unlock-con {
  width: 100%;
  height: 100%;
}
</style>
