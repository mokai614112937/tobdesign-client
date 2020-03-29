/* global URL */
import { Message, MessageBox, Notification } from 'element-ui'
import string from './util.string.js'
import url from './util.url.js'
import Progress from './util.progress.js'

const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1

const util = window.util = window.util || {}

util.string = string
util.url = url

util.title = (title) => {
  title = title ? title + ' - 中国煤炭工业协会现代远程教育培训网' : '中国煤炭工业协会现代远程教育培训网-管理系统'
  window.document.title = title
}

util.showProgress = (taskID, title, successMessage) => {
  return Progress({ taskID, title, successMessage })
}
util.showResponseMessage = (data) => {
  if (data.status === 1) {
    Message({
      showClose: true,
      duration: 2000,
      message: data.message || '操作成功！',
      type: 'success'
    })
    return
  }
  MessageBox({
    title: '提示',
    type: 'error',
    message: data.message || '操作失败！'
  })
}
util.showErrorMessageBox = async (msg) => {
  try {
    await MessageBox({
      title: '提示',
      type: 'error',
      message: msg.toString()
    })
  } catch (e) {

  }
}

util.showWarningMessageBox = async (msg) => {
  try {
    await MessageBox({
      title: '提示',
      type: 'warning',
      message: msg.toString()
    })
  } catch (e) {
  }
}
util.showErrorMessageBox = async (msg, htmlFlag) => {
  try {
    await MessageBox({
      title: '提示',
      type: 'error',
      message: msg.toString(),
      dangerouslyUseHTMLString: !!htmlFlag
    })
  } catch (e) {

  }
}
util.showMessage = (res) => {
  Message({
    showClose: true,
    duration: 2000,
    message: res.data.message,
    type: res.data.status === 1 ? 'success' : 'error'
  })
}
util.showSuccess = (msg) => {
  Message({
    message: msg,
    showClose: true,
    type: 'success',
    duration: 2000
  })
}
util.showError = (msg) => {
  Message({
    showClose: true,
    duration: 2000,
    message: msg,
    type: 'error'
  })
}
util.showNotification = (res) => {
  Notification({
    title: res.status === 1 ? '操作成功' : '操作失败',
    message: res.message,
    type: res.status === 1 ? 'success' : 'error',
    duration: 2000
  })
}
util.showErrorNotification = (error) => {
  Notification({
    title: '错误',
    message: error.toString(),
    type: 'error',
    duration: 2000
  })
}
// 获取树的指定属性的值节点
util.findTreeNode = (tree, key, val, childName) => {
  var result = null

  for (var i = 0; i < tree.length; i++) {
    if (tree[i][key] === val) {
      result = tree[i]
      break
    }

    if (tree[i][childName] && tree[i][childName].length) {
      var tmp = util.findTreeNode(tree[i][childName], key, val, childName)

      if (tmp) {
        result = tmp
        break
      }
    }
  }

  return result
}
// 获取树的指定属性的值节点的父节点
util.findTreeParentNode = (tree, key, val, childName) => {
  let result = null
  for (var i = 0; i < tree.length; i++) {
    if (tree[i][key] === val) {
      result = tree[i]
      break
    }
    if (!!(tree[i][childName]) && !!(tree[i][childName].length)) {
      var tmp = util.findTreeParentNode(tree[i][childName], key, val, childName)

      if (tmp) {
        if (tmp[key] === val) {
          result = tree[i]
        } else {
          result = tmp
        }
        break
      }
    }
  }

  return result
}
// 树节点的数量
util.treeNodeSize = (tree, childName) => {
  let result
  let child = []

  for (var i = 0; i < tree.length; i++) {
    if (tree[i][childName] && tree[i][childName].length) {
      let tmp = this.treeNodeSize(tree[i][childName], childName)

      child.push(tmp)
    }
  }

  let childTotal = child.reduce(function (sum, value) {
    return sum + value
  }, 0)

  result = i + childTotal

  return result
}
// 验证表单
util.validateForm = (formRef) => {
  return new Promise((resolve, reject) => {
    formRef.validate(valid => {
      if (valid) {
        return resolve(true)
      }
      return reject(new Error('没有正确填写表单项！'))
    })
  })
}
// 下载文件
util.downloadFile = (fileURL, fileName) => {
  return window.axios
    .get(fileURL, {
      responseType: 'blob'
    })
    .then(res => res.data)
    .then(blob => {
      let link = document.createElement('a')
      let url = window.URL.createObjectURL(blob)
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    })
}
util.urlJoin = (baseURL, path) => {
  baseURL = baseURL.startsWith('http://') ? baseURL : `http://${baseURL}`
  baseURL = baseURL.endsWith('/') ? baseURL.substring(0, baseURL.length - 1) : baseURL
  path = path.startsWith('/') ? path : `/${path}`

  return `${baseURL}${path}`
}
util.loadCSS = (url, insertBefore) => {
  var l = document.createElement('link')
  l.setAttribute('rel', 'stylesheet')
  l.setAttribute('type', 'text/css')
  l.setAttribute('href', url)
  if (insertBefore) {
    if (insertBefore.nodeName && insertBefore.nodeType === 1) {
      return document.head.insertBefore(l, insertBefore)
    }
    document.head.insertBefore(l, document.head.firstElementChild)
  } else {
    document.head.appendChild(l)
  }
}
util.loadJS = (url, data) => {
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script')
    s.setAttribute('src', url)
    if (data) {
      s.setAttribute('data', data)
    }
    document.head.appendChild(s)
    s.onload = resolve
    s.onerror = reject
  })
}
/**
   * 格式化时间为yyyy-MM-dd hh:mm:ss
   */
util.formatDate = (date, fmt) => {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }

  fmt = fmt || 'yyyy-MM-dd hh:mm:ss'
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'H+': date.getHours()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : ('00' + str).substr(str.length))
    }
  }
  return fmt
}
/**
 * 删除树节点
 * @param {*} tree 树
 * @param {*} key 属性
 * @param {*} val 值
 * @param {*} childName 子节点属性
 */
util.removeTreeNode = (tree, key, val, childName) => {
  for (var i = 0; i < tree.length; i++) {
    if (tree[i][key] === val) {
      tree.splice(i, 1)
      break
    }
    if (tree[i][childName] && tree[i][childName].length) {
      this.removeTreeNode(tree[i][childName], key, val, childName)
    }
  }
}
/**
 * 获取选择的行的ID
 */
util.getSelectedIDs = (rows, column) => {
  if (!column) {
    column = 'ID'
  }
  if (!rows || rows.length === 0) {
    util.showErrorMessageBox('请选择要操作的数据 ！')
    return
  }
  let ids = []
  rows.forEach(row => {
    ids.push(row[column])
  })
  if (!ids || ids.length === 0) {
    util.showErrorMessageBox(`传入${column}错误 ！`)
    return
  }
  return ids
}

// dt转树形结构json
util.toCatalogTreeJson = (data) => {
  if (!data) {
    return null
  }

  let tree = []
  try {
    // 删除所有children,防止多次调用
    data.forEach(function (item) {
      delete item.children
    })

    // 将数据存储为以id为key的map
    let map = {}
    data.forEach(function (item) {
      map[item.ID] = item
    })
    // console.log(map);

    data.forEach(function (item) {
      // 以当前遍历项的pid,去map对象中找到索引的id
      let parent = map[item.parentID] || map[item.parentid]

      // 好绕啊！ 如果找到了索引，那么此节点不是根节点,需要把此节点添加到他对应的父节点下
      if (parent) {
        ; (parent.children || (parent.children = [])).push(item)
      } else {
        // 如果在map中没有找到对应的索引ID,就直接把当前的item添加到val中，作为根节点
        tree.push(item)
      }
    })
  } catch (e) {
    console.log(e)
  }
  return tree
}
/**
 * 树节点渲染函数
 * @param {*参数对象} params
 */
util.renderTreeContent = (params) => {
  let color = ''
  let isDisabledStyle = ''
  let contentType = params.treeObj.node.data.contentType

  if (params.status) {
    if (params.treeObj.node.data.status === 1) {
      color = 'red'
    }
    if (params.treeObj.node.data.visibleFlag === 'N') {
      color = '#ACA899'
    }
  }
  if (params.ID) {
    if (params.treeObj.data.ID === params.ID) {
      isDisabledStyle = 'color: #b4bccc;cursor: not-allowed;'
    }
  }
  if (params.innerCode) {
    if (params.innerCode.length === 6 && params.treeObj.data.innerCode === 0) {
      isDisabledStyle = 'color: #b4bccc;cursor: not-allowed;'
    }
    if (
      params.innerCode.startsWith(params.treeObj.data.innerCode) &&
      params.innerCode.length / 6 === params.treeObj.data.innerCode.length / 6 + 1
    ) {
      isDisabledStyle = 'color: #b4bccc;cursor: not-allowed;'
    }
    if (params.treeObj.data.innerCode.startsWith(params.innerCode)) {
      isDisabledStyle = 'color: #b4bccc;cursor: not-allowed;'
    }
  }
  let icon = 'fa fa-folder'
  if (parseInt(params.treeObj.node.data.ID) === 0 ||
    parseInt(params.treeObj.data.branchInnerCode) === 0 ||
    params.treeObj.data.ID === 'site') {
    icon = 'fa fa-desktop'
  }

  return params.h('span', { attrs: { style: isDisabledStyle } }, [
    params.h('i', { attrs: { class: params.icon ? params.icon : icon } }),
    params.h('span', { attrs: { class: 'span-label', contenttype: contentType }, style: { color: color } }, params.treeObj.node.label)
  ])
}
/**
 * 通过文件名称获取图片
 * @param {*文件名称} name
 */
util.getFileIconByName = (name) => {
  const iconTypes = ['asp', 'aspx', 'avi', 'bmp', 'doc', 'docx', 'exe', 'fla', 'flv', 'folder', 'gif', 'htm', 'html', 'jar',
    'jpeg', 'jpg', 'js', 'jsp', 'mdb', 'mov', 'mp3', 'mp4', 'pdf', 'php', 'png', 'ppt', 'pptx', 'rar', 'rm', 'shtml', 'swf',
    'txt', 'wmp', 'wmv', 'xls', 'xlsx', 'zip']
  let suffix = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
  if (!iconTypes.includes(suffix)) {
    return 'assets/images/framework/filetype/unknown.gif'
  }
  return `assets/images/framework/filetype/${suffix}.gif`
}
// 判断是否是空对象
util.isEmptyObject = (e) => {
  var t
  for (t in e) {
    return !1
  }
  return !0
}
util.getQueryString = (name) => {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  var r = window.location.search.substr(1).match(reg) // 这里返回找到正则的匹配

  if (r != null) {
    return unescape(r[2]) // 这里返回对应的值
  }
  return null
}

util.mousewheel = (element, callback) => {
  if (element && element.addEventListener) {
    element.addEventListener(isFirefox ? 'DOMMouseScroll' : 'mousewheel', callback, { passive: true })
  }
}

/*
 动态添加路由
  component: require('../../views/xx.vue').default
  $vue:this
*/
util.addRoute = (component, $vue) => {
  if (!component || !$vue) {
    console.log('component,$vue is required')
    return
  }
  const routes = $vue.$router.options.routes
  const currentRouterPath = $vue.$route.path
  let componentPath = component['__file'].replace(/\\/g, '/')
  const newRouterPath = componentPath.substring(componentPath.lastIndexOf('/') + 1, componentPath.lastIndexOf('.')).toLowerCase()
  const newRoute = {
    path: `${currentRouterPath}/${newRouterPath}`,
    component: component
  }

  let parentIndex = routes.findIndex(item => item.path !== '/' && currentRouterPath.startsWith(item.path))
  // let curretnIndex = routes[parentIndex].children.findIndex(item=>item.path===currentRouterPath || item.path+'/'===currentRouterPath)
  // let currentRouter = routes[parentIndex].children[curretnIndex]

  let isExists = $vue.$router.options.routes[parentIndex].children.findIndex(item => item.path === newRoute.path) !== -1
  if (!isExists) {
    $vue.$router.options.routes[parentIndex].children.push(newRoute)
    $vue.$router.addRoutes($vue.$router.options.routes)
    window.sessionStorage.setItem('routes', $vue.$router.options.routes)
  }

  return newRoute
}
util.getParentRoutePath = (routes, currentRouterPath) => {
  let parentIndex = routes.findIndex(item => item.path !== '/' && currentRouterPath.startsWith(item.path))
  if (parentIndex === -1) {
    return ''
  }
  let p = routes[parentIndex]
  if (!p || !p.children) {
    return ''
  }
  p = p.children.find(item => currentRouterPath.startsWith(item.path))
  return p ? p.path : ''
}
util.setItem = (key, val) => {
  if (!key || !val) {
    return
  }
  window.sessionStorage.setItem(key, val)
}
util.getItem = (key) => {
  if (!key) {
    return null
  }
  let val = window.sessionStorage.getItem(key)
  window.sessionStorage.removeItem(key)
  return val
}

util.recordMenuClick = (path) => {
  if (path) {
    // eslint-disable-next-line no-undef
    path = _.replace(path, /\/$/, '') // 去掉末尾的/
    // eslint-disable-next-line no-undef
    path = _.replace(path, /\/:.+/, '') // 取到路由中可能的占位符
    axios.get('/application/changemenuclickcount', {
      params: {
        menuPath: path
      }
    })
  }
}

util.getSecondLevelMenus = (firstLevelPath) => {
  let pmenu = window.routes.filter(item => item.path === firstLevelPath)
  if (pmenu[0] && pmenu[0].children) {
    return pmenu[0].children.filter(menu => !!menu.meta)
  }
}

util.delHtmlTagChar = function(str, noTrim) {
  if (!str) {
    return ''
  }
  let res = str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<')
  return !noTrim ? res.trim() : res
}

/**
 * 返回带中文字符的字符串的长度
 * @param {*字符串} src
 * @param {*是否为UTF-8编码格式} UTF8Flag
 */
util.getLengthEx = (src, UTF8Flag) => {
  let byteLen = 0
  // 特殊处理：如果字段的值是null的话 则返回字符串长度为0
  if (!src) {
    return 0
  }
  let len = src.length
  for (let i = 0; i < len; i++) {
    if (src.charCodeAt(i) > 255) {
      if (UTF8Flag) {
        byteLen += 3 // UTF-8编码
      } else {
        byteLen += 2
      }
    } else {
      byteLen++
    }
  }
  return byteLen
}

util.timeStamp = (s) => {
  if (!/\d/.test(s)) {
    return ''
  }
  let StatusMinute = s / 60
  let day = parseInt(StatusMinute / 60 / 24)
  let hour = parseInt(StatusMinute / 60 % 24)
  let min = parseInt(StatusMinute % 60)

  StatusMinute = ''
  if (day > 0) {
    StatusMinute = day + '天'
  }
  if (hour > 0) {
    StatusMinute += hour + '小时'
  }
  if (min > 0) {
    StatusMinute += parseFloat(min) + '分钟'
  }
  return StatusMinute
}

export default util
