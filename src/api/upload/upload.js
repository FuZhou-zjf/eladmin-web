import request from '@/utils/request'
import AliOSSUploader from '@/utils/alioss'
import FineUploader from 'fine-uploader'
import { getToken } from '@/utils/auth'

const ossUploader = new AliOSSUploader()

// 处理本地分片上传
async function handleLocalChunkUpload(file, action, onUploadProgress) {
  return new Promise((resolve, reject) => {
    let isCompleted = false

    const uploader = new FineUploader.FineUploaderBasic({
      debug: true,
      request: {
        endpoint: `${action}/chunk`,
        customHeaders: {
          Authorization: getToken()
        }
      },
      chunking: {
        enabled: true,
        partSize: 2000000,
        concurrent: {
          enabled: false
        }
      },
      callbacks: {
        onComplete: function(id, name, responseJson) {
          console.log('上传完成:', { id, name, responseJson })
          if (isCompleted) {
            return
          }

          if (responseJson && responseJson.success) {
            isCompleted = true
            resolve({
              data: responseJson
            })
          } else {
            const errorMessage = responseJson && responseJson.message
            reject(new Error(errorMessage || '上传失败003'))
          }
        },
        onError: function(id, name, errorReason, xhr) {
          if (isCompleted) {
            return
          }

          if (xhr && xhr.status === 400 &&
              xhr.responseText &&
              xhr.responseText.indexOf('qqpartindex') !== -1) {
            if (uploader.getUploads() && uploader.getUploads().length > 0) {
              return
            }
          }

          console.error('上传错误:', {
            id,
            name,
            errorReason,
            response: xhr && xhr.responseText,
            status: xhr && xhr.status
          })

          if (!isCompleted) {
            reject(new Error(errorReason))
          }
        },
        onProgress: function(id, name, loaded, total) {
          if (onUploadProgress && !isCompleted) {
            onUploadProgress({
              percent: Math.round((loaded / total) * 100),
              loaded,
              total
            })
          }
        }
      },
      validation: {
        stopOnFirstInvalidFile: false
      }
    })

    uploader.addFiles([file])
  })
}

// 通用文件上传接口
export async function uploadFile(data, { action, onUploadProgress }) {
  const file = data.get('file')

  // 1. 阿里云上传保持原样
  if (action.includes('aliyun')) {
    return ossUploader.multipartUpload(file, onUploadProgress)
  }

  // 2. 只有当满足以下两个条件时才使用分片上传：
  // - 是本地存储（不是阿里云）
  // - 文件大于3MB
  if (!action.includes('aliyun') && file.size > 3 * 1024 * 1024) {
    return handleLocalChunkUpload(file, action, onUploadProgress)
  }

  // 3. 其他情况保持原有的上传方式
  return request({
    url: action,
    method: 'post',
    data,
    onUploadProgress
  })
}

export function deleteFile(id, action) {
  return request({
    url: `${action}/${id}`,
    method: 'delete'
  })
}

export function editFile(data, action) {
  return request({
    url: action,
    method: 'put',
    data
  })
}

export default {
  uploadFile,
  deleteFile,
  editFile
}
