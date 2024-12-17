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
        <label class="el-form-item-label">App名称</label>
        <el-select
          v-model="crud.query.orderAppName"
          clearable
          placeholder="请选择App名称"
          style="width: 185px;"
          class="filter-item"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in dict.bus_appName"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <label class="el-form-item-label">卖家名称</label>
        <el-input
          v-model="crud.query.orderSellerNickname"
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
        <!--        <el-form-item label="账号名" prop="orderAccountUsername">-->
        <!--          <el-input v-model="crud.form.orderAccountUsername" style="width: 370px;" />-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="密码" prop="orderAccountPassword">-->
        <!--          <el-input v-model="crud.form.orderAccountPassword" style="width: 370px;" />-->
        <!--        </el-form-item>-->
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
          <el-autocomplete
            v-model="crud.form.orderSellerName"
            style="width: 370px;"
            :fetch-suggestions="handleSellerSearch"
            :trigger-on-focus="false"
            placeholder="请输入卖家昵称或电话后四位"
            clearable
            @select="handleSellerSelect"
          >
            <template slot-scope="{ item }">
              <div class="suggestion-item">
                <div class="primary">{{ item.nickname }}</div>
                <div class="secondary">
                  姓名: {{ item.name }} | SSN: {{ item.ssn }} | 联系方式: {{ item.contactInfo }}
                </div>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="卖家SSN" prop="orderSellerSsn">
          <el-input
            v-model="crud.form.orderSellerSsn"
            v-inputmask:orderSellerSsn="'999-99-9999'"
            placeholder="123-45-6789"
            style="width: 370px;"
            @blur="handleBlurSearch"
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
        <el-form-item label="佣金" prop="orderCommission">
          <el-input
            v-model="crud.form.orderCommission"
            style="width: 370px;"
            :disabled="!canEditStatus"
          />
        </el-form-item>
        <!-- <el-form-item label="紧急联系方式" prop="orderContactOther">
          <el-input v-model="crud.form.orderContactOther" style="width: 370px;" />
        </el-form-item> -->
        <el-form-item label="推荐人名称" prop="orderReferrerName">
          <el-autocomplete
            v-model="crud.form.orderReferrerName"
            style="width: 370px;"
            :fetch-suggestions="handleSellerSearch"
            :trigger-on-focus="false"
            placeholder="请输入推荐人昵称或电话后四位"
            clearable
            @select="handleReferrerSelect"
          >
            <template slot-scope="{ item }">
              <div class="suggestion-item">
                <div class="primary">{{ item.nickname }}</div>
                <div class="secondary">
                  姓名: {{ item.name }} | SSN: {{ item.ssn }} | 联系方式: {{ item.contactInfo }}
                </div>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="推荐人联系方式" prop="orderReferrerInfo">
          <el-input
            v-model="crud.form.orderReferrerInfo"
            v-inputmask:orderReferrerInfo="'(+1) 999-999-9999'"
            placeholder="(+1) 123-456-7890"
            style="width: 370px;"
            @blur="handleReferrerBlur"
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
        <el-form-item label="员工收入" prop="orderAmount">
          <el-input
            v-model="crud.form.orderAmount"
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
      <!--      <el-table-column prop="orderAccountUsername" label="账号名" />-->
      <el-table-column prop="orderAppName" label="App名称">
        <template slot-scope="scope">
          {{ dict.label.bus_appName[scope.row.orderAppName] }}
        </template>
      </el-table-column>
      <!--      <el-table-column prop="orderSellerName" label="卖家名称" />-->
      <el-table-column prop="orderSellerNickname" label="卖家昵称">
        <template slot-scope="scope">
          <span>{{ scope.row.orderSellerNickname || 'N/A' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderContactInfo" label="卖家联系方式" />
      <el-table-column prop="orderSellerSsn" label="卖家SSN" />
      <el-table-column prop="orderPaymentMethod" label="支付方式" />
      <!-- <el-table-column prop="orderContactOther" label="紧急联系方式" /> -->
      <!--      <el-table-column prop="orderReferrerName" label="推荐人名称" />-->
      <el-table-column prop="orderReferrerNickname" label="推荐人昵称">
        <template slot-scope="scope">
          <span>{{ scope.row.orderReferrerNickname || 'N/A' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderReferrerInfo" label="推荐人联系方式" />
      <el-table-column prop="orderReferrerMethod" label="推荐人支付方式" />
      <el-table-column v-if="canViewOrderAmount" prop="orderReferralFee" label="推荐费" />
      <el-table-column v-if="canViewOrderAmount" prop="orderAmount" label="员工收入">
        <template slot-scope="scope">
          <span>{{ scope.row.orderAmount }}</span>
        </template>
      </el-table-column>
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
    <UploadManager ref="uploadManager" :upload-options="uploadOptions" :action="uploadAction" />
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
import { checkSeller, checkReferrer } from '@/api/order/order'
import { searchSeller } from '@/api/sellerInfo/sellerInfo'
import Inputmask from 'inputmask'
import UploadManager from '@/components/Services/UploadManager.vue'
import DateRangePicker from '@/components/DateRangePicker/index.vue'

const defaultForm = {
  orderId: null,
  orderNumber: null,
  orderStatus: 0,
  orderAccountUsername: 'N/A',
  orderAccountPassword: 'N/A',
  orderAppId: null,
  orderAppName: '',
  orderSellerId: null,
  orderSellerName: '',
  orderSellerNickname: '',
  orderSellerSsn: '',
  orderContactInfo: '',
  orderPaymentMethod: '',
  orderContactOther: '',
  orderReferrerId: null,
  orderReferrerName: '',
  orderReferrerNickname: '',
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
          { required: true, message: '卖家名称不能为空', trigger: 'blur' }
        ],
        orderSellerSsn: [
          { required: true, message: '卖家 SSN 不能为空', trigger: 'blur' },
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
            trigger: 'blur'
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
      createTime: [],
      uploadAction: process.env.VUE_APP_BASE_API + '/api/localStorage/upload',
      uploadOptions: {
        multiple: true,
        autoUpload: false,
        showFileList: true,
        limit: 10,
        fileTypes: ['*'],
        maxSize: 100 * 1024 * 1024
      }
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
    console.log(this.crud.data)
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

    // 处 SSN 输入事件
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

    // 搜索卖家信息
    handleSellerSearch(queryString, cb) {
      if (!queryString || !queryString.trim()) {
        cb([])
        return
      }

      searchSeller({ keyword: queryString })
        .then(response => {
          const suggestions = Array.isArray(response.content)
            ? response.content.map(item => ({
              value: item.name,
              nickname: item.nickname || item.name,
              name: item.name,
              ssn: item.ssn,
              contactInfo: item.contactInfo,
              paymentMethod: item.paymentMethod
            }))
            : []
          cb(suggestions)
        })
        .catch(() => cb([]))
    },

    // 处理失去焦点时的验证
    handleBlurSearch() {
      const sellerName = this.crud.form.orderSellerName.trim()
      const sellerSsn = this.crud.form.orderSellerSsn.trim()

      if (sellerName === '' || sellerSsn === '') {
        return
      }

      checkSeller({
        name: sellerName,
        ssn: sellerSsn
      }).then(response => {
        if (response.exists) {
          this.$message.success('卖家已存在，已自动填充相关信息')
          this.crud.form.orderContactInfo = response.contactInfo || ''
          this.crud.form.orderPaymentMethod = response.paymentMethod || ''
        } else {
          this.$message.warning('卖家不存在，您可以继续提交表单')
        }
      }).catch(error => {
        console.error('查询失败:', error)
        this.$message.error('查询卖家信息失败')
      })
    },

    // 选择后自动填充
    handleSellerSelect(item) {
      if (!item) return

      this.crud.form.orderSellerName = item.name
      this.crud.form.orderSellerNickname = item.nickname
      this.crud.form.orderSellerSsn = item.ssn
      this.crud.form.orderContactInfo = item.contactInfo
      this.crud.form.orderPaymentMethod = item.paymentMethod

      // 验证表单
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField(['orderSellerName', 'orderSellerSsn', 'orderContactInfo'])
        }
      })
    },

    // 处理推荐人失去焦点时的验证
    handleReferrerBlur() {
      const referrerName = this.crud.form.orderReferrerName.trim()
      const referrerInfo = this.crud.form.orderReferrerInfo.trim()

      if (referrerName === '' || referrerInfo === '') {
        return
      }

      checkReferrer({
        name: referrerName,
        contactInfo: referrerInfo
      }).then(response => {
        if (response.exists) {
          this.$message.success('推荐人已存在，已自动填充相关信息')
          this.crud.form.orderReferrerMethod = response.paymentMethod || ''
        } else {
          this.$message.warning('推荐人不存在，系统将自动创建新推荐人')
        }
      }).catch(error => {
        console.error('查询推荐人失败:', error)
        this.$message.error('查询推荐人信息失败')
      })
    },

    // 选择推荐人后自动填充
    handleReferrerSelect(item) {
      if (!item) return

      this.crud.form.orderReferrerName = item.name
      this.crud.form.orderReferrerNickname = item.nickname
      this.crud.form.orderReferrerInfo = item.contactInfo
      this.crud.form.orderReferrerSsn = item.ssn
      this.crud.form.orderReferrerMethod = item.paymentMethod

      // 验证表单
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField(['orderReferrerName', 'orderReferrerInfo'])
        }
      })
    },

    // 修改表单提交前的验证
    async [CRUD.HOOK.beforeSubmit]() {
      try {
        // 处理字段格式
        this.crud.form.orderSellerSsn = this.crud.form.orderSellerSsn.replace(/-/g, '')
        this.crud.form.orderContactInfo = this.crud.form.orderContactInfo.replace(/\(\+1\)\s?/g, '').replace(/\D+/g, '')
        if (this.crud.form.orderReferrerInfo) {
          this.crud.form.orderReferrerInfo = this.crud.form.orderReferrerInfo.replace(/\D+/g, '')
        }

        this.crud.form.orderEmployeeId = this.userInfo.id

        if (!this.canEditStatus) {
          delete this.crud.form.orderReferralFee
          delete this.crud.form.orderAmount
          delete this.crud.form.orderCommission
        }

        return true
      } catch (error) {
        console.error('验证失败:', error)
        this.$message.error('验证信息时出错，请稍后重试')
        return false
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

.sub-text {
  font-size: 12px;
  color: #999;
}

.suggestion-item {
  padding: 8px 0;
}

.primary {
  font-size: 14px;
  line-height: 1.5;
}

.secondary {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
