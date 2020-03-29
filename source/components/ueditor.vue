<template>
  <div class="vue-ueditor">
    <textarea :id="id" :name="id" :homeurl="homeurl" cols="100" rows="14" class="textarea-ueditor">
    </textarea>
  </div>
</template>

<script>
import util from '../common/util.js'

const UEDITOR_HOME_URL = './lib/neditor/'
let inc = 0

export default {
  name: 'ueditor',
  props: {
    content: {
      type: String
    },
    homeurl: {
      // NEditor js 所在目录的路径
      type: String,
      required: false,
      default: () => UEDITOR_HOME_URL
    },
    config: {
      // NEditor 配置项
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    },
    autoInit: {
      type: Boolean,
      default: true
    },
    fixed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    inc++
    return {
      id: `editor_${inc}`,
      instance: null,
      destroyed: false,
      defaultConfig: {
        initialFrameWidth: '100%',
        // initialFrameHeight: 200,
        UEDITOR_HOME_URL: UEDITOR_HOME_URL,
        toolbars: [
          [
            'Undo',
            'Redo',
            '|',
            'Bold',
            '|',
            'FontSize',
            'TextColor',
            '|',
            'Link',
            'Unlink',
            '|',
            'BulletedList',
            'NumberedList',
            '|',
            'JustifyLeft',
            'JustifyCenter',
            'JustifyRight'
          ]
        ],
        autoHeightEnabled: false // 设置文本框编辑器出现滚动条
      },
      scrollHandler: null
    }
  },
  watch: {
    content(val) {
      if (this.instance && this.instance.body && this.instance.body.innerHTML) {
        let html = this.instance.getContent()
        if (val && val !== '' && val !== html) {
          this.instance.setContent(val)
        }
      }
    }
  },
  async created() {
    // let self = this

    if (typeof window.UE === 'undefined') {
      try {
        await util.loadJS(this.homeurl + 'neditor.config.js')
      } catch (e) {
        console.error('neditor.config.js is missing', e.toString())
        return
      }
      try {
        await util.loadJS(this.homeurl + 'neditor.all.js')
        await util.loadJS(this.homeurl + 'com.zving/vendors.js')
      } catch (e) {
        console.error('neditor.all.js is missing', e.toString())
        return
      }
      try {
        await Promise.all([
          // util.loadJS(Zving.UEditorPath + 'zimage.js'),
          // util.loadJS(Zving.UEditorPath + 'zcatalog.js'),
          // util.loadJS(Zving.UEditorPath + 'zcontent.js'),
          // util.loadJS(Zving.UEditorPath + 'zresourceurl.js'),
          // util.loadJS(Zving.UEditorPath + 'zaudio.js'),
          // util.loadJS(Zving.UEditorPath + 'zvideo.js'),
          // util.loadJS(Zving.UEditorPath + 'zfile.js'),
          // util.loadJS(Zving.UEditorPath + 'zcomment.js'),
          // util.loadJS(Zving.UEditorPath + 'articlelogo.js'),
          // util.loadJS(Zving.UEditorPath + 'zarticlesetting.js'),
          // util.loadJS(Zving.UEditorPath + 'zuploadlocalimage.js'),
          // util.loadJS(Zving.UEditorPath + 'zpagebreak.js'),
          // util.loadJS(Zving.UEditorPath + 'zweiboshow.js'),
          // util.loadJS(Zving.UEditorPath + 'zfontface.js'),
          // util.loadJS(Zving.UEditorPath + 'autoformat.js'),
          // util.loadJS(Zving.UEditorPath + 'zimagegroup.js'),
          // util.loadJS(Zving.UEditorPath + 'zcheckwords.js'),
          // util.loadJS(Zving.UEditorPath + 'zimageplayer.js'),
          // util.loadJS(Zving.UEditorPath + 'zatverdise.js'),
          // util.loadJS(Zving.UEditorPath + 'zvote.js'),
          // util.loadJS(Zving.UEditorPath + 'zimgcutting.js'),
          // util.loadJS(Zving.UEditorPath + 'zchangeimg.js'),
          // util.loadJS(Zving.UEditorPath + 'zMenuButton.js'),
          // util.loadJS(Zving.UEditorPath + 'zpostil.js'),
          // util.loadJS(Zving.UEditorPath + 'zwxeditor.js')
        ])
      } catch (e) {
        console.error(e)
      }
      this.$emit('loaded')
      this.autoInit && this.initEditor()
    } else {
      this.autoInit && this.initEditor()
    }
  },
  methods: {
    initEditor() {
      // Vue 异步执行 DOM 更新，这样一来代码执行到这里的时候可能 template 里面的 script 标签还没真正创建
      // 所以，我们只能在 nextTick 里面初始化 UEditor
      this.$nextTick(() => {
        this.instance = window.UE.getEditor(
          this.id,
          Object.assign({}, this.defaultConfig, this.config)
        )

        // 绑定事件，当 UEditor 初始化完成后，将编辑器实例通过自定义的 ready 事件交出去
        this.instance.on('ready', () => {
          this.instance.setContent(this.content || '')
          // 设置编辑器的高度
          // this.instance.setHeight(200)

          this.$emit('ready', this.instance)
          this.fixed && this.fixedToolBar()
        })

        this.instance.on('contentChange', () => {
          let html = this.instance.getContent()
          if (html !== this.content) {
            this.$emit('contentChange', html)
            this.$emit('update:content', html)
          }
        })

        this.instance.on('changeOptions', () => {
          this.$emit('changeOptions')
        })

        //         警告： 该事件的触发非常频繁，不建议在该事件的处理过程中做重量级的处理
        //         this.instance.on('selectionchange', () => {
        //           this.$emit('selectionchange', this.instance)
        //         })

        this.instance.on('focus', () => {
          this.$emit('focus', this.instance)
        })

        this.instance.on('blur', () => {
          this.$emit('blur', this.instance)
        })

        this.instance.on('reset', () => {
          this.$emit('reset', this.instance)
        })

        this.instance.on('destroy', () => {
          this.$emit('destroy', this.instance)
        })
      })
    },
    fixedToolBar() {
      let scrollWrap = document.querySelector('.app-wrap')

      function offset(target) {
        var top = 0

        var left = 0

        while (target.offsetParent) {
          top += target.offsetTop
          left += target.offsetLeft
          target = target.offsetParent
        }

        return {
          top: top,
          left: left
        }
      }

      let _tool = null; let $wxEditor; let _fixedData = null
      this.scrollHandler = (e) => {
        let _offset = offset(this.$el)

        let _w = this.$el.offsetWidth

        let _h = this.$el.offsetHeight

        let _top = e.target.scrollTop

        let _diff = _top - _offset.top
        if (_tool === null) {
          _tool = this.$el.querySelector('.edui-editor-toolbarboxouter.edui-notadd')
          let wxEditorEl = this.$el.parentNode.querySelector('.tool-panel-left')
          $wxEditor = $(wxEditorEl)
        }

        if (_diff > 0 && _diff < _h) {
          _tool.style.position = 'fixed'
          _tool.style.left = _offset.left + 'px'
          _tool.style.top = '0'
          _tool.style.width = _w + 'px'
          _tool.style.zIndex = '3001'
          $wxEditor.css({'position': 'fixed', 'left': _offset.left + 'px'})
          _fixedData = {
            position: 'fixed',
            left: _offset.left + 'px',
            top: 0,
            width: _w + 'px',
            'z-index': 3001
          }
        } else {
          _tool.style.position = ''
          _tool.style.left = ''
          _tool.style.top = ''
          _tool.style.width = ''
          _tool.style.zIndex = ''
          _fixedData = null
          $wxEditor.css({'position': 'absolute', 'left': '0px'})
        }
      }
      this.instance.on('fullscreenchanged', (e, enabled) => {
        if (_tool === null) {
          _tool = this.$el.querySelector('.edui-editor-toolbarboxouter.edui-notadd')
          let wxEditorEl = this.$el.parentNode.querySelector('.tool-panel-left')
          $wxEditor = $(wxEditorEl)
        }
        if (enabled) {
          _tool.style.width = '100%'
          _tool.style.left = 0
          _tool.style.position = 'static'
        } else {
          if (_fixedData !== null) {
            $(_tool).css(_fixedData)
          }
        }
      })
      scrollWrap.addEventListener('scroll', this.scrollHandler, false)
    }
  },
  beforeDestroy() {
    // 组件销毁的时候，要销毁 UEditor 实例
    if (this.instance !== null && this.instance.destroy) {
      let scrollWrap = document.querySelector('.app-wrap')
      this.scrollHandler && scrollWrap.removeEventListener('scroll', this.scrollHandler)

      this.instance.destroy()
      this.destroyed = true
    }
  }
}
</script>
<style scoped>
  .vue-ueditor::after {
    content: '';
    display: table;
    clear: both;
  }

  .vue-ueditor .textarea-ueditor {
    color: #777;
    border-color: #fff;
    outline: none;
    resize: none;
  }

</style>
