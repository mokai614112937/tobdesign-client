<template>
  <li class="node-li" :class="{ 'level1-node': level1, 'grandchildren-active': isGrandChildActive, 'is-expanded': isExpanded, 'lazy': isLazy }">
    <div class="node-content" @click="handleNodeClick" :class="{ 'active': isActive }" :style="{color:(!node['visibleFlag'] || node['visibleFlag'] === 'Y') ? '' : (isExpanded ? '#adc' : '#ccc')}">
      <span :data-id="node[props.key]" :data-inner-code="node[props.traceback]">
        <i class="fa" v-if="!level1" :class="{ 'fa-angle-right': ((!node['isLeaf'] && node['isLeaf'] !== 0 && node[props.children].length) ||node['isLeaf'] === 0), 'dot': ((!node['isLeaf'] && node['isLeaf'] !== 0 && !node[props.children].length) || node['isLeaf'] === 1) }"></i> {{node[props.label]}}</span>
      <i class="fa" @click.stop="expandToggle" v-if="(!node['isLeaf'] && node['isLeaf'] !== 0 && node[props.children].length) || node['isLeaf'] === 0"></i>
    </div>
    <ul class="children-list" v-if="((!node['isLeaf'] && node['isLeaf'] !== 0 && node[props.children].length) || node['isLeaf'] === 0) && node[props.children] && node[props.children].length">
      <catalog-tree-node :node="item" :props="props" :active="active" v-for="item in node[props.children]" :key="item[props.key]" @node-active="handleChildNodeActive" @node-expand="handleChildNodeExpand"></catalog-tree-node>
    </ul>
  </li>
</template>

<script>
import emitter from '../../mixins/emitter.js'
export default {
  name: 'CatalogTreeNode',
  componentName: 'CatalogTreeNode',
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
        this.lazyLoadChildren()
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
        this.lazyLoadChildren()
      }
    },

    async lazyLoadChildren() {
      if (this.node['isLeaf'] === 0 && this.node[this.props.children] && this.node[this.props.children].length === 0) {
        this.isLazy = true
        await this.owner.handleLazy(this.node)
        this.isLazy = false
      }
    },
    handleNodeClick() {
      this.lazyLoadChildren()
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
  padding: 14px;
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
  content: '\f068';
}

li.node-li > .node-content > .fa:before {
  content: '\f067';
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
</style>
