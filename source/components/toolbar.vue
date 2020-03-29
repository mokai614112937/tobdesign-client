
<template>
  <div class="el-toolbar" :class="{ small: size === 'small' }">
    <div class="el-toolbar-body" :style="{ justifyContent: align === 'left' ? 'flex-start' : 'flex-end' }">
      <slot></slot>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'

export default {
  data() {
    return {
      hiddenChildren: [],
      dropDownItems: []
    }
  },
  props: {
    size: {
      type: String,
      default: 'normal'
    },
    align: {
      type: String,
      default: 'left'
    }
  },
  methods: {
    shrink(wrapWidth, contentWidth) {
      let overflowWidth = contentWidth - wrapWidth
      for (let n = this.$children.length - 1; n >= 0; n--) {
        const components = ['content-publish-button', 'content-add-button', 'content-attributes-button']
        if (components.includes(this.$children[n].$options['_componentTag'])) {
          const buttons = this.$children[n].$children

          for (let x = buttons.length - 1; x >= 0; x--) {
            if (buttons[x].$el.nodeName !== 'BUTTON') {
              continue
            }

            this.hiddenChildren.unshift(buttons[x])

            overflowWidth = overflowWidth - buttons[x].$el.offsetWidth - 10

            if (overflowWidth <= -30) {
              break
            }
          }
        }

        if (this.$children[n].$el.nodeName !== 'BUTTON') {
          continue
        }

        this.hiddenChildren.unshift(this.$children[n])

        overflowWidth = overflowWidth - this.$children[n].$el.offsetWidth - 10

        if (overflowWidth <= -30) {
          break
        }
      }
      if (this.hiddenChildren.length) {
        this.createDropDown()
      }
    },
    createDropDown() {
      const length = this.$children.length
      const lastComponent = this.$children[length - 1]

      if (lastComponent.$options.componentName !== 'ElDropdown') return

      const menu = lastComponent.$children.find(val => val.$options.componentName === 'ElDropdownMenu')

      if (!menu) return

      this.hiddenChildren.forEach((val) => {
        val.$el.style.display = 'none'
        const text = val.$el.innerText.trim().split('\n')

        const title = text.length ? text[0] : ''

        const icon = val.$el.querySelector('i') ? val.$el.querySelector('i').className : ''

        const item = new (Vue.extend({
          template: '<el-dropdown-item><el-button @click="clickHandler" type="text"><i class="' + icon + ' f16"></i>' + title + '</el-button></el-dropdown-item>',
          methods: {
            clickHandler: function() {
              val.$el.click()
            }
          }
        }))()

        item.$mount()

        menu.$el.appendChild(item.$el)
      }, this)
    },
    handleDropDownClick(item) {
      item.$el.click()
    }
  },
  created() {
  },
  mounted() {
    let body = this.$el.querySelector('.el-toolbar-body')

    if (body.offsetWidth > this.$el.offsetWidth) {
      this.shrink(this.$el.offsetWidth, body.offsetWidth)
    }
  }
}
</script>
<style>
  .el-toolbar {
    width: 100%;
    position: relative;
  }
  .el-toolbar,
  .el-toolbar-body {
    background-color: #f8f8f8;
  }

  .layout-col-menu .el-toolbar,
  .layout-col-menu .el-toolbar-body {
    background-color: #e8eaed;
  }
  .layout-col-list .el-toolbar,
  .layout-col-list .el-toolbar-body {
    background-color: #f8f8f8;
  }
  .layout-col-detail .el-toolbar,
  .layout-col-detail .el-toolbar-body {
    background-color: #eceef3;
  }

  .layout-col-detail .el-toolbar-body {
    /* box-shadow: inset 1px 0px 0px rgba(0, 0, 0, 0.06); */
  }
  .layout-col-menu .el-toolbar-body {
    box-shadow: inset -1px 0 3px rgba(0, 0, 0, 0.1);
  }
  .el-toolbar {
    height: 50px;
    border-bottom: 1px solid #ddd;
    margin: 0 !important;
  }

  .el-toolbar.small {
    height: 36px;
  }

  .el-toolbar-body {
    position: absolute;
    z-index: 100;
    /*left: 0;*/
    min-width: 100%;
    display: flex;
    align-items: center;
    align-content: center;
    height: 50px;
    font-size: 14px;
    border-bottom: 1px solid #ddd;
  }

  .el-toolbar-body {
    padding-left: 10px;
    padding-right: 10px;
  }

  .el-toolbar-body > span,
  .el-toolbar-body > .el-button:last-child,
  .el-toolbar-body > .el-toolbar-btn:last-child {
    margin-right: 10px;
  }

  .el-toolbar.small .el-toolbar-body {
    height: 36px;
  }

  .el-toolbar-body .button-separator {
    padding: 11px 0;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.25);
    display: inline-block;
    margin: 6px;
  }

  @media (max-width: 576px) {
    .el-toolbar,
    .el-toolbar-body {
      min-height: 50px;
      height: auto;
    }

    .el-toolbar.small,
    .el-toolbar.small .el-toolbar-body {
      min-height: 36px;
      height: auto;
    }

    .el-toolbar-body {
      position: relative;
      flex-flow: row wrap;
      padding: 5px 0;
    }
  }

  .el-toolbar .el-button {
    background: transparent;
  }

  .el-toolbar .el-button.is-disabled {
    background-color: transparent;
    border-color: transparent;
  }

  .el-toolbar .el-button--primary {
    color: #fff;
    background-color: #00AF80;
    border-color: #00AF80;
  }

  .el-toolbar.small .bar-dropDown-wrap {
    height: 35px;
    line-height: 35px;
    font-size: 14px;
  }
  .bar-dropDown-wrap {
    display: none;
    position: absolute;
    z-index: 101;
    right: 0;
    top: 0;
    bottom: 0;
    width: 32px;
    height: 49px;
    line-height: 49px;
    text-align: center;
    /*font-size: 16px;*/
    /*color: #353535;*/
    font-weight: 400;
    cursor: pointer;
  }
  .bar-dropDown-wrap.active {
    display: block;
  }
  .bar-dropDown-wrap:hover {
    background-color: #eee;
    /*color: #ffffff;*/
  }
  .bar-dropDown-wrap:hover .menu-list {
    display: block;
  }
  .bar-dropDown-wrap .menu-list {
    list-style: none;
    display: none;
    top: 26px;
    right: 0;
    position: absolute;
    z-index: 1001;
    border: 1px solid #dfe4ed;
    border-radius: 4px;
    background-color: #fff;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 10px 0;
  }
  .menu-list .item-name {
    padding-left: 6px;
  }
  .bar-dropDown-wrap .menu-list .menu-item {
    list-style: none;
    display: block;
    padding: 0 20px;
    line-height: 36px;
    white-space: nowrap;
    text-align: left;
    font-size: 14px;
  }
  .bar-dropDown-wrap .menu-list .menu-item.disabled {
    cursor: not-allowed;
    color: #bfcbd9;
  }
  .bar-dropDown-wrap .menu-list .menu-item:not(.is-disabled):hover {
    background-color: #ecf5ff;
    color: #66b1ff;
  }
  .el-popper[x-placement^=bottom] .popper__arrow{
    right: 7px;
    left: auto;
  }
</style>
