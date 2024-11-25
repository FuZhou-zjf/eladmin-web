import OSS from 'ali-oss'
import request from '@/utils/request'

export default class AliOSSUploader {
  constructor() {
    this.client = null
    this.checkpoints = new Map() // 存储断点信息
  }

  // 初始化OSS客户端
  async init() {
    if (this.client) return this.client

    try {
      const response = await request({
        url: '/api/system/oss/config',
        method: 'get'
      })

      const config = response.data
      this.client = new OSS({
        region: config.region,
        accessKeyId: config.stsToken.accessKeyId,
        accessKeySecret: config.stsToken.accessKeySecret,
        stsToken: config.stsToken.securityToken,
        bucket: config.bucket,
        secure: true
      })

      return this.client
    } catch (error) {
      console.error('OSS客户端初始化失败:', error)
      throw new Error('OSS客户端初始化失败，请检查配置或网络')
    }
  }

  // 执行分片上传
  async multipartUpload(file, onProgress) {
    const client = await this.init()
    const key = `uploads/${Date.now()}-${file.name}`

    // 尝试获取断点信息
    const checkpoint = this.checkpoints.get(file.uid)

    try {
      const result = await client.multipartUpload(key, file, {
        parallel: 4,
        partSize: 1024 * 1024,
        checkpoint: checkpoint, // 断点续传信息
        async progress(p, cpt) {
          // 保存最新的断点信息
          this.checkpoints.set(file.uid, cpt)

          // 更新进度
          if (onProgress) {
            onProgress({
              percent: Math.floor(p * 100),
              checkpoint: cpt
            })
          }
        }
      })

      // 上传成功后清除断点信息
      this.checkpoints.delete(file.uid)

      return {
        url: result.res.requestUrls[0].split('?')[0],
        name: file.name,
        key: result.name
      }
    } catch (error) {
      console.error('上传错误:', error)

      // 保存断点信息到localStorage（可选）
      if (checkpoint) {
        localStorage.setItem(
          `upload_checkpoint_${file.uid}`,
          JSON.stringify(checkpoint)
        )
      }

      // OSS错误码处理
      switch (error.code) {
        case 'RequestTimeoutError':
        case 'ConnectionTimeoutError':
          throw new Error('网络超时，请检查您的网络连接')

        case 'InvalidAccessKeyId':
          throw new Error('AccessKey无效，请检查您的配置信息')

        case 'SecurityTokenExpired':
          throw new Error('安全令牌已过期，请刷新页面重试')

        case 'AccessDenied':
          throw new Error('访问被拒绝，请检查上传权限')

        case 'BucketNotFound':
          throw new Error('存储空间不存在，请检查配置')

        case 'EntityTooLarge':
          throw new Error('文件太大，请选择较小的文件')

        case 'NetworkError':
          throw new Error('网络错误，请检查网络连接')

        case 'SecurityRiskControl':
          throw new Error('账号被风控，请稍后重试')

        case 'FileAlreadyExists':
          throw new Error('文件已存在，请重命名后重试')

        case 'InvalidObjectName':
          throw new Error('文件名无效，请修改后重试')

        default:
          // 如果是网络错误
          if (error.name === 'NetworkError') {
            throw new Error('网络连接异常，请检查网络')
          }

          // 如果有具体的错误信息
          if (error.message) {
            throw new Error(`上传失败: ${error.message}`)
          }

          // 默认错误信息
          throw new Error('上传失败，请稍后重试')
      }
    }
  }

  // 恢复上传
  async resumeUpload(file, onProgress) {
    // 尝试从内存获取断点信息
    let checkpoint = this.checkpoints.get(file.uid)

    // 如果内存中没有，尝试从localStorage获取
    if (!checkpoint) {
      const savedCheckpoint = localStorage.getItem(
        `upload_checkpoint_${file.uid}`
      )
      if (savedCheckpoint) {
        checkpoint = JSON.parse(savedCheckpoint)
      }
    }

    if (!checkpoint) {
      throw new Error('未找到断点续传信息，请重新上传')
    }

    // 使用断点信息继续上传
    return this.multipartUpload(file, onProgress)
  }

  // 取消上传
  cancelUpload(file) {
    // 清除断点信息
    this.checkpoints.delete(file.uid)
    localStorage.removeItem(`upload_checkpoint_${file.uid}`)
  }
}
