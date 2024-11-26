<template>
  <div>
    <el-dialog title="上传文件" :visible.sync="uploadDialogVisible" width="500px" @close="resetUpload">
      <el-form ref="uploadForm" :model="uploadForm" size="small" label-width="100px">

        <!-- 上传路径选择 -->
        <el-form-item label="选择上传路径">
          <el-select v-model="selectedStorageType" placeholder="选择上传路径">
            <el-option label="本地存储" value="local" />
            <el-option label="阿里云存储" value="aliyun" />
            <el-option label="百度网盘存储" value="baidu" />
          </el-select>
        </el-form-item>

        <!-- 文件选择 -->
        <el-form-item label="选择文件">
          <el-upload
            ref="fileUpload"
            :action="uploadAction"
            :file-list="fileList"
            :auto-upload="false"
            :multiple="true"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :before-upload="beforeUpload"
            accept="*"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">支持所有文件格式上传</div>
          </el-upload>
        </el-form-item>

        <!-- 文件信息和进度显示 -->
        <el-form-item v-if="fileList.length > 0" label="文件信息">
          <div class="uploaded-files-container">
            <div v-for="file in fileList" :key="file.name">
              <div>文件名：{{ file.name }}</div>
              <div>大小：{{ formatFileSize(file.size) || '未知大小' }}</div>
              <div>类型：{{ file.type || getFileExtension(file.name) || '未知类型' }}</div>
              <div>上传进度：<el-progress :percentage="uploadProgress[file.name] || 0" /></div>
            </div>
          </div>
        </el-form-item>

        <!-- 已上传文件列表 -->
        <el-form-item label="已上传文件">
          <div class="uploaded-files-container">
            <el-table :data="uploadedFiles" size="small" style="width: 100%">
              <el-table-column prop="fileName" label="文件名" />
              <el-table-column prop="fileSize" label="大小" />
              <el-table-column prop="fileType" label="类型" />
              <el-table-column prop="status" label="状态" />
              <el-table-column prop="createTime" label="上传时间" />
              <el-table-column prop="path" label="存储路径" show-overflow-tooltip />
            </el-table>
          </div>
        </el-form-item>
      </el-form>

      <!-- 对话框操作按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
        <el-button type="primary" :disabled="!canUpload" @click="submitUpload">上传</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { uploadFile } from '@/api/upload/upload'

export default {
  name: 'UploadManager',
  props: {
    uploadOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      uploadDialogVisible: false,
      uploadForm: {},
      fileList: [], // 存储选中的文件列表
      uploadProgress: {}, // 存储每个文件的上传进度
      uploadedFiles: [], // 存储成功上传的文件信息
      selectedStorageType: '',
      multiple: true, // 启用多文件选择
      loading: false,
      uploadAction: process.env.VUE_APP_BASE_API + '/api/localStorage/upload' // 添加上传地址
    }
  },
  computed: {
    ...mapGetters([
      'baseApi',
      'fileUploadApi', // 本地存储
      'aliyunUploadApi', // 阿里云存储
      'baiduUploadApi' // 百度网盘存储
    ]),
    action() {
      return this.selectedStorageType === 'aliyun' ? this.aliyunUploadApi
        : this.selectedStorageType === 'baidu' ? this.baiduUploadApi
          : this.fileUploadApi
    },
    canUpload() {
      return this.fileList.length > 0 && this.selectedStorageType
    }
  },
  methods: {
    openUploadDialog() {
      this.uploadDialogVisible = true
    },
    resetUpload() {
      this.uploadForm = {}
      this.fileList = []
      this.uploadProgress = {}
      this.uploadedFiles = [] // 清除已上传文件列表
    },
    handleFileChange(file, fileList) {
      // 更新文件列表
      this.fileList = fileList
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
      if (fileList.length === 0) {
        this.resetUpload()
      }
    },
    getFileExtension(name) {
      const parts = name.split('.')
      return parts.length > 1 ? parts.pop() : ''
    },
    async submitUpload() {
      if (!this.selectedStorageType) {
        this.$message.error('请选择上传路径')
        return
      }

      this.loading = true

      try {
        for (const file of this.fileList) {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('name', file.name)

          const response = await uploadFile(formData, {
            action: this.action,
            onUploadProgress: (progressEvent) => {
              const percent = progressEvent.percent ||
                Math.round((progressEvent.loaded / progressEvent.total) * 100)
              this.$set(this.uploadProgress, file.name, percent)
            }
          })

          console.log('上传响应：', response)

          if (response && response.data && response.data.success) {
            // 上传成功，处理文件信息
            this.handleSuccess(response.data.data, file)
            // 从文件列表中移除已上传的文件
            this.fileList = this.fileList.filter(f => f.name !== file.name)
            // 更新 el-upload 组件的文件列表
            this.$refs.fileUpload.clearFiles()
            this.$refs.fileUpload.uploadFiles = this.fileList
          } else {
            const errorMessage = response && response.data && response.data.message
            throw new Error(errorMessage || '上传失败001')
          }
        }

        // 如果所有文件都上传成功，清空进度信息
        if (this.fileList.length === 0) {
          this.uploadProgress = {}
        }
      } catch (error) {
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },
    handleSuccess(fileInfo, file) {
      // 更新已上传文件列表，使用后端返回的详细信息
      this.uploadedFiles.push({
        fileName: fileInfo.realName || file.name,
        fileSize: fileInfo.size || this.formatFileSize(file.size),
        fileType: fileInfo.type || fileInfo.suffix || this.getFileExtension(file.name),
        status: '已成功',
        createTime: fileInfo.createTime,
        path: fileInfo.path,
        id: fileInfo.id
      })

      // 设置上传进度为100%
      this.$set(this.uploadProgress, file.name, 100)

      // 使用后端返回的信息构建成功提示
      const successMsg = `文件 ${fileInfo.name} 上传成功！
        \n文件大小：${fileInfo.size}
        \n存储路径：${fileInfo.path}`
      this.$message({
        message: successMsg,
        type: 'success',
        duration: 5000,
        showClose: true
      })
    },
    handleError(error) {
      let msg = '上传失败，请稍后重试'
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message
      } else if (error.message) {
        msg = error.message
      }
      this.$message.error(msg)
      this.loading = false
    },
    closeDialog() {
      this.uploadDialogVisible = false
      this.resetUpload()
    },
    beforeUpload(file) {
      // 文件大小检查
      return true
    },
    formatFileSize(size) {
      if (typeof size === 'string') {
        return size.trim()
      } else if (typeof size === 'number') {
        if (size < 1024) {
          return size + ' B'
        } else if (size < 1024 * 1024) {
          return (size / 1024).toFixed(2) + ' KB'
        } else if (size < 1024 * 1024 * 1024) {
          return (size / (1024 * 1024)).toFixed(2) + ' MB'
        } else {
          return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
        }
      } else {
        return '未知大小'
      }
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
.uploaded-files-container {
  max-height: 200px; /* 限制最大高度 */
  overflow-y: auto; /* 超出高度时出现垂直滚动条 */
}
</style>

