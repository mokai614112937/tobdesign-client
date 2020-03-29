
<template>
  <div class="tree-table__wrap">
    <el-table :data="tableData"
              :height="height"
              :max-height="maxHeight"
              :stripe="stripe"
              :border="border"
              :size="size"
              :fit="fit"
              :show-header="showHeader"
              :highlight-current-row="highlightCurrentRow"
              :row-key="rowKey"
              :row-style="rowStyleFun"
              :cell-class-name="cellClassName"
              :cell-style="cellStyle"
              :header-row-class-name="headerRowClassName"
              :header-row-style="headerRowStyle"
              :header-cell-class-name="headerCellClassName"
              :header-cell-style="headerCellStyle"
              :empty-text="emptyText"
              @select="handleSelect"
              @select-all="handleSelectAll"
              @selection-change="handleSelectionChange" ref="$treeTable">
      <slot/>
    </el-table>
  </div>
</template>

<script>
import { treeDataTransfer, lazyDataTransfer } from './treeTableUtil.js'
import _ from 'lodash'

export default {
  name: 'TreeTable',
  componentName: 'TreeTable',
  props: {
    data: {
      type: Array,
      default: function() {
        return []
      }
    },
    height: [String, Number],
    maxHeight: [String, Number],
    stripe: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    },
    size: String,
    fit: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    highlightCurrentRow: {
      type: Boolean,
      default: false
    },

    cellClassName: [String, Function],
    cellStyle: [Object, Function],
    headerRowClassName: [String, Function],
    headerRowStyle: [Object, Function],
    headerCellClassName: [String, Function],
    headerCellStyle: [Object, Function],
    emptyText: String,
    props: {
      type: Object,
      default () {
        return {
          parentKey: '_parent',
          levelKey: '_level',
          expandedKey: '_expanded',
          showKey: '_show'
        }
      }
    },
    rowKey: {
      type: String,
      default: 'ID'
    },
    childKey: {
      type: String,
      default: 'children'
    },
    childNumKey: {
      type: String,
      default: 'childrenNumber'
    },
    isTransfer: {
      type: Boolean,
      default: true
    },
    expandedLevel: {
      type: [Number, String],
      default: 'all'
    },
    load: {
      type: Function,
      default: null
    },
    lazy: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    tableData: function() {
      if (this.isTransfer && this.data.length) {
        return treeDataTransfer(this.data, null, null, this.expandedLevel, {
          nodeKey: this.rowKey,
          childKey: this.childKey,
          parentKey: this.props.parentKey,
          levelKey: this.props.levelKey,
          expandedKey: this.props.expandedKey,
          lazy: this.lazy
        })
      }
      return this.data
    },
    store () {
      return this.$refs['$treeTable'].store
    }
  },
  data () {
    return {}
  },
  methods: {
    rowStyleFun (row) {
      let show = row.row[this.props.parentKey] ? row.row[this.props.parentKey][this.props.expandedKey] && row.row[this.props.parentKey][this.props.showKey] : true
      Vue.set(row.row, this.props.showKey, show)
      return show ? '' : 'display:none;'
    },
    handleSelect (selection, row) {
      this.$emit('select', selection, row)
    },
    handleSelectAll (selection) {
      selection = selection.filter(row => row.ID)
      this.$emit('select-all', selection)
    },
    handleSelectionChange (selection) {
      selection = selection.filter(row => row.ID)
      this.$emit('selection-change', selection)
    },
    clearSelection () {
      this.$refs['$treeTable'].clearSelection()
    },
    toggleRowSelection (rowKey, selected) {
      let row = this.tableData.find(val => val[this.rowKey] === rowKey)

      row && this.$refs['$treeTable'].toggleRowSelection(row, !!selected)
    },
    setCurrentRow (rowKey) {
      let row = this.tableData.find(val => val[this.rowKey] === rowKey)

      row && this.$refs['$treeTable'].setCurrentRow(row)
    },
    handleLazy (node) {
      const promise = new Promise((resolve, reject) => {
        this.load && this.load(node, resolve, reject)
      })

      const _parentKey = node[this.rowKey]

      return promise.then(newNodes => {
        let data = _.cloneDeep(this.store.states._data)
        const index = data.findIndex(val => val[this.rowKey] === _parentKey)

        if (index === -1) return false

        lazyDataTransfer(newNodes, data[index], {
          nodeKey: this.rowKey,
          childKey: this.childKey,
          parentKey: this.props.parentKey,
          levelKey: this.props.levelKey,
          expandedKey: this.props.expandedKey
        })

        data.splice(index + 1, 0, ...newNodes)

        //  console.log(data newNodes, index)

        this.store.commit('setData', data)
      })
    }
  },
  created () {
  }
}
</script>
<style scoped>
  .tree-table__wrap {
    width: 100%;
  }
</style>
