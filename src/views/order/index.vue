<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">订单状态</label>
        <el-input v-model="query.orderStatus" clearable placeholder="订单状态" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">卖家名称</label>
        <el-input v-model="query.orderSellerName" clearable placeholder="卖家名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">卖家SSN</label>
        <el-input v-model="query.orderSellerSsn" clearable placeholder="卖家SSN" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">卖家联系方式</label>
        <el-input v-model="query.orderContactInfo" clearable placeholder="卖家联系方式" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <!-- 如果要显示字段但不允许编辑，可以用 :disabled -->
          <el-form-item label="订单状态">
            <el-select v-model="form.orderStatus" :disabled="!canEditStatus" filterable placeholder="请选择">
              <el-option v-for="item in dict.bus_order_status" :key="item.id" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="账号名" prop="orderAccountUsername">
            <el-input v-model="form.orderAccountUsername" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="密码" prop="orderAccountPassword">
            <el-input v-model="form.orderAccountPassword" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="App名称">
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
            <el-input v-model="form.orderSellerName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="卖家SSN" prop="orderSellerSsn">
            <el-input v-model="form.orderSellerSsn" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="卖家联系方式" prop="orderContactInfo">
            <el-input v-model="form.orderContactInfo" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="支付方式">
            <el-input v-model="form.orderPaymentMethod" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="紧急联系方式">
            <el-input v-model="form.orderContactOther" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="推荐人名称">
            <el-input v-model="form.orderReferrerName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="推荐人SSN">
            <el-input v-model="form.orderReferrerSsn" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="推荐人联系方式">
            <el-input v-model="form.orderReferrerInfo" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="推荐人紧急联系方式">
            <el-input v-model="form.orderReferrerOther" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="推荐人支付方式">
            <el-input v-model="form.orderReferrerMethod" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="推荐费">
            <el-input v-model="form.orderReferralFee" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="订单金额">
            <el-input v-model="form.orderAmount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="佣金">
            <el-input v-model="form.orderCommission" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.orderRemark" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNumber" label="订单编号" />
        <el-table-column prop="orderStatus" label="订单状态">
          <template slot-scope="scope">
            {{ dict.label.bus_order_status[scope.row.orderStatus] }}
          </template>
        </el-table-column>
        <el-table-column prop="orderAccountUsername" label="账号名" />
        <el-table-column prop="orderAccountPassword" label="密码" />
        <el-table-column prop="orderAppId" label="App项目编号" />
        <el-table-column prop="orderAppName" label="App名称">
          <template slot-scope="scope">
            {{ dict.label.bus_appName[scope.row.orderAppName] }}
          </template>
        </el-table-column>
        <el-table-column prop="orderSellerName" label="卖家名称" />
        <el-table-column prop="orderSellerSsn" label="卖家SSN" />
        <el-table-column prop="orderContactInfo" label="卖家联系方式" />
        <el-table-column prop="orderPaymentMethod" label="支付方式" />
        <el-table-column prop="orderReferrerName" label="推荐人名称" />
        <el-table-column prop="orderReferrerSsn" label="推荐人SSN" />
        <el-table-column prop="orderReferrerInfo" label="推荐人联系方式" />
        <el-table-column prop="orderReferrerMethod" label="推荐人支付方式" />
        <el-table-column prop="orderReferralFee" label="推荐费" />
        <el-table-column prop="orderAmount" label="订单金额" />
        <el-table-column prop="orderCommission" label="佣金" />
        <el-table-column prop="orderRemark" label="备注" />
        <el-table-column v-if="checkPer(['admin','order:edit','order:del'])" label="操作" width="150px" align="center">
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
import crudOrder from '@/api/order/order'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { orderId: null, orderNumber: null, orderStatus: null, orderAccountUsername: null, orderAccountPassword: null, orderAppId: null, orderAppName: null, orderSellerId: null, orderSellerName: null, orderSellerSsn: null, orderContactInfo: null, orderPaymentMethod: null, orderContactOther: null, orderReferrerId: null, orderReferrerName: null, orderReferrerSsn: null, orderReferrerInfo: null, orderReferrerOther: null, orderReferrerMethod: null, orderReferralFee: null, orderAmount: null, orderEmployeeId: null, orderCommission: null, orderCreatedAt: null, orderUpdatedAt: null, orderRemark: null }
export default {
  name: 'Order',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['bus_order_status', 'bus_appName'],
  cruds() {
    // 使用 crudOrder，确保这个变量已正确引入
    return CRUD({ title: '订单管理', url: 'api/order', idField: 'orderId', sort: 'orderId,desc', crudMethod: { ...crudOrder }})
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
          { required: true, message: '账号名不能为空', trigger: 'blur' }
        ],
        orderAccountPassword: [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ],
        orderSellerName: [
          { required: true, message: '卖家名称不能为空', trigger: 'blur' }
        ],
        orderSellerSsn: [
          { required: true, message: '卖家SSN不能为空', trigger: 'blur' }
        ],
        orderContactInfo: [
          { required: true, message: '卖家联系方式不能为空', trigger: 'blur' }
        ]
      },
      userInfo: {}, // 用户信息对象，包括 dept_id
      canEditStatus: false, // 控制是否能编辑订单状态
      allowedDeptIds: ['7'], // 可以编辑订单状态的部门ID列表
      queryTypeOptions: [
        { key: 'orderStatus', display_name: '订单状态' },
        { key: 'orderSellerName', display_name: '卖家名称' },
        { key: 'orderSellerSsn', display_name: '卖家SSN' },
        { key: 'orderContactInfo', display_name: '卖家联系方式' }
      ]
    }
  },
  mounted() {
    // 页面加载时获取用户信息
    this.$http.get('auth/info').then(response => {
      // 调试输出，查看返回数据
      console.log(response.data)
      this.userInfo = response.data

      // 判断用户是否有权限编辑订单状态
      if (this.allowedDeptIds.includes(this.userInfo.dept_id)) {
        this.canEditStatus = true
      }
    }).catch(error => {
      console.error('获取用户信息失败', error)
    })
  },
  methods: {
    // 获取用户信息
    getUserInfo() {
      // 模拟 API 调用，根据实际情况调用你的用户 API
      this.$http.get('/api/users').then(response => {
        this.userInfo = response.data

        // 判断用户是否有权限编辑订单状态
        if (this.allowedDeptIds.includes(this.userInfo.dept_id)) { // 替换为允许编辑订单状态的部门ID列表
          this.canEditStatus = true
        }
      }).catch(error => {
        console.error('获取用户信息失败', error)
      })
    },

    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}

</script>

<style scoped>

</style>
