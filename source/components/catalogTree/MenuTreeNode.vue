<template>
  <li class="node-li" :class="{ 'level1-node': level1, 'grandchildren-active': isGrandChildActive,  'is-expanded': isExpanded, 'lazy': isLazy }">
    <div class="node-content" :class="{ 'active': isActive }" @click="handleNodeClick">
      <!-- <span>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa" v-if="!level1" :class="(!node['isLeaf'] && node['isLeaf'] !== 0 && node[props.children].length) || (node['isLeaf'] === 0&&node[props.children].length)?'fa-angle-right':'dot'"></i> {{node[props.label]}}</span> -->
      <span> &nbsp;&nbsp;&nbsp;&nbsp;{{node[props.label]}}</span>
      <!-- :class="isExpanded?'el-icon-arrow-up':'el-icon-arrow-down'" -->
      <i :class="isExpanded?'el-icon-arrow-up':'el-icon-arrow-down'" aria-hidden="true" style="font-size: 75%;" @click.stop="expandToggle" class="fa" v-if="(!node['isLeaf'] && node['isLeaf'] !== 0 && node[props.children].length) || (node['isLeaf'] === 0&&node[props.children].length)"></i>
    </div>

    <ul class="children-list" v-if="((!node['isLeaf'] && node['isLeaf'] !== 0 && node[props.children].length) || node['isLeaf'] === 0) && node[props.children] && node[props.children].length">
      <menu-tree-node :node="item" :props="props" :active="active" v-for="item in node[props.children]" :key="item[props.key]" :expandLevel="expandLevel" @node-active="handleChildNodeActive" @node-expand="handleChildNodeExpand">
      </menu-tree-node>
    </ul>
  </li>
</template>

<script>
import emitter from '../../mixins/emitter.js'

export default {
  name: 'MenuTreeNode',
  componentName: 'MenuTreeNode',
  mixins: [emitter],
  data() {
    return {
      isExpanded: false,
      isActive: false,
      isGrandChildActive: false,
      isLazy: false
    }
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    props: {
      type: Object,
      default: function() {
        return {
          children: 'children',
          label: 'name',
          key: 'ID',
          traceback: 'innerCode' // 可用来回溯父节点的属性
        }
      }
    },
    level1: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    active: {
      type: Object
    },
    expandLevel: {
      type: Number,
      default: 10
    }
  },
  watch: {
    active(val) {
      this.watchActive()
    }
  },
  computed: {
    owner() {
      let parent = this.$parent || this.$root
      let name = parent.$options.componentName

      while (parent && (!name || name !== 'CatalogTree')) {
        parent = parent.$parent

        if (parent) {
          name = parent.$options.componentName
        }
      }

      if (parent) {
        return parent
      } else {
        return {}
      }
    }
  },
  created() {
    if (this.node['treeLevel'] < this.expandLevel) {
      this.isExpanded = true
    }
    if (this.active) {
      this.watchActive()
    }
  },
  methods: {
    matchActive(matchTraceback) {
      if (!this.active) {
        return false
      }
      for (let key in this.active) {
        if (this.props.traceback === key) {
          if (matchTraceback && this.node[key] !== this.active[key]) {
            return false
          } else if (!this.active[key].startsWith(this.node[key])) {
            return false
          }
        } else if (this.node[key] !== this.active[key]) {
          return false
        }
      }
      return true
    },
    watchActive(val, oldVal) {
      if (this.matchActive()) {
        this.isActive = true
        this.isExpanded = true
        this.$nextTick(_ => {
          this.changeLevel1NodeActive()
        })
        this.$emit('node-expand', this.node, this)
        this.lazyLoad()
      } else {
        this.isActive = false
      }
    },
    changeLevel1NodeActive() {
      if (this.isActive) {
        let parent = this
        while (parent && parent.node && !parent.level1) {
          parent = parent.$parent
        }
        if (parent && parent.node && parent.level1) {
          parent.$parent.$children.forEach(node => {
            node.isGrandChildActive = false
          })
          parent.isGrandChildActive = true
        }
      }
    },
    handleChildNodeActive(val, nodeData, instance) {
      this.isGrandChildActive = val
      console.log(val)
      this.$emit('node-active', val, nodeData, instance)
    },
    handleChildNodeExpand(nodeData, instance) {
      this.isExpanded = true
      this.$emit('node-expand', nodeData, instance)
    },

    expandToggle() {
      if (this.isExpanded) {
        this.isExpanded = false
      } else {
        this.isExpanded = true
        this.lazyLoad()
      }
    },

    async lazyLoad() {
      if (this.node['isLeaf'] === 0 && this.node[this.props.children] && this.node[this.props.children].length === 0) {
        this.isLazy = true
        await this.owner.handleLazy(this.node)
        this.isLazy = false
      }
    },
    async handleNodeClick() {
      this.expandToggle()
      this.dispatch('CatalogTree', 'node-click', this.node, this)
    }
  }
}
</script>
<style scoped>
ul {
  list-style: none;
  padding-left: 22px;
}

li > .node-content {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  height: 42px;
  /* line-height: 42px; */
}

li > .node-content > .fa {
  padding: 16px;
  font-size: 14px;
}

li.level1-node:hover {
  background-color: #f9fbfa;
}

li.level1-node > .node-content {
  padding-left: 6px;
}

li.level1-node.grandchildren-active > .node-content {
  background-color: #459ae5;
  border-radius: 4px;
  color: #fff;
  padding: 0 0 0 15px;
  box-shadow: 0px 2px 6px 0px rgba(45 , 140 , 224, 0.4);
}

li.node-li:not(.level1-node) > .node-content:hover {
  color: #459ae5;
}

ul.children-list {
  display: none;
}

li.node-li.is-expanded > ul.children-list {
  display: block;
}

li.node-li.is-expanded > .node-content > .fa:before {
  content: '\e605';
  /* content: "\f068"; */
}

li.node-li > .node-content > .fa:before {
  content: '\e603';
  /* content: "\f067"; */
}

@keyframes rotating {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
li.node-li.lazy > .node-content > .fa {
  animation: rotating 1.2s linear infinite;
}
li.node-li.lazy > .node-content > .fa:before {
  content: '\f110';
}

.fa.dot:before {
  content: '·';
  width: 6px;
  display: inline-block;
}

.node-content.active {
  color: #459ae5;
  font-weight: 700;
}
.tree_class_style {
  font-size: 75%;
}
</style>
