import request from '@/utils/request'

const BASE_URL = '/knowledge/knowledge_base'

export function getKnowledgeList(knowledgeBaseId, params) {
  return request({
    url: BASE_URL + `/${knowledgeBaseId}/knowledge_item/`,
    method: 'get',
    params: params
  })
}

export function createKnowledge(knowledgeBaseId, data) {
  return request({
    url: BASE_URL + `/${knowledgeBaseId}/knowledge_item/`,
    method: 'post',
    data
  })
}

export function updateKnowledge(knowledgeBaseId, knowledgeItemId, data) {
  return request({
    url: BASE_URL + `/${knowledgeBaseId}/knowledge_item/${knowledgeItemId}/`,
    method: 'put',
    data
  })
}

export function deleteKnowledge(knowledgeBaseId, knowledgeItemId) {
  return request({
    url: BASE_URL + `/${knowledgeBaseId}/knowledge_item/${knowledgeItemId}/`,
    method: 'delete'
  })
}
