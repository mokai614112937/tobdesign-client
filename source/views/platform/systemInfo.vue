<template>
  <div class="layout-no-cols">
    <div class="layout-content-padding scroll">
      系统管理
    </div>
  </div>
</template>

<script>
import {paginationOptions} from '../../common/paginationBar.js'

export default {
  data() {
    return {
      paginationOptions: paginationOptions, // 表格分页参数
    }
  },
  methods: {
  }
}
</script>

<style scoped>
  .info-col {
    margin-bottom: 1.5em;
  }

  .info-title {
    text-align: center;
    margin: .6em 0;
  }

  .progress-text {
    text-align: center;
  }
</style>
