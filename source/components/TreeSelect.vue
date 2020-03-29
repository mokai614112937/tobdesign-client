<template>
  <div class="select-wrap" @click.stop="wrapClickHandler" :style="{ width: width.endsWith('%') ? width : width+'px' }">
    <el-input :value="inputValue" :placeholder="placeholder" readonly :disabled="disabled"
              :size="size" :class=" top ? 'tree-select-input':''" class="value-input" >
    </el-input>
    <i class="select-icon fa" :class="[ iconClass ]" @click.stop="iconClickHandler"/>

    <tree-popper
        ref="treePopper"
        :is-open.sync="isOpenTree"
        :input-value.sync="inputValue"
        :node-key="nodeKey"
        :items="catalogTrees"
        :items-options="itemsOptions"
        :offset-top="offsetTop"
        :offset-left="offsetLeft"
        :loading="loading"
        :disable-root="disableRoot"
        :dim-info="dimInfo"
        @callback="callback"
        @click-change="handleClickChange">
    </tree-popper>
  </div>
</template>

<script>
import TreeSelectPopper from './TreeSelectPopper.vue'
import emitter from '../mixins/emitter.js'
export default {
  mixins: [emitter],
  Name: 'TreeSelect',
  componentName: 'TreeSelect',
  data() {
    return {
      isOpenTree: false,
      catalogTrees: [],
      catalogName: '',
      isClear: false,
      offsetTop: 0,
      offsetLeft: 0,
      dim: {}
    }
  },
  watch: {
    items(val) {
      this.catalogTrees = this.items
    }
  },
  created() {
    this.loadCatalogTree(this.dimInfo)
  },
  methods: {
    loadCatalogTree(val) {
      if (val.enable) {
        this.dim = val
        this.$on('load-catalogtree', (val) => {
          this.catalogTrees = val.data
        })
      } else {
        this.catalogTrees = this.items
      }
    },
    callback(val) {
      this.catalogTrees = val
    },
    iconClickHandler(e) {
      if (this.disabled) {
        return
      }
      if (this.inputValue !== '' && this.clearable) {
        this.inputValue = ''
        this.isClear = true
        this.handleClickChange(null)
        return
      }

      this.isOpenTree = !this.isOpenTree
      if (this.isOpenTree) {
        this.offsetTop = e.clientY - e.offsetY - e.target.offsetTop
        this.offsetLeft = e.clientX - e.offsetX - e.target.offsetLeft
      }
      this.$emit('click', this.isOpenTree)
      this.handleClickChange(null)
    },
    wrapClickHandler(e) {
      if (this.disabled || this.isSearch) {
        return
      }

      this.isOpenTree = !this.isOpenTree
      if (this.isOpenTree) {
        this.offsetTop = e.clientY - e.offsetY
        this.offsetLeft = e.clientX - e.offsetX
      }
      this.$emit('click', this.isOpenTree)
    },
    findCatalog(tree, ID) {
      if (!ID) {
        this.catalogName = ''
        return
      }
      loop: for (let i = 0; i < tree.length; i++) {
        if (tree[i][this.itemsOptions.key] === ID) {
          this.catalogName = tree[i][this.itemsOptions.label]
          break loop
        }
        if (tree[i][this.itemsOptions.children] && tree[i][this.itemsOptions.children].length > 0) {
          this.findCatalog(tree[i][this.itemsOptions.children], ID)
        }
      }
    },
    handleClickChange(row) {
      this.$emit('click-change', row)
    },
    setCurrentKey(key) {
      key && this.$refs.treePopper.setCurrentKey(key)
    }
  },
  computed: {
    iconClass() {
      return this.clearable
        ? this.inputValue === '' ? (this.isOpenTree ? 'el-icon-caret-top' : 'el-icon-caret-bottom') : 'el-icon-circle-close'
        : this.isOpenTree ? 'el-icon-caret-top' : 'el-icon-caret-bottom'
    },
    defaultName: {
      get() {
        return this.inputName
      },
      set() {}
    },
    inputValue: {
      get() {
        if (this.defaultName) {
          let name = this.defaultName
          this.defaultName = null
          return name
        }
        if ((isNaN(this.value) && !this.value) || this.value < 0 || this.value === '' || this.value === '0') {
          return ''
        }
        this.findCatalog(this.catalogTrees, this.value)
        return this.catalogName
      },
      set(val) {
        this.$emit('update:value', isNaN(val[this.itemsOptions.key]) ? '' : val[this.itemsOptions.key])
      }
    },
    nodeKey() {
      return this.value || ''
    }
  },
  props: {
    disableRoot: {
      type: Boolean,
      default: true
    }, // 是否禁止选中根目录
    value: {
      default: ''
    }, // key值，一般为ID
    placeholder: {
      default: ''
    }, // 占位符
    items: {
      default: function() {
        return []
      }
    }, // 树数据
    itemsOptions: {
      default: function() {
        return { key: 'ID', label: 'name', children: 'children' }
      }
    }, // 树选项，默认为
    size: {
      type: String,
      default: ''
    }, // 大小
    width: {
      type: String,
      default: '100%'
    }, // 宽度
    disabled: {
      type: Boolean,
      default: false
    }, // 是否可用
    inputName: {
      default: ''
    }, // 当items为空时输入框仍显示的数据
    clearable: {
      type: Boolean,
      default: false
    }, // 是否附带清空选项功能
    top: {
      type: Boolean,
      default: false
    }, // 适用于顶部选择站点设置
    loading: {
      type: Boolean,
      default: false
    },
    dimInfo: {
      type: Object,
      default: function() {
        return {
          enable: false,
          catalogId: 0,
          contentId: 0,
          contentType: ''
        }
      }
    }
  },
  mounted() {
    let that = this

    document.addEventListener('click', () => {
      that.isOpenTree = false
    }, false)

    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 27) {
        that.isOpenTree = false
      }
    }, false)
  },
  components: {
    'tree-popper': TreeSelectPopper
  }
}
</script>

<style>
.select-wrap {
  position: relative;
  cursor: pointer;
  display: inline-block;
  text-align: left;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 45%;
  margin-top: -6px;
  color: #bbb;
}
.value-input>input{
  cursor: pointer;
}
</style>
