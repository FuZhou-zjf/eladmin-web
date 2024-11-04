import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/financeRecords',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/financeRecords/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/financeRecords',
    method: 'put',
    data
  })
}
export function query(params) {
  return request({
    url: 'api/financeRecords/query',
    method: 'get',
    params
  })
}

export default { add, edit, del, query }
