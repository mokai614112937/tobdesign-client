// 通过mixin增强表单设置当前选中的树节点
export default {
  props: {
    currentNodeId: { // 需配合default-expanded-keys参数使用
      type: [String, Number]
    }
  },
  mounted () {
    this.$on('tree-node-expanded', (treeNodeComp) => {
      let treeNode = treeNodeComp.node
      if (this.currentNodeId) {
        let currentNode = null
        if (treeNode.data.ID === this.currentNodeId) {
          currentNode = treeNode
        } else if (treeNode.childNodes.length > 0) {
          let childNodes = treeNode.childNodes
          for (let i = 0; i < childNodes.length; i++) {
            let childNode = childNodes[i]
            if (childNode.data.ID === this.currentNodeId) {
              currentNode = childNode

              break
            }
          }
        }
        if (currentNode) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.store.setCurrentNode(currentNode)
              this.$emit('after-current-node-seted', currentNode)
            }, 0)
          })
        }
      }
    })
  }
}
