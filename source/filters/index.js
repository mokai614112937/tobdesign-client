import format from './format.js'
import charWidth from './charWidth.js'

const filters = {
  install: Vue => {
    Vue.filter('format', format)
    Vue.filter('charWidth',charWidth)
  }
}

// 导出组件
export default filters
