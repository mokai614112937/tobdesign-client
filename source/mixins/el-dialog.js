// 通过mixin增强弹框功能，弹框关闭时自动重置弹框中的表单
export default {
  props: {
    top: {
      type: String,
      default: '10vh'
    }
  },
  mounted() {
    this.$on('close', () => {
      this.$children.forEach(child => {
        if (child.validateField) {
          child.resetFields()
        }
      })
    })
  }
}
