import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/order',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/order/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/order',
    method: 'put',
    data
  })
}
// 检查卖家是否存在
export function checkSellerExists(params) {
  return request({
    url: 'api/sellerInfo/checkSellerExists',
    method: 'get',
    params
  })
}

// 检查推荐人是否存在
export function checkRecommenderExists(params) {
  return request({
    url: 'api/sellerInfo/checkRecommenderExists',
    method: 'get',
    params
  })
}
export default { add, edit, del, checkRecommenderExists, checkSellerExists }
