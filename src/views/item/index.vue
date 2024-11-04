<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">name</label>
        <el-input v-model="query.name" clearable placeholder="name" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">orderStatus</label>
        <el-input v-model="query.orderStatus" clearable placeholder="orderStatus" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />

        <!-- 日期范围选择器 -->
        <label class="el-form-item-label">Date Range</label>
        <date-range-picker v-model="query.createTime" class="date-item" />
        <rrOperation :crud="crud" />
      </div>

      <!-- CRUD操作按钮 -->
      <crudOperation :permission="permission" />

      <!-- 表单组件 -->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="name" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="price">
            <el-input v-model="form.price" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="quantity">
            <el-input v-model="form.quantity" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="createdAt">
            <el-date-picker v-model="form.createdAt" type="datetime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="updatedAt">
            <el-date-picker v-model="form.updatedAt" type="datetime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="orderStatus" prop="orderStatus">
            <el-select v-model="form.orderStatus" filterable placeholder="请选择">
              <el-option v-for="item in dict.bus_order_status" :key="item.id" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <!-- 上传文件功能 -->
          <el-form-item label="上传文件">
            <el-button @click="openUploadDialog">上传文件</el-button>
          </el-form-item>
        </el-form>

        <!-- 表单操作按钮 -->
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="submitForm">确认</el-button>
        </div>
      </el-dialog>

      <!-- 表格渲染 -->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="name" />
        <el-table-column v-if="checkPermission(['admin'])" prop="price" label="price" />
        <el-table-column prop="quantity" label="quantity" />
        <el-table-column prop="createdAt" label="createdAt" />
        <el-table-column prop="updatedAt" label="updatedAt" />
        <el-table-column prop="orderStatus" label="orderStatus">
          <template slot-scope="scope">
            {{ dict.label.bus_order_status[scope.row.orderStatus] }}
          </template>
        </el-table-column>
        <el-table-column v-if="checkPermission(['admin','item:edit','item:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation :data="scope.row" :permission="permission" />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <pagination />
    </div>

    <!-- 上传组件对话框 -->
    <UploadManager ref="uploadManager" :upload-options="dict.upload" />
  </div>
</template>

<script>
import crudItem from '@/api/item/item'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'
import UploadManager from '@/components/Services/UploadManager.vue' // 引入上传组件
import checkPermission from '@/utils/permission'

const defaultForm = { id: null, name: null, price: null, quantity: null, createdAt: null, updatedAt: null, orderStatus: null }

export default {
  name: 'Item',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker, UploadManager },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['bus_order_status', 'bus_upload'], // 加载上传路径字典
  cruds() {
    return CRUD({ title: '测试商品', url: 'api/item', idField: 'id', sort: 'id,desc', crudMethod: { ...crudItem }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'item:add'],
        edit: ['admin', 'item:edit'],
        del: ['admin', 'item:del']
      },
      rules: {
        name: [{ required: true, message: '不能为空', trigger: 'blur' }],
        orderStatus: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      query: {
        name: '',
        orderStatus: '',
        dateRange: [] // 新增的日期范围查询
      }
    }
  },
  methods: {
    checkPermission,
    // 打开上传对话框
    openUploadDialog() {
      this.$refs.uploadManager.openUploadDialog()
    },
    // 提交表单，包含文件上传
    submitForm() {
      this.$refs.uploadManager.submitUpload().then(() => {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.crud.submitCU()
          }
        })
      }).catch(error => {
        this.$message.error('上传失败，请重试')
        console.error('Upload error:', error)
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
