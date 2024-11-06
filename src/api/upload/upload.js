import request from '@/utils/request'

// 通用文件上传接口，根据 action 动态选择上传路径
export async function uploadFile(data, { action, onUploadProgress }) {
  return request({
    url: action, // 动态 URL，根据不同的存储位置传入不同的路径
    method: 'post',
    data,
    onUploadProgress
  })
}

// 通用文件删除接口，根据存储类型的 action URL 进行删除
export function deleteFile(id, action) {
  return request({
    url: `${action}/${id}`, // 动态删除 URL
    method: 'delete'
  })
}

// 通用文件编辑接口
export function editFile(data, action) {
  return request({
    url: action, // 动态 URL
    method: 'put',
    data
  })
}

export default {
  uploadFile,
  deleteFile,
  editFile
}
