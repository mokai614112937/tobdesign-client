<style scoped>
  .audio-wrapper {
    width: 100%;
    height: 48px;
    position: relative;
    background-color: #fff;
    border: 1px solid #ddd;
  }

  .audio-progress {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    background-color: #0ac674;

    transition: width .2s ease-in 0s;
  }

  .audio-player {
    position: relative;
    display: flex;
    height: 46px;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
  }

  .audio-play {
    opacity: 0;
    height: 1px;
    width: 1px;
  }
  .audio-main {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
  }
  .audio-main .audio-icon {
    width: 48px;
    height: 48px;
    cursor: pointer;
    text-align: center;
  }
  .audio-icon .fa {
    font-size: 20px;
    margin: 0 auto;
    line-height: 48px;
  }
  .audio-duration {
    padding-right: 8px;
  }

  .audio-wrapper.mini {
    height: 30px;
  }
  .audio-wrapper.mini .audio-player {
    height: 28px;
  }
  .audio-wrapper.mini .audio-main .audio-icon {
    width: 28px;
    height: 28px;
  }
  .audio-wrapper.mini .audio-icon .fa {
    font-size: 14px;
    line-height: 28px;
  }
</style>

<template>
  <div class="audio-wrapper" :class="{
      'mini': size === 'mini'
    }">
    <div class="audio-progress" :style="{
      'width': percentage
    }"></div>
    <div class="audio-player">

      <audio :src="src" ref="audioPlay" class="audio-play" @loadedmetadata="handleLoadedMetaData"
             @timeupdate="handleTimeUpdate" @ended="handleEnded"></audio>

      <div class="audio-main">
        <div class="audio-icon" @click="handleClickPlay">
          <i class="fa fa-play" :class="{
            'fa-play': !isPlay,
            'fa-pause': isPlay
          }"></i>
        </div>

        <div class="audio-title">
          {{title}}
        </div>
      </div>

      <div class="audio-duration">
        {{formatDuration}}
      </div>

    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      duration: 0,
      isLoading: true,
      isPlay: false,
      progress: 0
    }
  },
  props: {
    // 音频源
    src: {
      type: String,
      required: true
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 自动播放
    autoPlay: {
      type: Boolean,
      default: false
    },
    // 大小
    size: {
      type: String,
      default: 'small'
    }
  },
  computed: {
    formatDuration () {
      if (this.isLoading) {
        return ''
      }

      const minute = parseInt(this.duration / 60)

      const second = this.duration % 60

      return `时长：${minute}:${second}`
    },
    percentage () {
      if (this.isLoading || this.duration === 0) {
        return '0'
      }

      const p = (this.progress / this.duration) * 100

      return Math.ceil(p) + '%'
    }
  },
  methods: {
    handleLoadedMetaData (e) {
      this.duration = Math.ceil(e.target.duration)
      this.isLoading = false

      if (this.autoPlay) {
        this.$refs['audioPlay'].play()
        this.isPlay = true
      }
    },
    handleClickPlay () {
      if (this.isPlay) {
        this.$refs['audioPlay'].pause()
        this.isPlay = false
      } else {
        this.$refs['audioPlay'].play()
        this.isPlay = true
      }
    },
    handleTimeUpdate (e) {
      this.progress = Math.ceil(e.target.currentTime)
    },
    handleEnded () {
      this.progress = 0
      this.isPlay = false
    }
  },
  mounted () {

  },
  created () {

  }
}
</script>
