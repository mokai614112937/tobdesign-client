<template>
  <div class="select-wrap" @click.stop="wrapClickHandler" :style="{ width: width.endsWith('%') ? width : width+'px' }">
    <el-input :value="parentName ? (parentName+' > '+inputValue) : inputValue" :placeholder="placeholder" readonly :disabled="disabled"
              :size="size" :class=" top ? 'tree-select-input':''" class="value-input" :title="parentName ? (parentName+' > '+inputValue) : inputValue">
    </el-input>
    <i class="select-icon fa" :class="[ iconClass ]" @click.stop="iconClickHandler"></i>

    <tree-popper-lazy
        ref="treePopper"
        :is-open.sync="isOpenTree"
        :input-value.sync="inputValue"
        :node-key="nodeKey"
        :apiUrl="apiUrl"
        :dimension-id="dimensionId"
        :content-type="contentType"
        :content-type-icon="contentTypeIcon"
        :parent-id="parentId"
        :items-options="itemsOptions"
        :offset-top="offsetTop"
        :offset-left="offsetLeft"
        :loading="loading"
        :disable-root="disableRoot"
        :self-built-platform="selfBuiltPlatform"
        :full-parent="true"
        :enterprise-id="enterpriseId"
        @click-change="handleClickChange" @updateCatalogName="updateCatalogName">
    </tree-popper-lazy>
  </div>
</template>

<script>
import TreeSelectPopperLazy from './TreeSelectPopperLazy.vue'
import emitter from '../mixins/emitter.js'
export default {
  mixins: [emitter],
  Name: 'TreeSelectLazy',
  componentName: 'TreeSelectLazy',
  props: {
    disableRoot: {
      type: Boolean,
      default: false
    }, // 是否禁止选中根目录
    value: {
      default: ''
    }, // key值，一般为ID
    placeholder: {
      default: ''
    }, // 占位符
    apiUrl: {
      type: String,
      default: ''
    }, // 接口路径
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
    // 父节点名称
    parentName: {
      type: String,
      default: ''
    },
    selfBuiltPlatform: { // 是否展示平台自建栏目
      type: String,
      default: 'Y'
    },
    // 是否获取所有父级节点
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
  data() {
    return {
      isOpenTree: false,
      catalogTrees: [],
      catalogName: '',
      offsetTop: 0,
      offsetLeft: 0
    }
  },
  methods: {
    iconClickHandler(e) {
      if (this.disabled) {
        return
      }
      if (this.inputValue !== '' && this.clearable) {
        this.catalogName = ''
        this.defaultName = ''
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
      // eslint-disable-next-line no-labels
      loop: for (let i = 0; i < tree.length; i++) {
        if (tree[i][this.itemsOptions.key] === ID) {
          this.catalogName = tree[i][this.itemsOptions.label]
          // eslint-disable-next-line no-labels
          break loop
        }
        if (tree[i][this.itemsOptions.children].length > 0) {
          this.findCatalog(tree[i][this.itemsOptions.children], ID)
        }
      }
    },
    handleClickChange(row) {
      /** 清空组件input框的值**/
      this.defaultName = this.catalogName
      this.catalogName = ''
      this.$emit('click-change', row)
    },
    setCurrentKey(key) {
      key && this.$refs.treePopper.setCurrentKey(key)
    },
    updateCatalogName(name) {
      this.catalogName = name
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
      set(val) {
        this.$emit('update:inputName', val)
      }
    },
    inputValue: {
      // get() {
      //   return this.catalogName
      // },
      // set(val) {
      //   this.$emit('update:value', isNaN(val[this.itemsOptions.key]) ? '' : val[this.itemsOptions.key])
      // }
      get() {
        return this.catalogName ? this.catalogName : this.defaultName
      },
      set(val) {
        this.$emit('update:value', val)
      }
    },
    nodeKey() {
      return this.value || ''
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
    'tree-popper-lazy': TreeSelectPopperLazy
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
.value-input .el-input__inner{
  padding-right: 30px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
