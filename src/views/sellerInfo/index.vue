<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">卖家ID</label>
        <el-input v-model="query.sellerId" clearable placeholder="卖家ID" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">卖家昵称</label>
        <el-input v-model="query.nickName" clearable placeholder="卖家昵称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">联系方式</label>
        <el-input v-model="query.contactInfo" clearable placeholder="联系方式" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">电话号码</label>
        <el-input v-model="query.phoneNumber" clearable placeholder="电话号码" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">社会安全号</label>
        <el-input v-model="query.ssn" clearable placeholder="社会安全号" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="卖家姓名" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="联系方式" prop="contactInfo">
            <el-input v-model="form.contactInfo" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="电子邮件" prop="email">
            <el-input v-model="form.email" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="电话号码" prop="phoneNumber">
            <el-input v-model="form.phoneNumber" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="身份证号码" prop="identityNumber">
            <el-input v-model="form.identityNumber" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="社会安全号" prop="ssn">
            <el-input v-model="form.ssn" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remarks" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="收款方式">
            <el-input v-model="form.paymentMethod" style="width: 370px;" />
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
        <el-table-column prop="sellerId" label="卖家ID" />
        <el-table-column prop="nickName" label="卖家昵称" />
        <el-table-column prop="contactInfo" label="联系方式" />
        <el-table-column prop="email" label="电子邮件" />
        <el-table-column prop="phoneNumber" label="电话号码" />
        <el-table-column prop="identityNumber" label="身份证号码" />
        <el-table-column prop="ssn" label="社会安全号" />
        <el-table-column prop="remarks" label="备注" />
        <el-table-column prop="paymentMethod" label="收款方式" />
        <el-table-column v-if="checkPer(['admin','sellerInfo:edit','sellerInfo:del'])" label="操作" width="150px" align="center">
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
import crudSellerInfo from '@/api/sellerInfo/sellerInfo'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { sellerId: null, name: null, contactInfo: null, email: null, phoneNumber: null, identityNumber: null, ssn: null, idFront: null, idBack: null, idHandheld: null, ssnFront: null, ssnBack: null, utilityBill: null, bankStatement: null, videoUrl: null, totalIncome: null, createdAt: null, lastUpdated: null, remarks: null, paymentMethod: null, nickName: null }
export default {
  name: 'SellerInfo',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '卖家测试', url: 'api/sellerInfo', idField: 'sellerId', sort: 'sellerId,desc', crudMethod: { ...crudSellerInfo }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'sellerInfo:add'],
        edit: ['admin', 'sellerInfo:edit'],
        del: ['admin', 'sellerInfo:del']
      },
      rules: {
        name: [
          { required: true, message: '卖家姓名不能为空', trigger: 'blur' }
        ],
        identityNumber: [
          { required: true, message: '身份证号码不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'sellerId', display_name: '卖家ID' },
        { key: 'nickName', display_name: '卖家昵称' },
        { key: 'contactInfo', display_name: '联系方式' },
        { key: 'phoneNumber', display_name: '电话号码' },
        { key: 'ssn', display_name: '社会安全号' }
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
