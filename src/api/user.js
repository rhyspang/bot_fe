import request from '@/utils/request'

const BASE_URL = 'http://localhost:8000/api'

export function login(data) {
  return request({
    url: `${BASE_URL}/auth/token/`,
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: `${BASE_URL}/auth/user/info/`,
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}

export function getUserList() {
  return request({
    url: BASE_URL + '/auth/users/',
    method: 'get'
  })
}

export function createUser(userInfo) {
  return request({
    url: BASE_URL + '/auth/users/',
    method: 'post'
  })
}

export function deleteUser(userId) {
  return request({
    url: BASE_URL + `/auth/users/${userId}/`,
    method: 'delete'
  })
}

export function updateUser(userId, userInfo) {
  return request({
    url: BASE_URL + `/auth/users/${userId}/`,
    method: 'put',
    userInfo
  })
}
