// 自定义过滤器
function formatDate (v, fmt) {
  if (/([yY]+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (v.getFullYear() + '').substring(4 - RegExp.$1.length))
  }
  let o = {
    'M+': v.getMonth() + 1,
    '[dD]+': v.getDate(),
    '[Hh]+': v.getHours(),
    'm+': v.getMinutes(),
    '[sS]+': v.getSeconds()
  }
  for (let k in o) {
    let str = o[k] + ''
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padding(str))
    }
  }
  return fmt
}

function formatNumber (v, fmt) {
  // 获得小数部分
  let dotPos = fmt.indexOf('.')
  let precision = dotPos >= 0 ? fmt.substring(dotPos + 1).length : 0
  v = v.toFixed(precision)
  let prefix = precision === 0 ? v : v.substring(0, v.length - precision - 1)
  let suffix = precision === 0 ? '' : v.substring(v.length - precision)

  // 分隔符
  let spliter = ''
  let splitLength = 0
  for (let i = 0; i < fmt.length; i++) {
    if (fmt.charAt(i) !== '#' && fmt.charAt(i) !== '.') {
      spliter = fmt.charAt(i)
      splitLength = fmt.length - i - 1 - precision
      break
    }
  }
  // console.log([spliter, splitLength])
  if (spliter && splitLength > 0) {
    let arr = prefix.split('').reverse()
    for (let i = 0; i * splitLength < prefix.length; i++) {
      if (i !== 0) {
        arr.splice(i * splitLength, 0, spliter)
      }
    }
    prefix = arr.reverse().join('')
  }

  return suffix ? prefix + '.' + suffix : prefix
}

function padding (str) {
  return ('00' + str).substring(str.length)
}

// 表达式支持格式化
function format (v, fmt) {
  if (!v) {
    return v
  }
  if (v.constructor === Date) {
    return formatDate(v, fmt || 'yyyy-MM-dd hh:mm:ss')
  } else if (typeof v === 'number' || v.constructor === Number) {
    return formatNumber(v, fmt || '#,###.##')
  }
  return v
}

export default format
