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

// 检查卖家信息
export function checkSeller(params) {
  return request({
    url: 'api/sellerInfo/checkSeller',
    method: 'get',
    params
  })
}

// 检查推荐人信息
export function checkReferrer(params) {
  return request({
    url: 'api/sellerInfo/checkReferrer',
    method: 'get',
    params
  })
}
export default { add, edit, del, checkSeller, checkReferrer }
