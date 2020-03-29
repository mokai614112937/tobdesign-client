<template>
  <div class="wrapper">
    <p class="no-data" v-if="data.length === 0">暂无数据</p>
    <div v-else>
      <p class="title" @click="handleTitleClick">{{nodes[props.label]}}</p>
      <ul class="root-stage" v-if="!isMenu">
        <catalog-tree-node  :node="node" :props="props"  :level1="level1" :active="active" v-for="node in nodes" :key="node[props.key]"></catalog-tree-node>
      </ul>
      <ul class="root-stage" v-else>
        <menu-tree-node  :node="node" :props="props" :expandLevel="expandLevel" :level1="level1" :active="active" v-for="node in nodes" :key="node[props.key]"></menu-tree-node>
      </ul>
    </div>
  </div>
</template>

<script>
import CatalogTreeNode from './CatalogTreeNode.vue'
import MenuTreeNode from './MenuTreeNode.vue'
export default {
  name: 'CatalogTree',
  componentName: 'CatalogTree',
  components: {
    'catalog-tree-node': CatalogTreeNode,
    'menu-tree-node': MenuTreeNode
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    props: {
      type: Object,
      default: function () {
        return {
          children: 'children',
          label: 'name',
          key: 'ID',
          traceback: 'innerCode' // 可用来回溯父节点的属性
        }
      }
    },
    nodeActive: {
      type: [String, Number],
      default: ''
    },
    lazy: {
      type: Function
    },
    level1: {
      type: Boolean,
      default: true
    },
    isMenu: {
      type: Boolean,
      default: false
    },
    clearSelect: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      active: null,
      expandLevel: 10
    }
  },
  created () {
    this.$on('node-click', (nodeData, node) => {
      let obj = {}
      obj[this.props.key] = nodeData[this.props.key]
      this.active = obj
      this.$emit('current-change', nodeData, node)
    })
  },
  computed: {
    nodes () {
      if (this.data.length) {
        return this.data
      }
      return {}
    }
  },
  watch: {
    nodeActive(val) {
      if (val) {
        let obj = {}
        obj[this.props.key] = val
        this.active = obj
      }
    },
    clearSelect(val) {
      if (val) {
        this.setCurrentNode()
      }
    }
  },
  methods: {
    // {Number|Object} id或{innerCode:innerCode}， 用来指定哪个节点要展开，要展开还没有载入的节点，需要传入innerCode配置
    setCurrentNode (idOrFilter) {
      if (!idOrFilter) {
        return
      }
      if (typeof idOrFilter === 'string' || typeof idOrFilter === 'number') {
        let obj = {}
        obj[this.props.key] = idOrFilter
        this.active = obj
      } else {
        this.active = idOrFilter
      }
    },
    handleTitleClick () {
      let obj = {}
      obj[this.props.key] = this.nodes[this.props.key]
      this.active = obj
      this.$emit('current-change', this.nodes)
    },
    async handleLazy (parentNode) {
      if (!this.lazy) {
        return []
      }

      const childNodes = await this.lazy(parentNode)

      parentNode[this.props.children] = childNodes

      return true
    }
  }

}
</script>

<style scoped>
  .wrapper {
    padding: 0 10px;
    font-size: 16px;
  }
  .wrapper ul {
    list-style: none;
    padding-left: 22px;
  }
  .wrapper ul.root-stage {
    padding-left: 0;
  }
  .wrapper .no-data {
    text-align: center;
    color: #ccc;
    font-size: 14px;
    line-height: 40px;
  }
  .wrapper .title {
    font-size: 16px;
    font-weight: 700;
    line-height: 50px;
    color: #424242;
    cursor: pointer;

  }
</style>
