import request from '@/utils/request'

// 获取OSS配置
export function getOSSConfig() {
  return request({
    url: '/api/system/oss/config',
    method: 'get'
  })
}
