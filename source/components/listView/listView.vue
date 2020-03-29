<style>
</style>

<template>
  <div class="el-list-view" :class="layout">
    <list-view-body :store="store">
    </list-view-body>
  </div>
</template>

<script>
/* global axios Vue */
import { Loading } from 'element-ui'
import TableStore from 'element-ui/packages/table/src/table-store'
import ListViewBody from './listView-body.js'
import Sortable from 'sortablejs'

export default {
  name: 'ElListView',
  components: {
    'list-view-body': ListViewBody
  },
  props: {
    data: {
      type: Array,
      default: function() {
        return []
      }
    },
    rowKey: [String, Function],
    defaultExpandAll: Boolean,

    dataReadUrl: {
      type: [String, Function],
      default: ''
    },
    pageSize: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 1
    },
    autoGetData: {
      type: Boolean,
      default: true
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, ->, prev, pager, next, jumper'
    },
    strict: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    // 是否开启row拖拽
    draggable: {
      type: Boolean,
      default: false
    },
    layout: {
      type: String,
      default: 'list'
    },
    multiOperates: {
      type: Array,
      default: function() {
        return []
      }
    }
  },

  data() {
    const store = new TableStore(this, {
      rowKey: this.rowKey,
      defaultExpandAll: this.defaultExpandAll
    })
    let tmpCurrentPage = this.currentPage || 1
    let tmpPageSize = this.pageSize || 10
    let tmpPageSizes = [10, 20, 40, 100]
    if (tmpPageSizes.indexOf(tmpPageSize) === -1) {
      tmpPageSizes.push(tmpPageSize)
      tmpPageSizes.sort((a, b) => a - b)
    }
    let storeOptions = localStorage.getItem(this.getStorageKey())
    if (storeOptions) {
      storeOptions = JSON.parse(storeOptions)
      if (storeOptions.pageIndex) {
        tmpCurrentPage = storeOptions.pageIndex
      }
      if (storeOptions.pageSize) {
        tmpPageSize = storeOptions.pageSize
      }
    }
    return {
      store,
      isHidden: false,
      total: 0,
      selectedRows: [],
      tmpPageSize: tmpPageSize,
      tmpPageSizes: tmpPageSizes,
      tmpCurrentPage: tmpCurrentPage,
      sortable: null
    }
  },
  computed: {
    selection() {
      return this.store.states.selection
    },
    columns() {
      return this.store.states.columns
    },
    tableData() {
      return this.store.states.data
    },
    operateFuncs() {
      let obj = {}
      for (let i = 0; i < this.multiOperates.length; i++) {
        let opt = this.multiOperates[i]
        obj[opt.value] = opt.fn
      }
      return obj
    }
  },
  watch: {
    data: {
      immediate: true,
      handler(value) {
        this.store.commit('setData', value)
        if (this.draggable && (!this.dataReadUrl || !this.autoGetData)) {
          this.$nextTick(() => {
            let self = this
            self.afterSortData = [...value]
            self.setSortable()
          })
        }
      }
    },
    tmpPageSize (val, oldVal) {
      // 当存在dataReadUrl时，且不是第一次挂载时获取的传值，从url获取数据，并更新data
      if (this.dataReadUrl && oldVal !== 0) {
        this.getData(this.tmpCurrentPage)
      }
    },
    tmpCurrentPage (val, oldVal) {
      // 当存在dataReadUrl时，且不是第一次挂载时获取的传值，从url获取数据，并更新data
      if (this.dataReadUrl && oldVal !== 0) {
        this.getData(this.tmpCurrentPage)
      }
    }
  },
  created() {
  },
  mounted () {
    this.$nextTick(() => {
      if (this.selectable) {
        this.initRowEvent()
      }
      if (this.pageSize) {
        this.initPagination()
      }
      if (this.dataReadUrl && this.autoGetData) {
        // 当存在dataReadUrl时，从url获取数据，并更新data
        this.getData(this.tmpCurrentPage)
      }
    })
  },
  methods: {
    setSortable () {
      if (!this.draggable) {
        return
      }
      const self = this
      const el = self.$el.getElementsByClassName('el-list-view__body')[0]
      self.sortable = Sortable.create(el, {
        onEnd: evt => {
          let oldData = [...self.afterSortData]
          const row = self.afterSortData.splice(evt.oldIndex, 1)[0]
          self.afterSortData.splice(evt.newIndex, 0, row)

          let emitData = {
            dragRow: Object.assign({}, row), // 拖拽的行
            oldIndex: evt.oldIndex, // 旧索引
            newIndex: evt.newIndex, // 新索引
            oldData: oldData, // table旧数据
            newData: [...self.afterSortData], // table新数据
            initialData: [...self.data] // table初始数据
          }
          self.$emit('after-sort', emitData)
        }
      })
    },
    toggleRowSelection(row, selected) {
      this.store.toggleRowSelection(row, selected)
      this.store.updateAllSelected()
    },
    clearSelection() {
      this.store.clearSelection()
    },
    updateScrollY() {
      // console.log('updateScrollY()')
    },
    initRowEvent () {
      this.$on('row-click', (row, event, column) => {
        if (this.strict) {
          return
        }
        this.toggleRowSelection(row)
      })
      this.$on('selection-change', selection => {
        if (selection.length < this.tableData.length) {
          this.pagination.selectAllChecked = false
        } else if (selection.length === this.tableData.length) {
          this.pagination.selectAllChecked = true
        }
        this.selectedRows = selection.concat()
      })
    },
    initPagination () {
      let self = this
      if (this.pageSize === 0) {
        return
      }
      this.pagination = new (Vue.extend({
        template: `<div class="el-table__footer-wrapper" v-show="$parentListView.total > 0">
                  <div class="el-multi-operate" v-if="$parentListView.selectable && $parentListView.multiOperates.length > 0 && $parentListView.total > 0">
                    <el-checkbox @change="selectAllChanged" v-model="selectAllChecked">选择</el-checkbox><el-select v-show="$parentListView.selection.length > 1" value="" @change="selectOperate" placeholder="请选择操作项">
                      <el-option
                        v-for="item in multiOperates"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </div>
                  <el-pagination class="page"
                    @size-change="sizeChangeHandler"
                    @current-change="currentChangeHandler"
                    :current-page.sync="$parentListView.tmpCurrentPage"
                    :page-size.sync="$parentListView.tmpPageSize"
                    :page-sizes.sync="$parentListView.tmpPageSizes"
                    :total="$parentListView.total"
                    :layout="paginationLayout">
                  </el-pagination>
                  </div>`,
        data () {
          return {
            selectAllChecked: false,
            multiOperates: self.multiOperates
          }
        },
        beforeMount () {
          this.pageSize = this.$parentListView.pageSize
          this.paginationLayout = this.$parentListView.paginationLayout
        },
        methods: {
          selectAllChanged(val) {
            if (val) {
              this.$parentListView.store.isAllSelected = false
              this.$parentListView.store.mutations.toggleAllSelection.call(this.$parentListView.store, this.$parentListView.store.states)
            } else {
              this.$parentListView.store.clearSelection()
            }
          },
          selectOperate(e) {
            let fn = this.$parentListView.operateFuncs[e]
            if (typeof fn === 'function') {
              fn(this.$parentListView.store.states.selection)
            }
          },
          sizeChangeHandler (val) {
            this.$parentListView.tmpPageSize = val
          },
          currentChangeHandler (val) {
            this.$parentListView.tmpCurrentPage = val
          }
        }
      }))()
      this.pagination.$parentListView = this
      this.pagination.$mount()
      this.$el.appendChild(this.pagination.$el)
    },
    getData (pageIndex) {
      let rows = this.selectedRows.concat()
      return new Promise(async (resolve, reject) => {
        const self = this
        let loadingInstance = Loading.service({ target: self.$el })
        let readUrl
        let options
        try {
          if (typeof this.dataReadUrl === 'string') {
            readUrl = this.dataReadUrl
            options = {
              params: {
                pageIndex: this.tmpCurrentPage,
                pageSize: this.tmpPageSize
              }
            }
          } else if (typeof this.dataReadUrl === 'function') {
            const result = this.dataReadUrl()
            readUrl = result[0]
            options = result[1]
            options.params = options.params || {}
            options.params.pageIndex = this.tmpCurrentPage
            options.params.pageSize = this.tmpPageSize
          }
          let res = await axios.get(readUrl, options)
          if (res.data.status === 0) {
            self.total = 0
            self.data.splice(0, self.data.length)
            loadingInstance.close()
            reject(res.data.message || `从接口${this.dataReadUrl}获取数据失败 ！`)
          }
          if (!res.data.total && res.data.data) {
            if (res.data.total === 0) {
              self.total = res.data.total
            } else if (res.data.data.length > 0 && this.pageSize) {
              reject(new Error('接口 ' + this.dataReadUrl + ' 没有返回 total ，无法设置数据表格的总记录数！'))
            }
          } else {
            self.total = res.data.total
          }
          if (!Array.isArray(res.data.data)) {
            self.total = 0
            self.data.splice(0, self.data.length)
            reject(new Error('接口 ' + this.dataReadUrl + ' 没有返回 data ，无法设置数据表格的数据！'))
          } else {
            self.data.splice.apply(self.data, [0, self.data.length].concat(res.data.data))
            if (this.draggable) {
              self.afterSortData = [...self.data]
              self.$nextTick(() => {
                self.setSortable()
              })
            }
            self.data.forEach(o => {
              rows.forEach(row => {
                if (this.compare(o, row)) {
                  self.toggleRowSelection(o)
                }
              })
            })
            self.saveOptionToStorage()
          }
        } catch (e) {
          loadingInstance.close()
        }
        this.$nextTick(() => {
          loadingInstance.close()
        })
        resolve()
      })
    },
    compare (x, y) {
      if (x.ID && y.ID && x.ID === y.ID) {
        return true
      }

      for (let i in x) {
        if (!y.hasOwnProperty(i) || x[i] !== y[i]) {
          return false
        }
      }
      for (let i in y) {
        if (!x.hasOwnProperty(i) || x[i] !== y[i]) {
          return false
        }
      }
      return true
    },
    getStorageKey() {
      let readUrl
      if (typeof this.dataReadUrl === 'string') {
        readUrl = this.dataReadUrl
      } else if (typeof this.dataReadUrl === 'function') {
        const result = this.dataReadUrl()
        readUrl = result[0]
      }
      let key = 'route$' + this.$route.path + '$api$' + readUrl
      return key.replace(/\//g, '_')
    },
    saveOptionToStorage() {
      let options
      if (typeof this.dataReadUrl === 'string') {
        options = {
          params: {
            pageIndex: this.tmpCurrentPage,
            pageSize: this.tmpPageSize
          }
        }
      } else if (typeof this.dataReadUrl === 'function') {
        const result = this.dataReadUrl()
        options = result[1]
        options.params = options.params || {}
        options.params.pageIndex = this.tmpCurrentPage
        options.params.pageSize = this.tmpPageSize
      }
      localStorage.setItem(this.getStorageKey(), JSON.stringify(options.params))
    }
  }
}
</script>
<style scoped>
  .el-list-view {
    position: relative;
  }
</style>
