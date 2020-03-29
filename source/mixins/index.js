// mixins
import ELEMENT from 'element-ui'
import ElTableMixin from './el-table.js'
import ElPaginationOverride from './el-pagination.js'
import ElDialogOverride from './el-dialog.js'
import ElFormItemMixin from './el-form-item.js'
import ElTree from './el-tree.js'
import ElTreeNode from './el-tree-node.js'
const mixins = {
  install: Vue => {
    Object.assign(ELEMENT.Pagination.props, ElPaginationOverride.props)
    ELEMENT.Table.mixins.push(ElTableMixin) // 通过mixin增强表格功能，点击行时勾选中多选框
    // 对 el-form-item 验证增强，:verify="['NotNull', 'Number']
    Vue.component('ElFormItem').mixin(ElFormItemMixin)

    ELEMENT.Dialog.mixins.push(ElDialogOverride) // 通过mixin增强弹框功能，关闭是自动重置表单
    // Object.assign(ELEMENT.Dialog.props, ElDialogOverride.props)
    // 树节点增强
    ELEMENT.Tree.mixins.push(ElTree)
    ELEMENT.Tree.components.ElTreeNode.mixins.push(ElTreeNode)
  }
}

// 导出组件
export default mixins
