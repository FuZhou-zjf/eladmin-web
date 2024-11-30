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
            <div v-for="file in fileList" :key="file.uid" class="file-item">
              <div class="file-info">
                <div class="file-name-wrapper">
                  <span class="file-name" @click="showRenameDialog(file)">
                    {{ file.name }}
                    <el-tooltip content="重命名" placement="top">
                      <i class="el-icon-edit edit-icon" />
                    </el-tooltip>
                  </span>
                </div>
                <div class="file-meta">
                  <span>{{ formatFileSize(file.size) }}</span>
                  <span>{{ file.type || getFileExtension(file.name) }}</span>
                </div>
                <el-progress :percentage="uploadProgress[file.name] || 0" />
              </div>
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

    <!-- 重命名对话框 -->
    <el-dialog
      title="重命名文件"
      :visible.sync="renameDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      @closed="handleRenameDialogClosed"
    >
      <div class="rename-dialog-content">
        <div class="original-name">
          <span class="label">原文件名：</span>
          <span class="value">{{ currentFile && currentFile.name }}</span>
        </div>

        <div class="new-name-input">
          <span class="label">新文件名：</span>
          <div class="input-wrapper">
            <el-input
              ref="renameInput"
              v-model="newFileName"
              :maxlength="255"
              @keyup.enter.native="confirmRename"
              @keyup.esc.native="cancelRename"
            >
              <template slot="suffix">
                <span class="file-extension">{{ fileExtension }}</span>
              </template>
            </el-input>
          </div>
        </div>

        <div class="rename-tips">
          <i class="el-icon-info" />
          <span>文件扩展名不可更改，确保文件可以正常使用</span>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelRename">取 消</el-button>
        <el-button
          type="primary"
          :disabled="!isValidFileName"
          @click="confirmRename"
        >确 定</el-button>
      </span>
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
      uploadAction: process.env.VUE_APP_BASE_API + '/api/localStorage/upload', // 添加上传地址
      renameDialogVisible: false,
      currentFile: null,
      newFileName: '',
      fileExtension: '',
      invalidChars: /[\\/:*?"<>|]/g // Windows文件名非法字符
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
    },
    isValidFileName() {
      return this.newFileName &&
             this.newFileName.trim() &&
             !this.invalidChars.test(this.newFileName) &&
             this.newFileName.length <= 255
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
          formData.append('originalName', file.originalName || file.raw.name)

          console.log('准备上传文件：', {
            newName: file.name,
            originalName: file.originalName,
            rawName: file.raw.name
          })

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
            this.handleSuccess(response.data.data, file)
            // 从文件列表中移除已上传的文件
            this.fileList = this.fileList.filter(f => f.uid !== file.uid)
            // 更新 el-upload 组件的文件列表
            this.$refs.fileUpload.clearFiles()
            this.$refs.fileUpload.uploadFiles = this.fileList
          } else {
            const errorMessage = response && response.data && response.data.message
            throw new Error(errorMessage || '上传失败')
          }
        }

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
      // 添加日志
      console.log('处理上传成功：', {
        fileInfo,
        file,
        name: file.name,
        originalName: file.originalName
      })

      this.uploadedFiles.push({
        id: fileInfo.id,
        fileName: fileInfo.name || file.name, // 使用服务器返回的 name 或修改后的文件名
        realName: fileInfo.realName,
        fileSize: fileInfo.size,
        type: fileInfo.type,
        suffix: fileInfo.suffix,
        status: '已成功',
        createTime: fileInfo.createTime,
        path: fileInfo.path
      })

      this.$set(this.uploadProgress, file.name, 100)

      const successMsg = `文件 ${fileInfo.name || file.name} 上传成功！
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
    },
    showRenameDialog(file) {
      if (!file) {
        return
      }
      this.currentFile = file
      this.fileExtension = this.getFileExtension(file.name)
      this.newFileName = file.name.slice(0, -(this.fileExtension.length + 1))
      this.renameDialogVisible = true

      // 下一帧自动聚焦并全选文件名
      this.$nextTick(() => {
        const input = this.$refs.renameInput
        if (input && input.$el) {
          const inputElement = input.$el.querySelector('input')
          if (inputElement) {
            inputElement.focus()
            inputElement.select()
          }
        }
      })
    },

    confirmRename() {
      if (!this.isValidFileName || !this.currentFile) {
        return
      }

      const newFullName = `${this.newFileName}.${this.fileExtension}`

      // 更新 fileList 中的文件名
      const fileIndex = this.fileList.findIndex(f => f.uid === this.currentFile.uid)
      if (fileIndex > -1) {
        const updatedFile = { ...this.fileList[fileIndex] }
        // 保存原始文件名（如果还没有保存）
        if (!updatedFile.originalName) {
          updatedFile.originalName = updatedFile.name
        }
        // 更新显示的文件名
        updatedFile.name = newFullName
        // 更新文件列表
        this.$set(this.fileList, fileIndex, updatedFile)
      }

      this.$message.success('文件重命名成功')
      this.renameDialogVisible = false
    },

    cancelRename() {
      this.renameDialogVisible = false
    },

    handleRenameDialogClosed() {
      this.currentFile = null
      this.newFileName = ''
      this.fileExtension = ''
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
.file-item {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.file-item:last-child {
  border-bottom: none;
}

.file-name-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.file-name {
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.file-name:hover {
  color: #409EFF;
}

.edit-icon {
  margin-left: 8px;
  font-size: 14px;
  color: #909399;
  visibility: hidden;
}

.file-name:hover .edit-icon {
  visibility: visible;
}

.file-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.file-meta span {
  margin-right: 15px;
}

.rename-dialog-content {
  padding: 0 20px;
}

.original-name,
.new-name-input {
  margin-bottom: 20px;
}

.label {
  display: inline-block;
  width: 80px;
  color: #606266;
}

.value {
  color: #909399;
}

.input-wrapper {
  display: inline-block;
  width: calc(100% - 85px);
}

.file-extension {
  color: #909399;
  margin-left: 5px;
}

.rename-tips {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
}

.rename-tips i {
  margin-right: 5px;
  color: #E6A23C;
}
</style>

