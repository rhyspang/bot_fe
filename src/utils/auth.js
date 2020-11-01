import Cookies from 'js-cookie'

const TokenKey = 'as_bot_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setAuth() {
  return Cookies.set('Authorization', 'Bearer ' + getToken())
}
