<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">App名称</label>
        <el-input v-model="query.appName" clearable placeholder="App名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">账号名</label>
        <el-input v-model="query.accountUsername" clearable placeholder="账号名" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">账号状态</label>
        <el-input v-model="query.accountStatus" clearable placeholder="账号状态" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">创建时间</label>
        <el-input v-model="query.createdAt" clearable placeholder="创建时间" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">SSN或EIN</label>
        <el-input v-model="query.ssn" clearable placeholder="SSN或EIN" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px" />
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="appName" label="App名称">
          <template slot-scope="scope">
            {{ dict.label.bus_appName[scope.row.appName] }}
          </template>
        </el-table-column>
        <el-table-column prop="accountUsername" label="账号名" />
        <el-table-column prop="accountPassword" label="账号密码" />
        <el-table-column prop="accountStatus" label="账号状态">
          <template slot-scope="scope">
            {{ dict.label.bus_order_status[scope.row.accountStatus] }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column prop="updatedAt" label="更新时间" />
        <el-table-column prop="ssn" label="SSN或EIN" />
        <el-table-column prop="phoneNumber" label="联系电话" />
        <el-table-column prop="email" label="电子邮件" />
        <el-table-column prop="bankAccountNumber" label="银行账号" />
        <el-table-column prop="securityQuestion" label="安全问题" />
        <el-table-column prop="securityAnswer" label="答案" />
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

const defaultForm = { accountId: null, appName: null, accountUsername: null, accountPassword: null, accountStatus: null, createdAt: null, updatedAt: null, fullName: null, ssn: null, birthDate: null, addressLine1: null, addressLine2: null, city: null, state: null, postalCode: null, phoneNumber: null, email: null, bankAccountNumber: null, bankRoutingNumber: null, governmentIdNumber: null, securityQuestion: null, securityAnswer: null, remark: null }
export default {
  name: 'AppInfo',
  components: { pagination, crudOperation, rrOperation, udOperation },
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
        { key: 'ssn', display_name: 'SSN或EIN' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
