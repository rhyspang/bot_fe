import request from '@/utils/request'

const BASE_URL = 'http://localhost:8000/api/knowledge/knowledge_base/'

export function createStore(data) {
  return request({
    url: `${BASE_URL}`,
    method: 'post',
    data
  })
}

export function getStoreList(params) {
  return request({
    url: `${BASE_URL}`,
    method: 'get',
    params: params
  })
}

export function deleteStore(knowledgeBaseId) {
  return request({
    url: BASE_URL + `${knowledgeBaseId}/`,
    method: 'delete',
    params: { id: knowledgeBaseId }
  })
}

export function updateStore(knowledgeBaseId, data) {
  return request({
    url: BASE_URL + `${knowledgeBaseId}/`,
    method: 'put',
    data
  })
}

export function updateStoreUser(storeId, userIdList) {
  // userIdList = [1, 2, 3]
  console.log('userIdList', userIdList)
  return request({
    url: BASE_URL + `${storeId}/update_users/`,
    method: 'post',
    data: {
      users: userIdList
    }
  })
}
