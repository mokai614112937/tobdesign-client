<template>
  <div>
    <el-dialog :close-on-click-modal="false"  :title="title" :visible.sync="show" @open="dialogOpen" class="progress-dialog" >
      <div>{{progressCurrentInfo}}</div><br/>
      <el-progress :text-inside="true" :stroke-width="18" :percentage="progressPercent" status="success"></el-progress><br/><br/>
    </el-dialog>
  </div>
</template>
<script>
import util from '../common/util.js'
export default {
  data() {
    return {
      progressPercent: 0,
      progressCurrentInfo: '',
      show: false,
      taskID: 0,
      title: '',
      callback: '',
      successMessage: null
    }
  },
  methods: {
    dialogOpen() {
      this.progressPercent = 0
      this.progressCurrentInfo = '任务正在进行中...'
      let interval = setInterval(async () => {
        let progress = await axios.get(
          `/framework/longtimetasks/${this.taskID}`
        )
        if (progress.data.data.errorFlag) {
          this.show = false
          clearInterval(interval)
          let msg = progress.data.data.errors.join('</br>')
          util.showErrorMessageBox(msg, true)
          this.callback(false, msg)
        } else if (progress.data.data.completeFlag) {
          this.progressPercent = 100
          this.show = false
          clearInterval(interval)
          util.showSuccess(this.successMessage || progress.data.data.currentInfo)
          this.callback(true)
        } else {
          this.progressPercent = progress.data.data.percent
          this.progressCurrentInfo = progress.data.data.currentInfo
        }
      }, 1000)
    }
  }
}
</script>

<style>
.progress-dialog .el-dialog {
  width: 550px;
}

@media (max-width: 480px) {
  .progress-dialog .el-dialog {
    width: 9%;
  }
}
</style>
