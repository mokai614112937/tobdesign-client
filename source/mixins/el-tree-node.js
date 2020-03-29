// 检测节点展开事件
export default {
  watch: {
    'node.expanded' (val) {
      if (val) {
        this.tree.$emit('tree-node-expanded', this)
      }
    }
  }
}
