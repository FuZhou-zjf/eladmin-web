<!-- UploadManager.vue -->
<template>
  <div>
    <el-dialog title="上传文件" :visible.sync="uploadDialogVisible" width="500px" @close="resetUpload">
      <el-form ref="uploadForm" :model="uploadForm" size="small" label-width="100px">

        <!-- 上传路径选择 -->
        <el-form-item label="选择上传路径">
          <el-select v-model="selectedStorageType" placeholder="选择上传路径">
            <el-option label="本地存储" value="local" />
            <el-option label="云端存储" value="cloud" />
            <!-- 可以添加更多存储类型 -->
          </el-select>
        </el-form-item>

        <!-- 文件选择 -->
        <el-form-item label="选择文件">
          <el-upload
            ref="fileUpload"
            :file-list="fileList"
            :auto-upload="false"
            :multiple="multiple"
            :before-upload="beforeFileUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :on-progress="handleUploadProgress"
            accept=".pdf,.png,.jpg,.jpeg,.zip,.rar,.7z,.tar,.gz,.bmp,.gif,.tiff,.svg,.webp"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">支持多种文件格式，每次不超过15MB。</div>
          </el-upload>
        </el-form-item>

        <!-- 文件名输入 -->
        <el-form-item label="文件名" prop="fileName">
          <el-input
            v-model="uploadForm.fileName"
            placeholder="请输入文件名"
            @input="onFileNameInput"
          />
        </el-form-item>

        <!-- 文件信息显示 -->
        <el-form-item v-if="fileList.length > 0" label="文件信息">
          <div>大小：{{ formatFileSize(uploadForm.fileSize) }}</div>
          <div>类型：{{ uploadForm.fileType }}</div>
        </el-form-item>

        <!-- 上传进度条 -->
        <el-form-item v-if="uploadProgress > 0 && uploadProgress < 100" label="上传进度">
          <el-progress :percentage="uploadProgress" />
        </el-form-item>

        <!-- 已上传文件列表 -->
        <el-form-item label="已上传文件">
          <el-table :data="uploadedFiles" size="small" style="width: 100%">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="大小" :formatter="formatFileSize" />
            <el-table-column prop="type" label="类型" />
            <el-table-column label="状态">
              <template #default="scope">
                <span>上传成功</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="text" @click="downloadFile(scope.row)">下载</el-button>
                <el-button type="text" @click="removeUploadedFile(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
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
import { uploadFile, deleteFile } from '@/api/upload/upload'

export default {
  name: 'UploadManager',
  data() {
    return {
      uploadDialogVisible: false,
      uploadForm: {
        fileName: '',
        fileSize: 0,
        fileType: ''
      },
      fileList: [],
      uploadProgress: 0,
      uploadedFiles: [],
      selectedStorageType: '', // 选中的存储类型
      multiple: false, // 是否支持多文件上传
      fileNameModified: false // 标记文件名是否被用户手动修改
    }
  },
  computed: {
    canUpload() {
      return (
        this.fileList.length > 0 &&
        this.uploadForm.fileName &&
        this.selectedStorageType
      )
    }
  },
  methods: {
    openUploadDialog() {
      this.uploadDialogVisible = true
    },
    resetUpload() {
      this.uploadForm = {
        fileName: '',
        fileSize: 0,
        fileType: ''
      }
      this.fileList = []
      this.uploadProgress = 0
      this.fileNameModified = false
    },
    onFileNameInput() {
      this.fileNameModified = true
    },
    beforeFileUpload(file) {
      const isLt15M = file.size / 1024 / 1024 < 15
      if (!isLt15M) {
        this.$message.error('上传文件大小不能超过 15MB')
        return false
      }
      const supportedTypes = [
        'application/pdf', 'image/png', 'image/jpeg', 'image/bmp', 'image/gif',
        'image/tiff', 'image/svg+xml', 'image/webp', 'application/zip',
        'application/x-rar-compressed', 'application/x-7z-compressed',
        'application/x-tar', 'application/gzip'
      ]
      if (!supportedTypes.includes(file.type)) {
        this.$message.error('不支持的文件格式')
        return false
      }
      return true
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList
      if (!this.fileNameModified && fileList.length > 0) {
        this.uploadForm.fileName = fileList[0].name.replace(/\.[^/.]+$/, '')
      }
      const selectedFile = fileList[0]
      this.uploadForm.fileSize = selectedFile.size
      this.uploadForm.fileType = selectedFile.type
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
      if (fileList.length === 0) {
        this.uploadForm.fileName = ''
        this.fileNameModified = false
        this.uploadForm.fileSize = null
        this.uploadForm.fileType = null
      }
    },
    handleUploadProgress(event) {
      this.uploadProgress = Math.round((event.loaded / event.total) * 100)
    },
    formatFileSize(size) {
      if (!size) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      const index = Math.floor(Math.log(size) / Math.log(1024))
      const formattedSize = (size / Math.pow(1024, index)).toFixed(2)
      return `${formattedSize} ${units[index]}`
    },
    async submitUpload() {
      if (!this.uploadForm.fileName) {
        this.$message.warning('请先输入文件名')
        return
      }
      if (!this.selectedStorageType) {
        this.$message.error('请选择上传路径')
        return
      }
      const formData = new FormData()
      formData.append('file', this.fileList[0])
      formData.append('name', this.uploadForm.fileName)
      try {
        const response = await uploadFile(formData, {
          storageType: this.selectedStorageType,
          onUploadProgress: this.handleUploadProgress
        })
        this.handleUploadSuccess(response)
      } catch (error) {
        this.handleUploadError(error)
      }
    },
    handleUploadSuccess(response) {
      this.$message.success('文件上传成功')
      const fileData = {
        id: response.data.id,
        name: response.data.fileName,
        size: response.data.size,
        type: response.data.type,
        storageType: response.data.storageType
      }
      this.uploadedFiles.push(fileData)
      this.uploadProgress = 0
      this.resetUpload()
    },
    handleUploadError(error) {
      this.$message.error('文件上传失败')
      console.error('Upload error:', error)
      this.uploadProgress = 0
    },
    closeDialog() {
      this.uploadDialogVisible = false
      this.resetUpload()
    },
    async downloadFile(file) {
      // 实现文件下载逻辑
    },
    async removeUploadedFile(file) {
      try {
        await deleteFile(file.id, file.storageType)
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id)
        this.$message.success('文件删除成功')
      } catch (error) {
        this.$message.error('文件删除失败')
      }
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
