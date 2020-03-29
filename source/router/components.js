// 会被编译到本app.js中的组件
const components = {
  '_samples/index': require('../views/_samples/index.vue').default,
  '_samples/vueditor': require('../views/_samples/vueditor.vue').default,
  'error/notFound404': require('../views/error/notFound404.vue').default,
  'platform/index': require('../views/platform/index.vue').default,
  'platform/systemInfo': require('../views/platform/systemInfo.vue').default
}
export default components
