<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索区域 -->
        <label class="el-form-item-label">订单编号</label>
        <el-input
          v-model="crud.query.orderNumber"
          clearable
          placeholder="订单编号"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">账号名</label>
        <el-input
          v-model="crud.query.orderAccountUsername"
          clearable
          placeholder="账号名"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">卖家名称</label>
        <el-input
          v-model="crud.query.orderSellerName"
          clearable
          placeholder="卖家名称"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">卖家SSN</label>
        <el-input
          v-model="crud.query.orderSellerSsn"
          clearable
          placeholder="卖家SSN"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">卖家联系方式</label>
        <el-input
          v-model="crud.query.orderContactInfo"
          clearable
          placeholder="卖家联系方式"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <!-- 日期范围选择器 -->
        <label class="el-form-item-label">日期范围</label>
        <date-range-picker v-model="crud.query.createTime" class="date-item" />
        <!-- 搜索操作组件 -->
        <rrOperation :crud="crud" />
      </div>
      <!-- CRUD 操作按钮 -->
      <crudOperation :permission="permission" @to-add="handleToAdd" />
    </div>

    <!-- 表单对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :before-close="crud.cancelCU"
      :visible.sync="crud.status.cu > 0"
      :title="crud.status.title"
      width="700px"
    >
      <el-form ref="form" :model="crud.form" :rules="rules" size="small" label-width="120px">
        <!-- 表单项 -->
        <el-form-item label="账号名" prop="orderAccountUsername">
          <el-input v-model="crud.form.orderAccountUsername" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="密码" prop="orderAccountPassword">
          <el-input v-model="crud.form.orderAccountPassword" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="App名称" prop="orderAppName">
          <el-select v-model="crud.form.orderAppName" filterable placeholder="请选择">
            <el-option
              v-for="item in dict.bus_appName"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="卖家名称" prop="orderSellerName">
          <el-input
            v-model="crud.form.orderSellerName"
            style="width: 370px;"
            @blur="searchSeller"
          />
        </el-form-item>
        <el-form-item label="卖家SSN" prop="orderSellerSsn">
          <el-input
            v-model="crud.form.orderSellerSsn"
            v-inputmask:orderSellerSsn="'999-99-9999'"
            placeholder="123-45-6789"
            style="width: 370px;"
            @blur="searchSeller"
            @input="handleSsnInput"
          />
        </el-form-item>
        <el-form-item label="卖家联系方式" prop="orderContactInfo">
          <el-input
            v-model="crud.form.orderContactInfo"
            v-inputmask:orderContactInfo="'(+1) 999-999-9999'"
            placeholder="(+1) 123-456-7890"
            style="width: 370px;"
            @input="handleContactInput"
          />
        </el-form-item>
        <el-form-item label="支付方式" prop="orderPaymentMethod">
          <el-input v-model="crud.form.orderPaymentMethod" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="紧急联系方式" prop="orderContactOther">
          <el-input v-model="crud.form.orderContactOther" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="推荐人名称" prop="orderReferrerName">
          <el-input
            v-model="crud.form.orderReferrerName"
            style="width: 370px;"
            @blur="searchRecommender"
          />
        </el-form-item>
        <el-form-item label="推荐人联系方式" prop="orderReferrerInfo">
          <el-input
            v-model="crud.form.orderReferrerInfo"
            v-inputmask:orderReferrerInfo="'(+1) 999-999-9999'"
            placeholder="(+1) 123-456-7890"
            style="width: 370px;"
            @blur="searchRecommender"
            @input="handleReferrerContactInput"
          />
        </el-form-item>
        <el-form-item label="推荐人支付方式" prop="orderReferrerMethod">
          <el-input v-model="crud.form.orderReferrerMethod" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="推荐费" prop="orderReferralFee">
          <el-input
            v-model="crud.form.orderReferralFee"
            style="width: 370px;"
            :disabled="!canEditStatus"
          />
        </el-form-item>
        <el-form-item label="订单金额" prop="orderAmount">
          <el-input
            v-model="crud.form.orderAmount"
            style="width: 370px;"
            :disabled="!canEditStatus"
          />
        </el-form-item>
        <el-form-item label="佣金" prop="orderCommission">
          <el-input
            v-model="crud.form.orderCommission"
            style="width: 370px;"
            :disabled="!canEditStatus"
          />
        </el-form-item>
        <el-form-item label="备注" prop="orderRemark">
          <el-input
            v-model="crud.form.orderRemark"
            :rows="3"
            type="textarea"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item prop="uploadedFile" style="display: flex; align-items: center; justify-content: flex-start;">
          <!-- 放大图标 -->
          <svg-icon icon-class="upload" class="upload-icon" />
          <!-- 上传按钮 -->
          <el-button type="primary" style="margin-left: 8px;" @click="openUploadDialog">
            上传文件
          </el-button>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="closeDialog">取消</el-button>
        <el-button
          :loading="crud.status.cu === 2"
          type="primary"
          :disabled="crud.status.cu === 2"
          @click="crud.submitCU"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- 表格渲染 -->
    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      size="small"
      style="width: 100%;"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="orderNumber" label="订单编号" />
      <el-table-column prop="orderAccountUsername" label="账号名" />
      <el-table-column prop="orderAppName" label="App名称">
        <template slot-scope="scope">
          {{ dict.label.bus_appName[scope.row.orderAppName] }}
        </template>
      </el-table-column>
      <el-table-column prop="orderSellerName" label="卖家名称" />
      <el-table-column prop="orderSellerSsn" label="卖家SSN" />
      <el-table-column prop="orderContactInfo" label="卖家联系方式" />
      <el-table-column prop="orderPaymentMethod" label="支付方式" />
      <el-table-column prop="orderContactOther" label="紧急联系方式" />
      <el-table-column prop="orderReferrerName" label="推荐人名称" />
      <el-table-column prop="orderReferrerInfo" label="推荐人联系方式" />
      <el-table-column prop="orderReferrerMethod" label="推荐人支付方式" />
      <el-table-column v-if="canViewOrderAmount" prop="orderReferralFee" label="推荐费" />
      <el-table-column v-if="canViewOrderAmount" prop="orderAmount" label="订单金额" />
      <el-table-column v-if="canViewOrderAmount" prop="orderCommission" label="佣金" />
      <el-table-column prop="orderCreatedAt" label="创建时间" />
      <el-table-column prop="orderUpdatedAt" label="更新时间" />
      <el-table-column prop="orderRemark" label="备注" />
      <el-table-column
        v-if="checkPer(['admin','order:edit','order:del'])"
        label="操作"
        width="150px"
        align="center"
      >
        <template slot-scope="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
            @edit="handleToEdit(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination />
    <!-- 上传组件 -->
    <UploadManager ref="uploadManager" :upload-options="uploadOptions" />
  </div>
</template>

<script>
import request from '@/utils/request' // 确保 request 引入正确
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import crudOrder from '@/api/order/order'
import Inputmask from 'inputmask'
import _ from 'lodash'
import UploadManager from '@/components/Services/UploadManager.vue'
import DateRangePicker from '@/components/DateRangePicker/index.vue'

const defaultForm = {
  orderId: null,
  orderNumber: null,
  orderStatus: 0,
  orderAccountUsername: '',
  orderAccountPassword: '',
  orderAppId: null,
  orderAppName: '',
  orderSellerId: null,
  orderSellerName: '',
  orderSellerSsn: '',
  orderContactInfo: '',
  orderPaymentMethod: '',
  orderContactOther: '',
  orderReferrerId: null,
  orderReferrerName: '',
  orderReferrerInfo: '',
  orderReferrerMethod: '',
  orderReferralFee: 0,
  orderAmount: 0,
  orderEmployeeId: null,
  orderCommission: 0,
  orderCreatedAt: null,
  orderUpdatedAt: null,
  orderRemark: ''
}

export default {
  name: 'Order',
  components: { DateRangePicker, pagination, crudOperation, rrOperation, UploadManager, udOperation },
  directives: {
    inputmask: {
      inserted(el, binding, vnode) {
        const input = el.getElementsByTagName('input')[0]
        if (input) {
          const options = {
            mask: binding.value,
            autoUnmask: true,
            removeMaskOnSubmit: true,
            nullable: false,
            clearIncomplete: true,
            greedy: false,
            oncomplete: () => {
              vnode.context.$refs.form.validateField(binding.arg)
            },
            onincomplete: () => {
              vnode.context.$refs.form.validateField(binding.arg)
            }
          }
          Inputmask(options).mask(input)
        }
      }
    }
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['bus_order_status', 'bus_appName'],
  cruds() {
    return CRUD({
      title: '订单管理',
      url: 'api/order',
      idField: 'orderId',
      sort: ['orderId,desc'],
      crudMethod: { ...crudOrder }
    })
  },
  data() {
    return {
      permission: {
        add: ['admin', 'order:add'],
        edit: ['admin', 'order:edit'],
        del: ['admin', 'order:del']
      },
      rules: {
        orderAccountUsername: [
          { required: true, message: '账号名不能为空', trigger: ['blur', 'change'] }
        ],
        orderAccountPassword: [
          { required: true, message: '密码不能为空', trigger: ['blur', 'change'] }
        ],
        orderSellerName: [
          { required: true, message: '卖家名称不能为空', trigger: ['blur', 'change'] }
        ],
        orderSellerSsn: [
          { required: true, message: '卖家 SSN 不能为空', trigger: ['blur', 'change'] },
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('卖家 SSN 不能为空'))
              } else {
                const ssn = value.replace(/-/g, '')
                if (ssn.length !== 9 || !/^\d{9}$/.test(ssn)) {
                  callback(new Error('请输入有效的 SSN'))
                } else {
                  callback()
                }
              }
            },
            trigger: ['blur', 'change']
          }
        ],
        orderContactInfo: [
          {
            validator: (rule, value, callback) => {
              if (value) {
                const phone = value.replace(/\D+/g, '')
                if (phone.length !== 10) {
                  callback(new Error('请输入有效的联系方式'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            },
            trigger: ['blur', 'change']
          }
        ],
        // 推荐人相关验证
        orderReferrerName: [
          {
            validator: (rule, value, callback) => {
              if (
                (value && !this.crud.form.orderReferrerInfo) ||
                (!value && this.crud.form.orderReferrerInfo)
              ) {
                callback(new Error('推荐人名称和联系方式必须同时填写'))
              } else {
                callback()
              }
            },
            trigger: ['blur', 'change']
          }
        ],
        orderReferrerInfo: [
          {
            validator: (rule, value, callback) => {
              if (value) {
                const phone = value.replace(/\D+/g, '')
                if (phone.length !== 10) {
                  callback(new Error('请输入有效的推荐人联系方式'))
                } else if (!this.crud.form.orderReferrerName) {
                  callback(new Error('请填写推荐人名称'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            },
            trigger: ['blur', 'change']
          }
        ]
      },
      userInfo: {},
      canEditStatus: false,
      allowedDeptIds: ['7'],
      queryTypeOptions: [
        { key: 'orderStatus', display_name: '订单状态' },
        { key: 'orderSellerName', display_name: '卖家名称' },
        { key: 'orderSellerSsn', display_name: '卖家SSN' },
        { key: 'orderContactInfo', display_name: '卖家联系方式' }
      ],
      sellerExists: null,
      canSubmit: false,
      canSubmitRecommender: false,
      isFormValid: false,
      // 初始推荐人信息
      initialReferrerName: '',
      initialReferrerInfo: '',
      canViewOrderAmount: false,
      createTime: []
    }
  },

  async mounted() {
    try {
      await this.getUserInfo()
      this.resetForm() // 初始化时重置表单
      if (this.$refs.form) {
        this.$refs.form.validate(valid => {
          this.isFormValid = valid
        })
      }
      console.log('表单初始化:', JSON.stringify(this.crud.form, null, 2))
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  },
  methods: {
    // 获取用户信息和权限
    async getUserInfo() {
      try {
        const response = await request.get('/api/users/getDeptInfo')
        console.log('完整的 response:', response)

        const { dept_id, username, id } = response

        if (dept_id && username && id) {
          this.userInfo = { dept_id, username, id }
          console.log('userInfo:', this.userInfo)
          this.canViewOrderAmount = this.allowedDeptIds.includes(String(dept_id))
          if (this.allowedDeptIds.includes(String(this.userInfo.dept_id))) {
            this.canEditStatus = true
            console.log('canEditStatus 状态:', this.canEditStatus)
          } else {
            console.log('用户没有权限编辑订单状态')
          }
        } else {
          console.error('dept_id, username 或 id 缺失！')
        }
      } catch (error) {
        console.error('获取用户信息失败', error)
      }
    },
    openUploadDialog() {
      this.$refs.uploadManager.openUploadDialog()
    },

    // 处理新增操作
    handleToAdd() {
      this.resetForm() // 清空表单
      this.crud.toAdd() // 切换到新增模式
    },

    // 处理修改操作
    handleToEdit(data) {
      this.crud.toEdit(data) // 切换到编辑模式，并填充表单数据
      this.initialReferrerName = data.orderReferrerName || ''
      this.initialReferrerInfo = data.orderReferrerInfo || ''
    },

    // 关闭对话框并重置表单
    closeDialog() {
      this.resetForm() // 清空表单
      this.crud.cancelCU() // 取消新增/编辑模式
    },

    // 重置表单数据
    resetForm(data) {
      this.crud.resetForm(data) // 通过 CRUD.js 框架重置表单

      // 重置其他状态
      this.isFormValid = false
      this.canSubmit = false
      this.canSubmitRecommender = false
      this.sellerExists = null

      if (this.$refs.form) {
        this.$nextTick(() => {
          this.$refs.form.resetFields()
          // 验证表单，更新 isFormValid
          this.$refs.form.validate(valid => {
            this.isFormValid = valid
          })
        })
      }
      console.log('resetForm 完成后 form 数据:', JSON.stringify(this.crud.form, null, 2))
    },

    // 处理 SSN 输入事件
    handleSsnInput() {
      this.$refs.form.validateField('orderSellerSsn')
    },

    // 处理联系方式输入事件
    handleContactInput() {
      this.$refs.form.validateField('orderContactInfo')
    },

    // 处理推荐人联系方式输入事件
    handleReferrerContactInput() {
      this.$refs.form.validateField('orderReferrerInfo')
    },

    // 卖家查重方法
    searchSeller: _.debounce(function() {
      const sellerName = this.crud.form.orderSellerName.trim()
      const sellerSsn = this.crud.form.orderSellerSsn.trim()
      if (sellerName === '' || sellerSsn === '') {
        this.sellerExists = null
        this.canSubmit = false
        return
      }
      request
        .get('/api/sellerInfo/checkSellerExists', {
          params: {
            name: sellerName,
            ssn: sellerSsn
          }
        })
        .then(response => {
          console.log('API 响应：', response)
          const { nameExists, ssnExists, sellerExists } = response

          if (sellerExists) {
            this.$message.success('卖家已存在，可以继续提交订单。')
            this.canSubmit = true
          } else if (nameExists && !ssnExists) {
            this.$message.error('卖家名称已存在，但 SSN 不匹配，请检查 SSN 是否正确。')
            this.canSubmit = false
          } else if (!nameExists && ssnExists) {
            this.$message.error('SSN 已存在，但卖家名称不匹配，请检查名称是否正确。')
            this.canSubmit = false
          } else {
            this.$message.warning('卖家不存在，您可以继续提交表单。')
            this.canSubmit = true
          }
        })
        .catch(error => {
          console.error(error)
          this.$message.error('查询卖家信息失败')
          this.canSubmit = false
        })
    }, 500),

    // 推荐人查重方法
    searchRecommender: _.debounce(function() {
      console.log('API 响应推荐人：')
      const recommenderName = this.crud.form.orderReferrerName.trim()
      console.log('API 响应推荐人名称：', recommenderName)
      const recommenderInfo = this.crud.form.orderReferrerInfo.trim()
      if (recommenderName === '' || recommenderInfo === '') {
        this.canSubmitRecommender = false
        return
      }
      request
        .get('/api/sellerInfo/checkRecommenderExists', {
          params: {
            name: recommenderName,
            contactInfo: recommenderInfo
          }
        })
        .then(response => {
          console.log('API 响应推荐人信息：', response)
          const { recommenderExists, nameExists: refNameExists, contactExists } = response

          if (recommenderExists) {
            this.$message.success('推荐人已存在，可以继续提交订单。')
            this.canSubmitRecommender = true
          } else if (refNameExists && !contactExists) {
            this.$message.error('推荐人姓名已存在，但联系方式不匹配，请检查联系方式是否正确。')
            this.canSubmitRecommender = false
          } else if (!refNameExists && contactExists) {
            this.$message.error('联系方式已存在，但推荐人姓名不匹配，请检查姓名是否正确。')
            this.canSubmitRecommender = false
          } else {
            this.$message.warning('推荐人不存在，系统将自动创建新推荐人。')
            this.canSubmitRecommender = true
          }
        })
        .catch(error => {
          console.error(error)
          this.$message.error('查询推荐人信息失败')
          this.canSubmitRecommender = false
        })
    }, 500),

    // 钩子：在提交表单前执行
    async [CRUD.HOOK.beforeSubmit]() {
      // 判断是新增还是修改
      const isEdit = !!this.crud.form.orderId

      if (!isEdit) {
        // 新增操作，生成订单编号
        this.crud.form.orderNumber = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
      }

      // 处理数据，如移除掩码字符
      this.crud.form.orderSellerSsn = this.crud.form.orderSellerSsn.replace(/-/g, '')
      this.crud.form.orderContactInfo = this.crud.form.orderContactInfo.replace(/\(\+1\)\s?/g, '').replace(/\D+/g, '')
      if (this.crud.form.orderReferrerInfo) {
        this.crud.form.orderReferrerInfo = this.crud.form.orderReferrerInfo.replace(/\D+/g, '')
      }

      // 赋值员工 ID
      this.crud.form.orderEmployeeId = this.userInfo.id

      // 根据权限决定字段是否可编辑
      if (!this.canEditStatus) {
        delete this.crud.form.orderReferralFee
        delete this.crud.form.orderAmount
        delete this.crud.form.orderCommission
      }

      // 调用 API 验证卖家是否存在
      try {
        const sellerResponse = await request.get('/api/sellerInfo/checkSellerExists', {
          params: {
            name: this.crud.form.orderSellerName.trim(),
            ssn: this.crud.form.orderSellerSsn.trim()
          }
        })

        const { sellerExists, nameExists, ssnExists } = sellerResponse

        if (!sellerExists) {
          if (nameExists && !ssnExists) {
            this.$message.error('卖家名称已存在，但 SSN 不匹配，请检查 SSN 是否正确。')
            return false // 阻止提交
          } else if (!nameExists && ssnExists) {
            this.$message.error('SSN 已存在，但卖家名称不匹配，请检查名称是否正确。')
            return false // 阻止提交
          } else {
            this.$message.warning('卖家不存在，您可以继续提交表单。')
            // 根据需求决定是否阻止提交，这里假设允许继续
          }
        }

        // 检查推荐人信息是否发生变化
        const referrerNameChanged = this.crud.form.orderReferrerName.trim() !== this.initialReferrerName.trim()
        const referrerInfoChanged = this.crud.form.orderReferrerInfo.trim() !== this.initialReferrerInfo.trim()

        if (referrerNameChanged || referrerInfoChanged) {
          // 调用 API 验证推荐人是否存在
          const recommenderResponse = await request.get('/api/sellerInfo/checkRecommenderExists', {
            params: {
              name: this.crud.form.orderReferrerName.trim(),
              contactInfo: this.crud.form.orderReferrerInfo.trim()
            }
          })

          const { recommenderExists, nameExists: refNameExists, contactExists } = recommenderResponse

          if (!recommenderExists) {
            if (refNameExists && !contactExists) {
              this.$message.error('推荐人姓名已存在，但联系方式不匹配，请检查联系方式是否正确。')
              return false // 阻止提交
            } else if (!refNameExists && contactExists) {
              this.$message.error('联系方式已存在，但推荐人姓名不匹配，请检查姓名是否正确。')
              return false // 阻止提交
            } else {
              this.$message.warning('推荐人不存在，系统将自动创建新推荐人。')
              // 根据需求决定是否阻止提交，这里假设允许继续
            }
          }
        } else {
          // 推荐人信息未变更，跳过验证
          console.log('推荐人信息未变更，跳过存在性验证。')
        }

        // 所有验证通过，允许提交
        return true
      } catch (error) {
        console.error('验证失败:', error)
        this.$message.error('验证卖家或推荐人信息时出错，请稍后重试。')
        return false // 阻止提交
      }
    }
  }
}
</script>

<style scoped>
.upload-icon {
  width: 32px;
  height: 32px;
  position: relative;
  top: 8px;
  margin-left: -45px; /* 调整这个值来向左移动图标 */
}
</style>
