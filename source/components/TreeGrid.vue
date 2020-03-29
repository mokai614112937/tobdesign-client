<template>
  <el-table border ref="dataTable" class="tree-grid-table" :data="tableData" :strict="strict" :show-summary="isShowSummary" :row-style="showTr" @selection-change="onSelectionChange" @cell-click="cellClick" :data-read-url="dataReadUrl" :draggable="draggable" @after-sort="afterTableSort" :auto-get-data="autoGetData">
    <el-table-column type="index" width="65" :label="serialNumberName" v-if="isNeedIndex" align="center"></el-table-column>
    <el-table-column v-if="needCheckbox" type="selection" width="35" align="center"></el-table-column>
    <el-table-column
      v-for="(column, index) in columns"
      :key="column.dataIndex"
      :label="column.text"
      :width="column.width"
      :min-width="column.minwidth"
      :prop="column.dataIndex"
      :align="column.isAlignCenter?'center':column.menus ? 'right' : 'left'"
      :class-name="column.classCss"
      show-overflow-tooltip
    >
      <template slot-scope="scope">
        <el-button v-for="menu in column.menus" :priv="menu.priv" :key="menu.method" @click.stop="tableMethods(menu.method,scope.row)" type="text" :title="menu.title">
          <i :class="menu.iconClass"></i></el-button>
        <el-dropdown @command="selectMethod" v-if="column.moreMenus">
          <el-button :disabled="!column.moreMenus.length" type="text" title="更多">
            <i class="fa fa-ellipsis-h f16"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="{method:moreMenu.method,row:scope.row}" v-for="moreMenu in column.moreMenus" :key="moreMenu.method" :priv="moreMenu.priv">
                <i :class="moreMenu.iconClass"></i> {{moreMenu.title}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <template v-if="spaceIconShow(index)">
          <span v-for="levelIndex in scope.row._level" :key="levelIndex" class="ms-tree-space"></span>
        </template>
        <span v-if="toggleIconShow(index,scope.row)" @click.stop="toggle(scope.$index)" class="tree-arrow">
          <i v-if="!scope.row._expanded" class="el-icon-arrow-right"></i>
          <i v-if="scope.row._expanded" class="el-icon-arrow-down"></i>
        </span>
        <span v-else-if="index===0" class="ms-tree-space"></span>
        <span v-if="column.dataIndex === 'status'">
          <el-tag size="small" :type="scope.row.status!=='Y'?'danger':''">{{scope.row.status==='Y'?'启用':'禁用'}}</el-tag>
        </span>
        <span v-else v-html="cell(scope.row, column)"></span>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import translate from '../common/dataTranslate.js'

export default {
  name: 'tree-grid',
  props: {
    isShowSummary: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    // 该属性是确认父组件传过来的数据是否已经是树形结构了，如果是，则不需要进行树形格式化
    treeStructure: {
      type: Boolean,
      default: function() {
        return false
      }
    },
    // 这是相应的字段展示
    columns: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 这是数据源
    dataSource: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 这个作用是根据自己需求来的，比如在操作中涉及相关按钮编辑，删除等，需要向服务端发送请求，则可以把url传过来
    requestUrl: {
      type: String,
      default: function() {
        return ''
      }
    },
    // 这个是是否展示操作列
    treeType: {
      type: String,
      default: function() {
        return 'normal'
      }
    },
    // 是否默认展开所有树
    defaultExpandAll: {
      type: Boolean,
      default: function() {
        return true
      }
    },
    // 是否需要多选框列
    needCheckbox: {
      type: Boolean,
      default: function() {
        return true
      }
    },
    // 序号表头名称
    serialNumberName: {
      type: String,
      default: function() {
        return ' '
      }
    },
    // 是否取消点击行自动选中的功能
    strict: {
      type: Boolean,
      default: false
    },
    // 是否需要序号
    isNeedIndex: {
      type: Boolean,
      default: true
    },
    // 数据获取url
    dataReadUrl: {
      type: [Array, String],
      default: ''
    },
    // 是否开启拖曳功能
    draggable: {
      type: Boolean,
      default: false
    },
    // 是否自动获取数据
    autoGetData: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selection: [],
      tableData: []
    }
  },
  watch: {
    dataSource(val) {
      if (this.treeStructure) {
        const data = translate.MSDataTransfer.treeToArray(val, null, null, this.defaultExpandAll)

        this.selection = data.filter(val => val.checked)
        this.tableData = data
        return
      }

      this.selection = val.filter(val => val.checked)
    }
  },
  mounted() {
  },
  updated() {
    if (!this.strict) {
      return
    }
    this.tableData.forEach(row => {
      // console.log(row)
      if (row.checked) {
        this.$refs.dataTable.toggleRowSelection(row, true)
      }
    })
    this.sortTableByCheck()
  },
  methods: {
    getData() {
      return new Promise(async (resolve, reject) => {
        await this.$refs.dataTable.getData()
        if (this.treeStructure) {
          const data = translate.MSDataTransfer.treeToArray(this.tableData, null, null, this.defaultExpandAll)

          this.selection = data.filter(val => val.checked)
          // console.log(data)
          this.tableData = data
          resolve()
        }

        this.selection = this.tableData.filter(val => val.checked)
        resolve()
      })
    },
    afterTableSort(data) {
      this.$emit('after-sort', data)
    },
    selectMethod(command) {
      this.$parent[command.method](command.row)
    },
    tableMethods(method, row) {
      this.$parent[method](row)
    },
    sortTableByCheck() {
      let table = this.tableData
      let row = []
      let oldRow = []
      for (let j = 0; j < table.length; j++) {
        for (let i = 1; i < table.length; i++) {
          row = table[i]
          oldRow = table[i - 1]
          if (row._level === oldRow._level && row.checked && !oldRow.checked) {
            table[i] = oldRow
            table[i - 1] = row
          }
        }
      }
    },
    // 单元格内容
    cell(row, column) {
      if (column.render) {
        return column.render(row)
      }

      if (column.dataIndex) {
        return row[column.dataIndex]
      }

      return ''
    },
    // 显示行
    showTr(row, index) {
      let show = row.row._parent ? row.row._parent._expanded && row.row._parent._show : true
      Vue.set(row.row, '_show', show)
      return show ? '' : 'display:none;'
    },
    // 展开下级
    toggle(trIndex) {
      this.tableData[trIndex]._expanded = !this.tableData[trIndex]._expanded
    },
    // 显示层级关系的空格和图标
    spaceIconShow(index) {
      let me = this
      if (me.treeStructure && index === 0) {
        return true
      }
      return false
    },
    // 点击展开和关闭的时候，图标的切换
    toggleIconShow(index, record) {
      let me = this
      if (me.treeStructure && index === 0 && record.children && record.children.length > 0) {
        return true
      }
      return false
    },
    onSelectionChange(rows) {
      this.$emit('selection-change', rows)
    },
    cellClick(row, column, cell, event) {
      if (column.property !== this.columns[0].dataIndex) {
        return
      }
      this.$emit('cell-click', row)
    }
  }
}
</script>
<style scoped>
.ms-tree-space {
  position: relative;
  top: 1px;
  display: inline-block;
  font-family: 'Glyphicons Halflings';
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  width: 18px;
  height: 14px;
}

.ms-tree-space::before {
  content: '';
}

table td {
  line-height: 26px;
}

</style>
<style>
.title-column__content {
  color: #444;
  font-weight: 600;
}
.title-column__content:hover{
  color: #28b06e;
  cursor: pointer;
}
.tree-grid-table .el-button + .el-dropdown {
  margin-left: 0px;
}
.tree-grid-table .el-dropdown .el-button {
  color:#aaa;
}
</style>
