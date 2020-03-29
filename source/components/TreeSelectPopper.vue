
<template>
  <div class="tree-wrap" @click.stop="" v-show="isOpen" :style="{
    width: width + 'px',
    top: offsetTop + height + 'px',
    left: offsetLeft + 'px'
  }">
    <div class="search-bar" @mouseenter="isSearch = true" @mouseleave="isSearch = false">
      <span class="search-name">名称：</span>
      <el-input v-model="filterText" placeholder="请输入要搜索的内容" class="tree-select-search"/>
    </div>
    <el-tree ref="catalogTree"
             :data="items"
             :props="itemsOptions"
             :node-key="itemsOptions.key"
             :current-node-key="nodeKey"
             :default-expand-all="true"
             :expand-on-click-node="false"
             :highlight-current="true"
             :render-content="renderContent"
             :filter-node-method="filterNode"
             @node-click="treeNodeClickHandler"
             class="tree-body">
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
    inputValue: {
      type: String,
      default: ''
    },
    nodeKey: {
      type: [String, Number],
      default: ''
    },
    items: {
      type: Array,
      default: function () {
        return []
      }
    },
    itemsOptions: {
      type: Object,
      default: function () {
        return {key: 'ID', label: 'name', children: 'children'}
      }
    },
    offsetTop: {
      type: Number,
      default: 0
    },
    offsetLeft: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      filterText: '',
      isSearch: false,
      width: 0,
      height: 0
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
    treeNodeClickHandler (data) {
      if (data[this.itemsOptions.key] >= 0) {
        let val = {}
        val[this.itemsOptions.label] = data[this.itemsOptions.label]
        val[this.itemsOptions.key] = data[this.itemsOptions.key]
        this.$emit('update:inputValue', val)
        this.$emit('update:isOpen', false)
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
      let params = {
        h: createElement,
        treeObj: { node, data, store }
      }
      return util.renderTreeContent(params)
    }
  },
  created () {
  },
  mounted () {
    document.body.appendChild(this.$el)

    this.width = this.$parent.$el.offsetWidth + 18
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
  .tree-select-search {
  }

  .tree-body {
    overflow: auto;
    width: 100%;
    max-height: 225px;
    margin:5px 0;
  }
</style>
