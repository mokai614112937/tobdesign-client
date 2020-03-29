<style scoped>
</style>

<template>
  <div class="video-wrapper" :style="{
    width: width === 'auto' ? '100%' : width,
    height: height === 'auto' ? '100%' : height
  }">
    <video ref="videoPlayer" class="video-js" :controls="controls" :poster="poster" data-setup="{}" :style="{
      width: width === 'auto' ? '100%' : width,
      height: height === 'auto' ? '100%' : height
    }">
      <source :src="src">
      <p class="vjs-no-js">
        您的浏览器不支持这个视频。
      </p>
    </video>
  </div>
</template>

<script>
import util from '../common/util.js'

export default {
  data () {
    return {}
  },
  props: {
    // 视频源
    src: {
      type: String,
      required: true
    },
    // 视频海报
    poster: {
      type: String,
      default: ''
    },
    // 自动播放
    autoPlay: {
      type: Boolean,
      default: false
    },
    // 面板
    controls: {
      type: Boolean,
      default: true
    },
    // 宽
    width: {
      type: String,
      default: 'auto'
    },
    // 高
    height: {
      type: String,
      default: 'auto'
    }
  },
  computed: {},
  methods: {
    init () {
      let videojs = window.videojs
      let self = this

      videojs(this.$refs['videoPlayer']).ready(function() {
        self.autoPlay && this.play()
      })
    }
  },
  async created () {
    if (typeof window.videojs === 'undefined') {
      try {
        await util.loadJS('/lib/video.js/video.min.js')
      } catch (e) {
        console.error('video.js is missing', e.toString())
        return
      }
      try {
        await Promise.all([
          util.loadJS('/lib/video.js/ie8/videojs-ie8.min.js'),
          util.loadCSS('/lib/video.js/video-js.min.css')
        ])
      } catch (e) {
        console.error('video ie8 css file is missing', e.toString())
        return
      }

      this.init()
    }
  },
  mounted () {
    if (window.videojs) {
      this.init()
    }
  }
}
</script>
