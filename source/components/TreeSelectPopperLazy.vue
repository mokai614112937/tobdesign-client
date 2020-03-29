<template>
  <div class="tree-wrap" @click.stop="" v-show="isOpen" :style="{
    width: width + 'px',
    top: offsetTop + height + 'px',
    left: offsetLeft + 'px'
    }">
    <div class="search-bar" @mouseenter="isSearch = true" @mouseleave="isSearch = false">
      <span class="search-name">名称：</span>
      <el-input v-model="filterText" placeholder="请输入要搜索的内容" class="tree-select-search"></el-input>
    </div>
    <el-tree
      class="tree-body"
      :props="itemsOptions"
      node-key="ID"
      :render-content="renderContent"
      :current-node-key="nodeKey"
      lazy
      :load="loadTreeNodeData"
      :default-expanded-keys="expandedKeys"
      :highlight-current="true"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      ref="catalogTree"
      @node-click="treeNodeClickHandler"
    >
    </el-tree>
  </div>
</template>

<script>
import util from '../common/util.js'
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    nodeKey: {
      type: [String, Number],
      default: ''
    },
    apiUrl: {
      type: String,
      default: ''
    }, // 接口路径
    itemsOptions: {
      type: Object,
      default: function () {
        return {key: 'ID', label: 'name', children: 'children', isLeaf: 'isLeaf'}
      }
    },
    dimensionId: {
      type: [String, Number],
      default: ''
    },
    parentId: {
      type: [String, Number],
      default: ''
    },
    contentType: {
      type: String,
      default: ''
    },
    contentTypeIcon: {
      type: String,
      default: 'fa fa-folder'
    },
    offsetTop: {
      type: Number,
      default: 0
    },
    offsetLeft: {
      type: Number,
      default: 0
    },
    disableRoot: {
      type: Boolean,
      default: false
    },
    selfBuiltPlatform: { // 是否展示平台自建栏目
      type: String,
      default: 'Y'
    },
    // 是否获取所有父级节点（针对人员所属企业下拉框处理）
    fullParent: {
      type: Boolean,
      default: false
    },
    // 选择的企业id
    enterpriseId: {
      type: [Number, String],
      default: 0,
      required: false
    }
  },
  data () {
    return {
      filterText: '',
      isSearch: false,
      width: 0,
      height: 0,
      expandedKeys: [0],
      parentID: 0,
      enterpriseNameFullPath: ''
    }
  },
  watch: {
    filterText (val) {
      this.$refs.catalogTree.filter(val)
    },
    isOpen (val) {
      if (!val) {
        this.filterText = ''
      }
    }
  },
  computed: {},
  methods: {
    treeNodeClickHandler (data, nodeData) {
      if (this.disableRoot && data.ID === 0) {
        return
      }
      // 节点不可点击
      if (data.disabled || (data.ID === 0)) {
        return
      }
      if (data[this.itemsOptions.key] >= -1) {
        this.enterpriseNameFullPath = ''
        let val = {}
        val[this.itemsOptions.label] = data[this.itemsOptions.label]
        val[this.itemsOptions.key] = data[this.itemsOptions.key]
        this.$emit('updateCatalogName', val[this.itemsOptions.label])
        this.$emit('update:isOpen', false)
        if (this.fullParent) { // 获取所有父级
          this.findTreeParent(nodeData)
          data.parentName = this.enterpriseNameFullPath
        } else { // 获取一个父级
          if ((data.ID !== 0) && (data.parentID !== 0)) {
            let parentName = this.$refs.catalogTree.getNode(data.parentID).data.name
            data.parentName = parentName
          }
        }
        // this.isOpenTree = false
        // 选中节点后返回回调函数click-change并附带选中节点的数据对象
        this.$emit('click-change', Object.assign({}, data))
      }
    },
    filterNode (value, data) {
      if (!value) return true
      value = value.toLowerCase()
      let name = data[this.itemsOptions.label].toLowerCase()
      return (
        name.indexOf(value) !== -1 ||
          util.getSpell(name, true).indexOf(value) !== -1
      )
    },
    renderContent: function (createElement, {node, data, store}) {
      // let className = data.ID === 0 ? 'fa fa-desktop' : this.contentTypeIcon
      let className = ''
      if (data.ID === 0) {
        className = 'fa fa-desktop'
      } else if (data.isIndependent === 1) { // 非独立是部门
        className = 'fa fa-address-card'
      } else {
        className = this.contentTypeIcon || 'fa fa-folder'
      }
      let icon = createElement('i', { attrs: { class: className } })
      let label = createElement('span', { domProps: {innerHTML: ' ' + node.label}, attrs: { title: node.label } })
      return createElement('span', {attrs: {class: 'tree-label-css'}}, [icon, label])
    },
    async loadTreeNodeData (node, resolve) {
      let params = {contentType: this.contentType, dimensionID: this.dimensionId}
      if (this.enterpriseId) {
        params.enterpriseID = this.enterpriseId
      }
      if (this.selfBuiltPlatform === 'N') { // 企业树不展示平台自建栏目
        params.selfBuiltPlatform = this.selfBuiltPlatform
      }
      if (this.parentID && this.parentID !== 0) {
        params.parentID = this.parentID
        params.containsParent = 'Y'
        this.parentID = 0
      } else if (node.data && (node.data.ID || node.data.ID === 0)) {
        params.parentID = node.data.ID
      } else {
        params.isRoot = 'Y'
        this.parentID = this.parentId
      }
      if (this.fullParent) { // 企业默认展开两级
        params.level = 2
      }
      let res = await axios.get(this.apiUrl, { params })
      let catalogData = res.data.data
      resolve(catalogData)
      if (node.data && node.data.ID === 0) {
        this.$nextTick(function () {
          let subNodes = this.$refs.catalogTree && this.$refs.catalogTree.root ? this.$refs.catalogTree.root.childNodes[0].childNodes : []
          for (let i = 0; i < subNodes.length; i++) {
            let pNode = subNodes[i]
            if (pNode.data && pNode.data.children && pNode.data.children.length > 0) {
              pNode.loaded = true
              pNode.doCreateChildren(pNode.data.children)
              pNode.expand()
            }
          }
        })
      }
    },
    /** 遍历获取所有父级节点
     * 返回格式：xxx>xxx>xxx***/
    findTreeParent(nodeData) {
      if (nodeData.data.parentID !== 0) {
        let node = this.$refs.catalogTree.getNode(nodeData.data.parentID)
        this.enterpriseNameFullPath = this.enterpriseNameFullPath ? (node.data.name + ' > ' + this.enterpriseNameFullPath) : node.data.name
        this.findTreeParent(node)
      }
    }
  },
  created () {
  },
  mounted () {
    document.body.appendChild(this.$el)

    // this.width = this.$parent.$el.offsetWidth + 18
    this.width = this.$parent.$el.offsetWidth - 6
    this.height = this.$parent.$el.offsetHeight || 32

    util.mousewheel(this.$el, (e) => {
      e.stopPropagation()
    })

    util.mousewheel(document, () => {
      this.$emit('update:isOpen', false)
    })
  },
  destroyed () {
    this.$el.parentNode.removeChild(this.$el)
  }
}
</script>
<style scoped>
  .tree-wrap {
    position: absolute;
    z-index: 10000;
    top: 42px;
    left: 1px;
    right: 1px;
    width: 100%;
    min-width: 214px;
    /*max-height: 270px;*/
    background-color: #fff;
    color: #444;
    border: 1px solid #d1dbe5;
    border-radius: 3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  }
  .search-bar {
    cursor: auto;
    width: 100%;
    padding: 5px;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
  }
  .search-name{
    width: 52px;
  }
  .tree-body {
    overflow: auto;
    width: 100%;
    max-height: 400px;
    margin:5px 0;
  }
</style>
