import Cookies from 'js-cookie'
const tokenName = 'to-design-admin-token'

export function getToken() {
  return Cookies.get(tokenName)
}

export function setToken(token) {
  return Cookies.set(tokenName, token)
}

export function removeToken() {
  return Cookies.remove(tokenName)
}
