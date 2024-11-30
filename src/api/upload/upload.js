import request from '@/utils/request'
import AliOSSUploader from '@/utils/alioss'
import FineUploader from 'fine-uploader'
import { getToken } from '@/utils/auth'

const ossUploader = new AliOSSUploader()

// 处理本地分片上传
async function handleLocalChunkUpload(file, action, onUploadProgress, formData) {
  return new Promise((resolve, reject) => {
    let isCompleted = false

    // 从 formData 中获取修改后的文件名
    const newFileName = formData.get('name')
    const originalName = formData.get('originalName')

    console.log('分片上传文件信息：', {
      newFileName,
      originalName,
      rawFileName: file.name
    })

    const uploader = new FineUploader.FineUploaderBasic({
      debug: true,
      request: {
        endpoint: `${action}/chunk`,
        customHeaders: {
          Authorization: getToken()
        },
        params: {
          // 传递文件名信息给后端
          name: newFileName,
          originalName: originalName
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
          console.log('分片上传完成:', { id, name, responseJson })
          if (isCompleted) {
            return
          }

          if (responseJson && responseJson.success) {
            isCompleted = true
            resolve({
              data: {
                success: true,
                data: {
                  ...responseJson.data,
                  name: newFileName
                }
              }
            })
          } else {
            const errorMessage = responseJson && responseJson.message
            reject(new Error(errorMessage || '上传失败'))
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
  const fileName = data.get('name')
  const originalName = data.get('originalName')

  console.log('开始上传文件：', {
    fileName,
    originalName,
    size: file.size
  })

  // 1. 阿里云上传保持原样
  if (action.includes('aliyun')) {
    return ossUploader.multipartUpload(file, onUploadProgress)
  }

  // 2. 分片上传条件判断
  if (!action.includes('aliyun') && file.size > 3 * 1024 * 1024) {
    return handleLocalChunkUpload(file, action, onUploadProgress, data)
  }

  // 3. 普通上传
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
