// 自定义指令

const directives = {
    install: (Vue, options = {}) => {
        Vue.directive('dbClick', {
            inserted(el, binding) {
                el.addEventListener('click', e => {
                    if (!el.disabled) {
                        el.disabled = true
                        let timer = setTimeout(() => {
                            el.disabled = false
                        }, 1000)
                    }
                })
            }
        })
    }
}

// 导出组件
export default directives