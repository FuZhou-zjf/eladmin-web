<!-- UploadManager.vue -->
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
            :action="action"
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
import { mapGetters } from 'vuex'
// eslint-disable-next-line no-unused-vars
import { uploadFile, deleteFile, getUploadedFiles } from '@/api/upload/upload'

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
      selectedStorageType: '',
      multiple: false,
      fileNameModified: false, // 新增标志，用于检测文件名是否被用户修改
      loading: false
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
      this.fileNameModified = false // 重置标志
    },
    // 用户输入文件名时触发，标记文件名已修改
    onFileNameInput() {
      this.fileNameModified = true
    },
    // 选择文件时自动填充默认文件名，但不会覆盖用户手动输入的文件名
    handleFileChange(file, fileList) {
      this.fileList = fileList
      if (!this.fileNameModified && fileList.length > 0) {
        this.uploadForm.fileName = fileList[0].name.replace(/\.[^/.]+$/, '')
      }
      const selectedFile = fileList[0]
      this.uploadForm.fileSize = selectedFile.size
      this.uploadForm.fileType = selectedFile.type
    },
    // 移除文件时重置相关数据
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
    // 上传文件时检查文件名状态，使用用户修改的文件名或默认文件名
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
      formData.append('file', this.fileList[0].raw)

      // 确定要上传的文件名
      const fileNameToUpload = this.fileNameModified
        ? this.uploadForm.fileName
        : this.fileList[0].name.replace(/\.[^/.]+$/, '')
      formData.append('name', fileNameToUpload)

      this.loading = true

      try {
        const response = await uploadFile(formData, {
          action: this.action,
          onUploadProgress: this.handleUploadProgress
        })
        this.handleSuccess(response)
      } catch (error) {
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },
    handleSuccess(response) {
      if (response && response.status === 201) {
        this.$message.success('上传成功')
        this.resetUpload()
        this.fetchUploadedFilesFromList()
      } else if (response && response.status === 200 && response.data) {
        this.$message.success('上传成功')
        this.resetUpload()
        this.uploadedFiles.push(response.data)
      } else {
        const errorMessage = response && response.message ? response.message : '上传失败，请稍后重试。'
        this.$message.error(errorMessage)
      }
    },
    handleError(error) {
      let msg = '上传失败，请稍后重试。'
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
    async fetchUploadedFilesFromList() {
      try {
        const response = await getUploadedFiles(this.action)
        if (response && (response.status === 200 || response.status === 201)) {
          this.uploadedFiles = response.data
        } else {
          this.$message.error('获取已上传文件失败')
        }
      } catch (error) {
        this.$message.error('获取已上传文件时发生错误')
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
