import { hasClass, addClass, removeClass } from 'element-ui/src/utils/dom'
import { getCell, getColumnByCell, getRowIdentity } from 'element-ui/packages/table/src/util'

export default {
  name: 'ElListViewBody',
  components: {
  },
  props: {
    store: {
      required: true
    },
    context: {},
    rowClassName: [String, Function],
    rowStyle: [Object, Function]
  },
  render (h) {
    if (!this.data || !this.data.length) {
      return (<span class='el-table__empty-text'>暂无数据 ！</span>)
    }

    const self = this
    this.data.forEach((row, $index) => {
      Vue.set(row, '$index', $index)
    })
    return (
      <ul class='el-list-view__body'>
        {
          this._l(this.data, (row, $index) =>
            [<li
              style={this.rowStyle ? this.getRowStyle(row, $index) : null}
              key={this.table.rowKey ? this.getKeyOfRow(row, $index) : $index}
              on-dblclick={($event) => this.handleDoubleClick($event, row)}
              on-click={($event) => this.handleClick($event, row)}
              on-contextmenu={($event) => this.handleContextMenu($event, row)}
              on-mouseenter={_ => this.handleMouseEnter($index)}
              on-mouseleave={_ => this.handleMouseLeave()}
              class={[this.getRowClass(row, $index)]}>
              {this.$parent.$scopedSlots.default(row)}

            </li>
            ]
          )
        }
      </ul>
    )
  },

  watch: {
    'store.states.hoverRow' (newVal, oldVal) {
      if (!this.store.states.isComplex) return
      const el = this.$el
      if (!el) return
      const tr = el.querySelector('tbody').children
      const rows = [].filter.call(tr, row => hasClass(row, 'el-list-view__row'))
      const oldRow = rows[oldVal]
      const newRow = rows[newVal]
      if (oldRow) {
        removeClass(oldRow, 'hover-row')
      }
      if (newRow) {
        addClass(newRow, 'hover-row')
      }
    },
    'store.states.currentRow' (newVal, oldVal) {
      if (!this.highlight) return
      const el = this.$el
      if (!el) return
      const data = this.store.states.data
      const tr = el.querySelector('tbody').children
      const rows = [].filter.call(tr, row => hasClass(row, 'el-list-view__row'))
      const oldRow = rows[data.indexOf(oldVal)]
      const newRow = rows[data.indexOf(newVal)]
      if (oldRow) {
        removeClass(oldRow, 'current-row')
      } else {
        [].forEach.call(rows, row => removeClass(row, 'current-row'))
      }
      if (newRow) {
        addClass(newRow, 'current-row')
      }
    }
  },
  computed: {
    table () {
      return this.$parent
    },

    data () {
      return this.store.states.data
    },
    columnsCount () {
      return this.store.states.columns.length
    },
    columns () {
      return this.store.states.columns
    }
  },
  methods: {
    getKeyOfRow (row, index) {
      const rowKey = this.table.rowKey
      if (rowKey) {
        return getRowIdentity(row, rowKey)
      }
      return index
    },
    getRowStyle (row, rowIndex) {
      const rowStyle = this.table.rowStyle
      if (typeof rowStyle === 'function') {
        return rowStyle.call(null, {
          row,
          rowIndex
        })
      }
      return rowStyle
    },

    getRowClass (row, rowIndex) {
      const classes = ['el-list-view__row']

      if (this.stripe && rowIndex % 2 === 1) {
        classes.push('el-list-view__row--striped')
      }
      const rowClassName = this.table.rowClassName
      if (typeof rowClassName === 'string') {
        classes.push(rowClassName)
      } else if (typeof rowClassName === 'function') {
        classes.push(rowClassName.call(null, {
          row,
          rowIndex
        }))
      }

      if (this.store.states.expandRows.indexOf(row) > -1) {
        classes.push('expanded')
      }

      if (this.store.isSelected(row)) {
        classes.push('selected')
      }

      return classes.join(' ')
    },
    handleMouseEnter (index) {
      this.store.commit('setHoverRow', index)
    },

    handleMouseLeave () {
      this.store.commit('setHoverRow', null)
    },

    handleContextMenu (event, row) {
      this.handleEvent(event, row, 'contextmenu')
    },

    handleDoubleClick (event, row) {
      this.handleEvent(event, row, 'dblclick')
    },

    handleClick (event, row) {
      this.store.commit('setCurrentRow', row)
      this.handleEvent(event, row, 'click')
    },
    handleEvent(event, row, name) {
      const table = this.table
      const cell = getCell(event)
      let column
      if (cell) {
        column = getColumnByCell(table, cell)
        if (column) {
          table.$emit(`cell-${name}`, row, column, cell, event)
        }
      }
      table.$emit(`row-${name}`, row, event, column)
    }

  }
}
