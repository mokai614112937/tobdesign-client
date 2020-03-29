/* global axiosMock localStorage location */
import _ from 'lodash'
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import ELEMENT from 'element-ui'
import VueLazyload from 'vue-lazyload'
import config from './config.js'
import menus from './router/routes.js'
import util from './common/util.js'
import routes from './router/index.js'
import components from './components/index.js'
import directives from './directives/index.js'
import filters from './filters/index.js'
import MixinELEMENT from './mixins/index.js'
import { getToken } from './auth.js'
import main from './views/app.vue'
Vue.use(VueRouter)
Vue.use(MixinELEMENT)
Vue.use(ELEMENT)
Vue.use(VueI18n)
Vue.use(components)
Vue.use(directives)
Vue.use(filters)
Vue.use(VueLazyload)
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: 'dist/error.png',
  loading: 'dist/loading.gif',
  attempt: 1
})
if (window.NODE_ENV === 'dev') {
  Vue.config.devtools = true
}
window.SERVER = config.serverURL
_.merge(axios.defaults, config.axios)

axios.interceptors.request.use(
  config => {
    let token = getToken()
    if (token && (token !== 'undefined')) {
      config.headers.Authorization = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    console.log(error) // for debug
    Promise.reject(error)
  }
)
axios.interceptors.response.use(res => {
  return res
}, err => {
  if (err.message.includes('code 403')) {
    util.showErrorNotification('用户没有该模块的权限！')
    return
  }
  if (err.message.includes('code 401')) {
    window.location.href = 'login.html'
    localStorage.removeItem('course_privilege_cache')
    localStorage.removeItem('tk_privilege_cache')
    return
  }
  if (err.message.includes('code 500')) {
    util.showErrorMessageBox('服务器发生500异常，未获取到数据！')
  }
  if (err.message === 'Network Error') {
    util.showErrorMessageBox('服务器繁忙或网络错误，请检查网络是否通畅，稍后再试.')
  }
  return Promise.reject(err)
})

VueRouter.removeMenu = (routePath) => {
  for (let i = menus.length - 1; i >= 0; i--) {
    let menu = menus[i]
    if (menu.path === routePath) {
      menus.splice(i, 1)
    } else if (menu.children) {
      for (let j = menu.length - 1; j >= 0; j--) {
        if (menu[i].path === routePath) {
          menu[i].splice(j, 1)
        }
      }
    }
  }
  for (let i = routes.length - 1; i >= 0; i--) {
    let route = routes[i]
    if (route.path === routePath) {
      routes.splice(i, 1)
    } else if (route.children) {
      for (let j = route.length - 1; j >= 0; j--) {
        if (route[i].path === routePath) {
          route[i].splice(j, 1)
        }
      }
    }
  }
}

VueRouter.insertMenu = (menuConfig, index) => {
  if (!menuConfig.meta) {
    menuConfig.meta = {}
  }
  if (!menuConfig.meta.title && menuConfig.title) {
    menuConfig.meta.title = menuConfig.title
  }
  const routeConfig = menuConfig
  menuConfig = JSON.parse(JSON.stringify(menuConfig))
  menus.splice(index, 0, menuConfig)
  routes.splice(index, 0, routeConfig)
}

VueRouter.insertSubMenus = (menusConfig, parentRoutePath, index) => {
  if (!Array.isArray(menusConfig)) {
    menusConfig = [menusConfig]
  }
  for (let menuConfig of menusConfig) {
    if (!menuConfig.meta) {
      menuConfig.meta = {}
    }
    if (!menuConfig.meta.title && menuConfig.title) {
      menuConfig.meta.title = menuConfig.title
    }
  }
  const routesConfig = menusConfig
  menusConfig = JSON.parse(JSON.stringify(menusConfig))
  const parentMenu = menus.find(item => item.path === parentRoutePath)
  const parentRoute = routes.find(item => item.path === parentRoutePath)
  if (parentMenu && !parentMenu.children) {
    parentMenu.children = []
  }
  if (parentRoute && !parentRoute.children) {
    parentRoute.children = []
  }
  if (parentMenu) {
    parentMenu.children.splice.apply(parentMenu.children, [index, 0].concat(menusConfig))
  }
  if (parentRoute) {
    parentRoute.children.splice.apply(parentRoute.children, [index, 0].concat(routesConfig))
  }
}

window.appInit = async _ => {
  axiosMock.onAny().passThrough()

  let appBeforeInstantiateRouter = document.createEvent('Event')
  appBeforeInstantiateRouter.initEvent('appbeforeinstantiaterouter', true, true)
  document.dispatchEvent(appBeforeInstantiateRouter)
  const router = new VueRouter({
    mode: 'hash',
    routes: routes
  })
  router.beforeEach((to, from, next) => {
    if (to.matched.length === 0) {
      let t = util.getParentRoutePath(routes, to.path)
      next(t || '/404')
    } else {
      util.title(to.meta.title)
      next()
    }
  })
  router.afterEach((to, from, next) => {
    window.scrollTo(0, 0)
  })
  let appBeforeCreateEvent = document.createEvent('Event')
  appBeforeCreateEvent.initEvent('appbeforecreate', true, true)
  let appCreatedEvent = document.createEvent('Event')
  appCreatedEvent.initEvent('appcreated', true, true)
  let appBeforeMountEvent = document.createEvent('Event')
  appBeforeMountEvent.initEvent('appbeforemount', true, true)
  let appMountedEvent = document.createEvent('Event')
  appMountedEvent.initEvent('appmounted', true, true)

  window.app = new Vue({
    data: {},
    watch: {
    },
    beforeCreate() {
      window.app = this
      document.dispatchEvent(appBeforeCreateEvent)
    },
    created() {
      document.dispatchEvent(appCreatedEvent)
    },
    beforeMount() {
      document.dispatchEvent(appBeforeMountEvent)
    },
    mounted() {
      document.dispatchEvent(appMountedEvent)
    },
    el: '#app',
    router: router,
    render: h => h(main)
  })
}
window.addEventListener('load', window.appInit, false)
