
<template>
  <component :is="'el-table-column'" :prop="prop" :label="label" :width="width" :min-width="minWidth">
    <template slot-scope="{ row, $index }">
      <span class="node-cell"
            :class="{ 'main': hasChild(row) }"
            :style="{ paddingLeft: paddingLeft(row) }"
            @click.stop="toggle(row)">
        <span v-if="hasChild(row)" class="node-icon">
          <i v-if="row.expanded" class="fa fa-angle-down"/>
          <i v-else class="fa fa-angle-right"/>
        </span>
        <span v-else class="node-icon">&nbsp;</span>
        <slot :row="row">
          <span class="cell-content">{{ row[prop] }}</span>
        </slot>
        <i class="el-icon-loading node-loading" v-show="row._loading"/>
      </span>
    </template>
  </component>
</template>

<script>
export default {
  name: 'TreeTableColumn',
  componentName: 'TreeTableColumn',
  props: {
    prop: {
      type: String
    },
    label: {
      type: String
    },
    width: {
      type: String
    },
    minWidth: {
      type: String
    }
  },
  computed: {
    owner () {
      let parent = this.$parent || this.$root
      let name = parent.$options.componentName

      while (parent && (!name || name !== 'TreeTable')) {
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
  data () {
    return {}
  },
  methods: {
    paddingLeft (row) {
      let _left = parseInt(row[this.owner.props.levelKey]) * 14
      return _left + 'px'
    },
    hasChild (row) {
      if (row[this.owner.childKey] !== undefined && row[this.owner.childKey] && row[this.owner.childKey].length === 0 && this.owner.lazy) {
        return true
      } else if (row[this.owner.childKey] && row[this.owner.childKey] !== undefined) {
        return row[this.owner.childKey].length > 0
      } else {
        return false
      }
    },
    async toggle (row) {
      if (this.owner.lazy && !row[this.owner.props.expandedKey] && row[this.owner.childKey] && row[this.owner.childKey].length === 0) {
        row._loading = true
        await this.owner.handleLazy(row)
        return
      }
      row[this.owner.props.expandedKey] = !row[this.owner.props.expandedKey]
    }
  },
  created () {
  }
}
</script>
<style scoped>
  .node-cell {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
  }
  .node-cell.main {
    cursor: pointer;

  }
  .node-icon {
    display: block;
    width: 15px;
  }
  .node-loading {
    padding-right: 0;
    margin-left: 10px;
  }
</style>
