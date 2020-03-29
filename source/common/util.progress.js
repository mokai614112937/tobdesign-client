import Main from '../components/progressDialog.vue'
const ProgressConstructor = Vue.extend(Main)

let instance

const Progress = function (options) {
  return new Promise((resolve, reject) => {
    if (!options.taskID) {
      reject('任务ID不能为空！')
      return
    }
    options.title = options.title ? options.title : '任务正在进行中. . .'
    options.successMessage = options.successMessage ? options.successMessage : null
    instance = new ProgressConstructor({
      data: options
    })
    instance.vm = instance.$mount()
    document.body.appendChild(instance.vm.$el)
    instance.vm.show = true
    instance.callback = (flag, msg) => {
      if (flag) {
        resolve()
      } else {
        reject(msg)
      }
    }
  })
}

export default Progress
