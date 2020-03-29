const util = window.util = window.util || {}
const url = util.url = util.url || {}

url.join = (baseURL, path) => {
  baseURL = baseURL.match(/https?:\/\//) ? baseURL : window.location.protocol + '//' + baseURL
  baseURL = baseURL.endsWith('/')
    ? baseURL.substring(0, baseURL.length - 1)
    : baseURL
  path = path.startsWith('/') ? path : `/${path}`

  return `${baseURL}${path}`
}

// url追加参数
url.addParams = (url,obj,clearOldParams = true) => {
  let params=''
  if (typeof obj == 'object'){
    for (let i in obj) {
      if (obj.hasOwnProperty(i) === true) {
        params = `${params}&${i}=${obj[i]}`
      }
    }

    url = ((clearOldParams == 'true' || clearOldParams == true) && url.includes('?')) ? url.split('?')[0] : url
    url = url.endsWith('/') || url.endsWith('?') || url.endsWith('&') ? url.substring(0, url.length - 1) : url

    if(!!url && (url.includes('&') || url.includes('?'))){
      params = params.startsWith('&') ? params : `&${params}`
    }else{
      params = params.startsWith('&') ? `?${params.substring(1)}` : `?${params}`
    }
  }
  return `${url}${params}`
}

export default url
