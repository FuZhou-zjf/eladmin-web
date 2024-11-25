import request from '@/utils/request'
import AliOSSUploader from '@/utils/alioss'

const ossUploader = new AliOSSUploader()

// 通用文件上传接口，根据 action 动态选择上传路径
export async function uploadFile(data, { action, onUploadProgress }) {
  // 如果是阿里云上传
  if (action.includes('aliyun')) {
    const file = data.get('file')
    return ossUploader.multipartUpload(file, onUploadProgress)
  }
  // 其他存储方式保持不变
  return request({
    url: action,
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
