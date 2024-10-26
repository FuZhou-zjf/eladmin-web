<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">订单编号</label>
        <el-input
          v-model="query.orderNumber"
          clearable
          placeholder="订单编号"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">账号名</label>
        <el-input
          v-model="query.orderAccountUsername"
          clearable
          placeholder="账号名"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">卖家名称</label>
        <el-input
          v-model="query.orderSellerName"
          clearable
          placeholder="卖家名称"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">卖家SSN</label>
        <el-input
          v-model="query.orderSellerSsn"
          clearable
          placeholder="卖家SSN"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">卖家联系方式</label>
        <el-input
          v-model="query.orderContactInfo"
          clearable
          placeholder="卖家联系方式"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--更多按钮-->
      <crudOperation :permission="permission" @to-add="handleToAdd" />

      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="700px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="账号名" prop="orderAccountUsername">
            <el-input v-model="form.orderAccountUsername" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="密码" prop="orderAccountPassword">
            <el-input v-model="form.orderAccountPassword" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="App名称" prop="orderAppName">
            <el-select v-model="form.orderAppName" filterable placeholder="请选择">
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
              v-model="form.orderSellerName"
              style="width: 370px;"
              @blur="searchSeller"
            />
          </el-form-item>
          <el-form-item label="卖家SSN" prop="orderSellerSsn">
            <el-input
              v-model="form.orderSellerSsn"
              v-inputmask:orderSellerSsn="'999-99-9999'"
              placeholder="123-45-6789"
              style="width: 370px;"
              @blur="searchSeller"
              @input="handleSsnInput"
            />
          </el-form-item>
          <el-form-item label="卖家联系方式" prop="orderContactInfo">
            <el-input
              v-model="form.orderContactInfo"
              v-inputmask:orderContactInfo="'(+1) 999-999-9999'"
              placeholder="(+1) 123-456-7890"
              style="width: 370px;"
              @input="handleContactInput"
            />
          </el-form-item>
          <el-form-item label="支付方式" prop="orderPaymentMethod">
            <el-input v-model="form.orderPaymentMethod" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="紧急联系方式" prop="orderContactOther">
            <el-input v-model="form.orderContactOther" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="推荐人名称" prop="orderReferrerName">
            <el-input
              v-model="form.orderReferrerName"
              style="width: 370px;"
              @blur="searchRecommender"
            />
          </el-form-item>
          <el-form-item label="推荐人联系方式" prop="orderReferrerInfo">
            <el-input
              v-model="form.orderReferrerInfo"
              v-inputmask:orderReferrerInfo="'(+1) 999-999-9999'"
              placeholder="(+1) 123-456-7890"
              style="width: 370px;"
              @blur="searchRecommender"
              @input="handleReferrerContactInput"
            />
          </el-form-item>
          <el-form-item label="推荐人支付方式" prop="orderReferrerMethod">
            <el-input v-model="form.orderReferrerMethod" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="推荐费" prop="orderReferralFee">
            <el-input
              v-model="form.orderReferralFee"
              style="width: 370px;"
              :disabled="!canEditStatus"
            />
          </el-form-item>
          <el-form-item label="订单金额" prop="orderAmount">
            <el-input
              v-model="form.orderAmount"
              style="width: 370px;"
              :disabled="!canEditStatus"
            />
          </el-form-item>
          <el-form-item label="佣金" prop="orderCommission">
            <el-input
              v-model="form.orderCommission"
              style="width: 370px;"
              :disabled="!canEditStatus"
            />
          </el-form-item>
          <el-form-item label="备注" prop="orderRemark">
            <el-input
              v-model="form.orderRemark"
              :rows="3"
              type="textarea"
              style="width: 370px;"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="closeDialog">取消</el-button>
          <el-button
            :loading="crud.status.cu === 2"
            type="primary"
            :disabled="crud.status.cu === 2"
            @click="submitForm"
          >
            确认
          </el-button>
        </div>
      </el-dialog>

      <!--表格渲染-->
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
        <el-table-column prop="orderReferralFee" label="推荐费" />
        <el-table-column prop="orderAmount" label="订单金额" />
        <el-table-column prop="orderCommission" label="佣金" />
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
            />
          </template>
        </el-table-column>
      </el-table>

      <!--分页组件-->
      <pagination />
    </div>
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
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
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
  dicts: ['bus_order_status', 'bus_appName'],
  cruds() {
    return CRUD({
      title: '订单管理',
      url: 'api/order',
      idField: 'orderId',
      sort: 'orderId,desc',
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
        // 添加其他必填项的验证规则
        orderReferrerName: [
          {
            validator: (rule, value, callback) => {
              if (
                (value && !this.form.orderReferrerInfo) ||
                (!value && this.form.orderReferrerInfo)
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
                } else if (!this.form.orderReferrerName) {
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
      isFormValid: false
    }
  },
  watch: {
    form: {
      handler() {
        if (this.$refs.form) {
          this.$refs.form.validate(valid => {
            this.isFormValid = valid
          })
        }
      },
      deep: true
    },
    'form.orderSellerName': 'searchSeller',
    'form.orderSellerSsn': 'searchSeller',
    'form.orderReferrerName': 'searchRecommender',
    'form.orderReferrerInfo': 'searchRecommender'
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
      console.log('表单初始化:', JSON.stringify(this.form, null, 2))
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  },
  methods: {
    async getUserInfo() {
      try {
        const response = await request.get('/api/users/getDeptInfo')
        console.log('完整的 response:', response)

        const { dept_id, username, id } = response

        if (dept_id && username && id) {
          this.userInfo = { dept_id, username, id }
          console.log('userInfo:', this.userInfo)

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
    handleToAdd() {
      this.resetForm()
      this.crud.toAdd()
    },
    handleDialogClose() {
      this.closeDialog()
    },
    handleReferrerContactInput() {
      this.$refs.form.validateField('orderReferrerInfo')
    },
    closeDialog() {
      this.resetForm()
      this.crud.cancelCU()
    },
    resetForm() {
      this.form = { ...defaultForm }
      this.isFormValid = false // 重置验证状态
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
    },
    handleSsnInput() {
      this.$refs.form.validateField('orderSellerSsn')
    },
    handleContactInput() {
      this.$refs.form.validateField('orderContactInfo')
    },
    // 卖家查重方法
    searchSeller: _.debounce(function() {
      const sellerName = this.form.orderSellerName.trim()
      const sellerSsn = this.form.orderSellerSsn.trim()
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
      const recommenderName = this.form.orderReferrerName.trim()
      console.log('API 响应推荐人名称：', recommenderName)
      const recommenderInfo = this.form.orderReferrerInfo.trim()
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
          const { nameExists, contactExists, recommenderExists } = response

          if (recommenderExists) {
            this.$message.success('推荐人已存在，可以继续提交订单。')
            this.canSubmitRecommender = true
          } else if (nameExists && !contactExists) {
            this.$message.error('推荐人姓名已存在，但联系方式不匹配，请检查联系方式是否正确。')
            this.canSubmitRecommender = false
          } else if (!nameExists && contactExists) {
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
    async submitForm() {
      // 确保表单验证通过
      this.$refs.form.validate(async valid => {
        if (valid) {
          // 检查 canSubmit 和 canSubmitRecommender 状态
          const isRecommenderFilled =
            this.form.orderReferrerName.trim() !== '' ||
            this.form.orderReferrerInfo.trim() !== ''
          if (!this.canSubmit || (isRecommenderFilled && !this.canSubmitRecommender)) {
            this.$message.error('无法提交表单，请检查卖家和推荐人信息是否正确。')
            return
          }
          console.log('提交前的表单数据:', JSON.stringify(this.form, null, 2))
          try {
            // 动态填充员工ID和订单编号
            this.form.orderEmployeeId = this.userInfo.id
            this.form.orderNumber = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14) // 精确到秒的订单编号

            // 移除掩码字符
            this.form.orderSellerSsn = this.form.orderSellerSsn.replace(/-/g, '')
            this.form.orderContactInfo = this.form.orderContactInfo
              .replace(/\(\+1\)\s?/g, '')
              .replace(/\D+/g, '')
            // 处理推荐人联系方式（如果有）
            if (this.form.orderReferrerInfo) {
              this.form.orderReferrerInfo = this.form.orderReferrerInfo.replace(/\D+/g, '')
            }

            // 打印表单内容到控制台，检查数据格式
            console.log('提交的表单数据:', this.form)

            // 调用 API 创建订单
            const response = await this.crud.crudMethod.add(this.form)

            // 打印后端返回的响应
            console.log('后端响应:', response)

            this.$message.success('订单创建成功')
            this.resetForm() // 重置表单
            this.closeDialog() // 关闭对话框
            this.crud.refresh() // 刷新表格数据
          } catch (error) {
            console.error('订单创建失败:', error)
            this.$message.error('订单创建失败，请稍后重试')
          }
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    },
    // 钩子：在获取表格数据之前执行
    [CRUD.HOOK.beforeRefresh]() {
      console.log('beforeRefresh 钩子触发')
      return true // 返回 true 继续执行数据刷新
    },
    // 钩子：提交表单前执行
    [CRUD.HOOK.beforeSubmit]() {
      console.log('beforeSubmit 钩子触发，检查数据')
      return true // 返回 true 继续提交表单
    }
  }
}
</script>

<style scoped>
/* 您的样式代码 */
</style>
