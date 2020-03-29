import Toolbar from './toolbar.vue'
import Button from './el-button.vue'
import Lang from './lang.vue'

const components = {
  install: Vue => {
    Vue.component('ElToolbar', Toolbar)
    Vue.component('ElButton', Button)
    Vue.component('lang', Lang)
  }
}

// 导出组件
export default components
