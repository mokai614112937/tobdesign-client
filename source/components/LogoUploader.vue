<template>
  <div class="logo-uploader">
    <el-upload
      :disabled="disabled"
      class="avatar-uploader"
      action=""
      v-loading="uploading"
      :show-file-list="false"
      accept=".png,.jpg,.jpeg,.gif,.bmp"
      :http-request="fileUploadHandler"
      :before-upload="beforeUpload">
      <img v-if="logoFile || logoSrc" :src="logoFile ? /^data:image/.test(logoFile) ? logoFile : prefix+logoFile : logoSrc" class="avatar" @error="setErrorImg" alt="">
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      <div class="el-upload__tip" slot="tip">{{tip}}</div>
    </el-upload>
  </div>
</template>

<script>
import util from '../common/util.js'
export default {
  props: {
    attribute: {
      type: String,
      required: true,
      default: ''
    },
    logoSrc: {
      type: String,
      required: false,
      default: ''
    },
    disabled: {
      type: Boolean,
      required: true,
      default: false
    },
    tip: {
      type: String,
      required: false,
      default: '推荐上传尺寸为500x270的图片'
    }
  },
  data() {
    return {
      uploading: false,
      prefix: window.app.prefix
    }
  },
  computed: {
    logoFile: {
      get() {
        return this.attribute
      },
      set(val) {
        this.$emit('update:attribute', val)
      }
    }
  },
  methods: {
    setErrorImg(e) {
      e.target.src = './assets/images/picture-nologo.png'
    },
    beforeUpload(file) {
      if (!/^image/.test(file.type)) {
        util.showErrorMessageBox('图片只能是.png,.jpg,.jpeg,.gif,.bmp格式!')
        return false
      }
      if (file.size / 1024 / 1024 > 2) {
        util.showErrorMessageBox('上传图片大小不能超过 2MB!')
        return false
      }
      return true
    },
    async fileUploadHandler(event) {
      this.uploading = true
      try {
        const { file } = event
        let reader = new FileReader()
        reader.onload = e => {
          let logoFile = e.target.result
          this.$emit('callback', logoFile)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.log(error)
      } finally {
        this.uploading = false
      }
    }
  }
}
</script>

<style scoped>

</style>
<style>
  .logo-uploader .avatar-uploader {
    text-align: left;
  }
  .logo-uploader .avatar-uploader .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    line-height: 150px;
    text-align: center;
  }
  .logo-uploader .avatar-uploader .avatar {
    max-width: 150px;
    max-height: 150px;
    display: block;
  }
  .logo-uploader .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
</style>
