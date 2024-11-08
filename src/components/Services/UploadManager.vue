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
            :multiple="true"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            accept=".pdf,.png,.jpg,.jpeg,.zip,.rar,.7z,.tar,.gz,.bmp,.gif,.tiff,.svg,.webp"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">支持多种文件格式，每次不超过15MB。</div>
          </el-upload>
        </el-form-item>

        <!-- 文件信息和进度显示 -->
        <el-form-item v-if="fileList.length > 0" label="文件信息">
          <div v-for="file in fileList" :key="file.name">
            <div>文件名：{{ file.name }}</div>
            <div>大小：{{ file.size || '未知大小' }}</div>
            <div>类型：{{ file.raw.type || getFileExtension(file.name) || '未知类型' }}</div>
            <div>上传进度：<el-progress :percentage="uploadProgress[file.name] || 0" /></div>
          </div>
        </el-form-item>

        <!-- 已上传文件列表 -->
        <el-form-item label="已上传文件">
          <el-table :data="uploadedFiles" size="small" style="width: 100%">
            <el-table-column prop="fileName" label="文件名" />
            <el-table-column prop="fileSize" label="大小" />
            <el-table-column prop="fileType" label="类型" />
            <el-table-column label="状态">
              <template #default="scope">
                <span>上传成功</span>
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
import { uploadFile } from '@/api/upload/upload'

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
      fileList: [], // 存储选中的文件列表
      uploadProgress: {}, // 存储每个文件的上传进度
      uploadedFiles: [], // 存储成功上传的文件信息
      selectedStorageType: '',
      multiple: true, // 启用多文件选择
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
      return this.fileList.length > 0 && this.selectedStorageType
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
      this.uploadProgress = {}
      this.uploadedFiles = [] // 清除已上传文件列表
    },
    handleFileChange(file, fileList) {
      // 更新文件列表，避免重复选择相同文件
      this.fileList = fileList
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
      if (fileList.length === 0) {
        this.resetUpload()
      }
    },
    handleUploadProgress(event, file) {
      this.$set(this.uploadProgress, file.name, Math.round((event.loaded / event.total) * 100))
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
            onUploadProgress: (event) => this.handleUploadProgress(event, file)
          })
          this.handleSuccess(response, file)
        }
      } catch (error) {
        this.handleError(error)
      } finally {
        // 清除 fileList，避免重复上传
        this.fileList = []
        this.loading = false
      }
    },
    handleSuccess(response, file) {
      console.log('Upload response:', response)

      const { status, message } = response
      const fileData = response.data

      if (status === 201 || status === 200) {
        this.$message.success(message || '文件上传成功')
        this.uploadedFiles.push({
          fileName: fileData.realName,
          fileSize: fileData.size,
          fileType: fileData.type || this.getFileExtension(fileData.realName)
        })
        this.uploadProgress[file.name] = 100
      } else {
        this.$message.error(message || '上传失败，请稍后重试')
      }
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
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
