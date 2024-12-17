import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/sellerInfo',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/sellerInfo/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/sellerInfo',
    method: 'put',
    data
  })
}

// 搜索卖家信息
export function searchSeller(params) {
  return request({
    url: '/api/sellerInfo',
    method: 'get',
    params: {
      nickName: params.keyword,
      page: params.page || 0,
      size: params.size || 10
    }
  })
}

export default { add, edit, del, searchSeller }
