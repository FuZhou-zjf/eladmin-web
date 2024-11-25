<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">APP名称</label>
        <el-select
          v-model="crud.query.appName"
          clearable
          placeholder="请选择账户类型"
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
        <label class="el-form-item-label">账号名</label>
        <el-input v-model="query.accountUsername" clearable placeholder="账号名" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">账户状态</label>
        <el-select
          v-model="crud.query.accountStatus"
          clearable
          placeholder="请选择账户类型"
          style="width: 185px;"
          class="filter-item"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in dict.bus_order_status"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <!-- 日期范围选择器 -->
        <label class="el-form-item-label">交易日期范围</label>
        <date-range-picker v-model="crud.query.createTime" class="date-item" value-format="yyyy-MM-dd HH:mm:ss" />
        <label class="el-form-item-label">卖家全名</label>
        <el-input v-model="query.fullName" clearable placeholder="卖家真实名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">SSN或EIN</label>
        <el-input v-model="query.ssn" clearable placeholder="SSN或EIN" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="App名称">
            <el-select v-model="form.appName" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.bus_appName"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="账号名">
            <el-input v-model="form.accountUsername" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="账号密码">
            <el-input v-model="form.accountPassword" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="账号状态">
            <el-select v-model="form.accountStatus" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.bus_order_status"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="售出金额">
            <el-input v-model="form.saleFee" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="全名">
            <el-input v-model="form.fullName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="SSN或EIN">
            <el-input v-model="form.ssn" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="电话号码">
            <el-input v-model="form.phoneNumber" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="API URL">
            <el-input v-model="form.apiUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="电子邮件">
            <el-input v-model="form.email" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="买家名称">
            <el-input v-model="form.buyerName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" :rows="3" type="textarea" style="width: 370px;" />
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
        <el-table-column prop="appName" label="App名称">
          <template slot-scope="scope">
            {{ dict.label.bus_appName[scope.row.appName] }}
          </template>
        </el-table-column>
        <el-table-column prop="accountUsername" label="账号名" />
        <el-table-column prop="accountPassword" label="账号密码" />
        <el-table-column prop="accountStatus" label="账号状态">
          <template slot-scope="scope">
            <span :class="getStatusClass(scope.row.accountStatus)">
              {{ dict.label.bus_order_status[scope.row.accountStatus] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="saleFee" label="售出金额" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column prop="updatedAt" label="更新时间" />
        <el-table-column prop="fullName" label="卖家全名" />
        <el-table-column prop="ssn" label="SSN或EIN" />
        <el-table-column prop="phoneNumber" label="电话号码" />
        <el-table-column prop="apiUrl" label="API URL">
          <template #default="scope">
            <el-link
              type="primary"
              :href="scope.row.apiUrl"
              target="_blank"
              :underline="false"
            >
              {{ scope.row.apiUrl }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="电子邮件" />
        <el-table-column prop="buyerName" label="买家名称" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column v-if="checkPer(['admin','appInfo:edit','appInfo:del'])" label="操作" width="150px" align="center">
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
import crudAppInfo from '@/api/appInfo/appInfo'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker/index.vue'
import checkPermission from '@/utils/permission'

const defaultForm = { accountId: null, appName: null, accountUsername: null, accountPassword: null, accountStatus: null, saleFee: null, createdAt: null, updatedAt: null, fullName: null, ssn: null, birthDate: null, addressLine1: null, addressLine2: null, city: null, state: null, postalCode: null, phoneNumber: null, email: null, bankAccountNumber: null, bankRoutingNumber: null, governmentIdNumber: null, remark: null, buyerName: null, apiUrl: null }
export default {
  name: 'AppInfo',
  components: { DateRangePicker, pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['bus_appName', 'bus_order_status'],
  cruds() {
    return CRUD({ title: 'app账号管理', url: 'api/appInfo', idField: 'accountId', sort: 'accountId,desc', crudMethod: { ...crudAppInfo }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'appInfo:add'],
        edit: ['admin', 'appInfo:edit'],
        del: ['admin', 'appInfo:del']
      },
      rules: {
      },
      queryTypeOptions: [
        { key: 'appName', display_name: 'App名称' },
        { key: 'accountUsername', display_name: '账号名' },
        { key: 'accountStatus', display_name: '账号状态' },
        { key: 'createdAt', display_name: '创建时间' },
        { key: 'fullName', display_name: '全名' },
        { key: 'ssn', display_name: 'SSN或EIN' }
      ],
      dict: {
        bus_appName: [], // app名称
        bus_order_status: [] // 账号状态
      }
    }
  },
  methods: {
    getStatusClass(status) {
      switch (status) {
        case '0': return 'status-pending' // 待处理
        case '1': return 'status-sold-paid' // 已售 - 已完成付款
        case '2': return 'status-sold-unpaid' // 已售 - 未收款
        case '3': return 'status-active' // 正常状态 - 代售
        case '4': return 'status-problem' // 问题状态
        case '10': return 'status-inactive' // 已作废 - 账号已无效
        default: return ''
      }
    },
    checkPermission,
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      console.log('当前查询参数:', this.crud.query) // 添加日志
      if (this.crud.query.createTime && this.crud.query.createTime.length === 2) {
        // 直接使用日期范围选择器的返回值
        [this.crud.query.startDate, this.crud.query.endDate] = this.crud.query.createTime
      } else {
        // 如果未选择日期范围，确保查询参数为空
        this.crud.query.startDate = ''
        this.crud.query.endDate = ''
      }

      // 删除 createTime，以避免重复传递
      delete this.crud.query.createTime

      console.log('最终查询参数:', this.crud.query) // 添加日志
      console.log(this.crud.data)

      return true // 确保刷新成功
    },
    [CRUD.HOOK.afterRefresh](response) {
      console.log('afterRefresh')
      console.log(this.crud.data)
      // 可选：在刷新后处理响应数据
    }
  }
}
</script>

<style scoped>
.status-pending {
  color: #757575; /* 深灰色 */
}
.status-sold-paid {
  color: #2E7D32; /* 深绿色 */
}
.status-sold-unpaid {
  color: #66BB6A; /* 蓝灰色 */
}
.status-active {
  color: #1E88E5; /* 深蓝色 */
}
.status-problem {
  color: #FFA000; /* 橙色 */
}
.status-inactive {
  color: #D32F2F; /* 深红色 */
}

</style>
