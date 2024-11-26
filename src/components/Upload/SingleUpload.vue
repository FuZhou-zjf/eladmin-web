<template>
  <div class="upload-container">
    <el-upload
      ref="upload"
      :action="uploadUrl"
      :headers="headers"
      :on-progress="handleProgress"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :show-file-list="false"
    >
      <el-button size="small" type="primary">选择文件</el-button>
    </el-upload>

    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress">
      <el-progress :percentage="uploadProgress" />
    </div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { uploadFile } from '@/api/upload/upload'
export default {
  name: 'SingleUpload',
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + '/api/localStorage',
      headers: {
        Authorization: getToken()
      },
      uploadProgress: 0,
      fineUploader: null
    }
  },
  methods: {
    beforeUpload(file) {
      if (file.size > 3 * 1024 * 1024) {
        // 大文件使用 Fine Uploader 处理
        this.handleLargeFile(file)
        return false // 阻止 el-upload 默认上传
      }
      return true // 小文件使用 el-upload 默认上传
    },

    handleLargeFile(file) {
      const formData = new FormData()
      formData.append('file', file)

      uploadFile(formData, {
        action: this.uploadUrl,
        onUploadProgress: (progressEvent) => {
          this.uploadProgress = progressEvent.percent
        }
      })
        .then(response => {
          this.handleSuccess(response)
        })
        .catch(error => {
          this.handleError(error)
        })
    },

    handleSuccess(response) {
      this.uploadProgress = 100
      if (response && response.data && response.data.success) {
        this.$emit('success', response.data.data)
        this.$message.success('上传成功')
      } else {
        const errorMessage = response && response.data && response.data.message
        this.handleError(new Error(errorMessage || '上传失败002'))
      }
    },

    handleError(err) {
      this.uploadProgress = 0
      this.$message.error('上传失败：' + (err.message || '未知错误'))
    },

    handleProgress(event) {
      this.uploadProgress = Math.round(event.percent)
    }
  }
}
</script>

<style scoped>
.upload-container {
  display: inline-block;
}
.progress {
  margin-top: 10px;
  width: 200px;
}
</style>
