<script>
import Vue from 'vue'
import ECharts from 'vue-echarts/components/ECharts.vue'
import theme from '../lib/echarts_theme_macarons.json'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
ECharts.registerTheme('macarons', theme)

// import 'echarts/lib/chart/map'
// import 'echarts/lib/chart/radar'
// import 'echarts/lib/chart/scatter'
// import 'echarts/lib/chart/effectScatter'
// import 'echarts/lib/component/polar'
// import 'echarts/lib/component/geo'
// import 'echarts/lib/component/legend'
// import 'echarts/lib/component/visualMap'
// import 'echarts/lib/component/dataset'

// 注册组件后即可使用
Vue.component('chart', ECharts)
export default {
  props: {
    options: {
      type: Object,
      required: true
    },
    theme: {
      // NEditor js 所在目录的路径
      type: String,
      required: false,
      default: 'macarons'
    },
    width: {
      type: String,
      required: false,
      default: '100%'
    },
    height: {
      type: String,
      required: false,
      default: '100%'
    }
  },
  data() {
    return {

    }
  },
  computed: {
    styleObj() {
      return {
        width: this.width,
        height: this.height
      }
    }
  },
  async created () {
    this.init()
  },
  methods: {
    async initEcharts() {
      // await util.loadJS('lib/echarts.common.min.js')
      // await util.loadJS('lib/echarts_theme_macarons.js')
      /* if (!window.echarts) {
          return new Promise(async function (resolve, reject) {
            try {
              await util.loadJS('lib/echarts.common.min.js')
              await util.loadJS('lib/echarts_theme_macarons.js')
              resolve()
            } catch (e) {
              console.error('echarts.common.min.js is missing', e.toString())
            }
          })
        } */
    },
    async init() {
      await this.initEcharts()
    }
  }
}

</script>
<template>
  <div class="vue-echarts">
    <chart :options="options" :theme="theme" :style="styleObj"></chart>
  </div>
</template>

<style>
</style>
