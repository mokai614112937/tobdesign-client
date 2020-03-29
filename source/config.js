
/* global localStorage */
window.namespace = function(p) {
  p = p.split('.')
  let o = window
  for (let i = 0; i < p.length; ++i) {
    o = o[p[i]] = o[p[i]] || {}
  }
  return o
}
let pathName = window.location.pathname.substring(1)
let contextPath = pathName === '' || pathName === undefined ? '' : pathName.substring(0, pathName.indexOf('/'))
let localURL = localStorage.serverURL || 'http://localhost:666/'
if (window.BABEL_ENV !== 'development' && window.location.host !== 'localhost:3000') {
  if (contextPath === '') {
    localURL = window.location.protocol + '//' + window.location.host + '/'
  } else {
    localURL = window.location.protocol + '//' + window.location.host + '/' + contextPath + '/'
  }
}
// const serverURL = 'https://cs.coaledu.cn/course/ui/' || localURL
const serverURL = 'http://localhost:8099/teach/ui/' || localURL
// 配置
export default {
  serverURL: serverURL,
  axios: {
    baseURL: serverURL,
    timeout: 30000000,
    headers: {
      post: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    },
    withCredentials: true
  }
}
