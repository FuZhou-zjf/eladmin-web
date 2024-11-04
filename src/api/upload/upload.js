// upload.js

import request from '@/utils/request'

// 上传文件到本地存储
export function uploadToLocal(data) {
  return request({
    url: 'api/localStorage',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 上传文件到云端存储
export function uploadToCloud(data) {
  return request({
    url: 'api/cloudStorage',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export async function uploadFile(data, options = {}) {
  const { storageType = 'cloud', onUploadProgress } = options

  try {
    // 根据存储类型选择上传方式
    let response
    if (storageType === 'cloud') {
      response = await uploadToCloud(data, { onUploadProgress })
    } else {
      response = await uploadToLocal(data, { onUploadProgress })
    }
    return response
  } catch (error) {
    // 处理错误情况
    if (storageType === 'cloud') {
      console.error('云端上传失败，尝试上传到本地存储', error)
      try {
        const response = await uploadToLocal(data, { onUploadProgress })
        return response
      } catch (localError) {
        console.error('本地上传也失败了', localError)
        throw localError
      }
    } else {
      throw error
    }
  }
}
// 删除文件
export function deleteFile(id, storageType = 'local') {
  const urlMap = {
    local: `api/localStorage/${id}`,
    cloud: `api/cloudStorage/${id}`
  }
  return request({
    url: urlMap[storageType],
    method: 'delete'
  })
}

// 编辑文件信息
export function editFile(data, storageType = 'local') {
  const urlMap = {
    local: 'api/localStorage',
    cloud: 'api/cloudStorage'
  }
  return request({
    url: urlMap[storageType],
    method: 'put',
    data
  })
}

export default {
  uploadFile,
  deleteFile,
  editFile
}
