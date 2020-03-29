// 通过mixin增强表格功能，点击行时勾选中多选框
export default {
  props: {
    layout: {
      default: 'total, sizes, ->, prev, pager, next, jumper'
    },
    pageSizes: {
      type: Array,
      default () {
        return [10, 15, 20, 40, 100]
      }
    }
  }
}
