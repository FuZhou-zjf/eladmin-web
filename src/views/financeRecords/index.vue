<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">账户ID</label>
        <el-input v-model="query.accountId" clearable placeholder="账户ID" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />

        <label class="el-form-item-label">账户类型: 员工/卖家/推荐人</label>
        <el-select
          v-model="crud.query.accountType"
          clearable
          placeholder="请选择账户类型"
          style="width: 185px;"
          class="filter-item"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in dict.bus_id_type"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <label class="el-form-item-label">交易类型: 收入/支出</label>
        <el-select
          v-model="crud.query.type"
          clearable
          placeholder="请选择交易类型"
          style="width: 185px;"
          class="filter-item"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in dict.bus_money_status"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <label class="el-form-item-label">交易类别: 销售/佣金/推荐费</label>
        <el-select
          v-model="crud.query.category"
          clearable
          placeholder="请选择交易类别"
          style="width: 185px;"
          class="filter-item"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in dict.bus_category_type"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <!-- 日期范围选择器 -->
        <label class="el-form-item-label">交易日期范围</label>
        <date-range-picker v-model="crud.query.createTime" class="date-item" value-format="yyyy-MM-dd HH:mm:ss" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="订单ID">
            <el-input v-model="form.orderId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="交易日期">
            <el-date-picker v-model="form.date" type="datetime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="账户ID">
            <el-input v-model="form.accountId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="账户类型: 员工/卖家/推荐人">
            <el-select v-model="form.accountType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.bus_id_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="交易类型: 收入/支出">
            <el-select v-model="form.type" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.bus_money_status"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="交易类别: 销售/佣金/推荐费">
            <el-select v-model="form.category" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.bus_category_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="金额">
            <el-input v-model="form.amount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.description" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-input v-model="form.createdAt" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新时间">
            <el-input v-model="form.updatedAt" style="width: 370px;" />
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
        <el-table-column prop="id" label="财务记录编号" />
        <!--        <el-table-column prop="orderId" label="订单ID" />-->
        <el-table-column prop="orderNumber" label="订单编号" />
        <el-table-column prop="accountId" label="账户ID" />
        <el-table-column prop="accountType" label="账户类型: 员工/卖家/推荐人">
          <template slot-scope="scope">
            {{ dict.label.bus_id_type[scope.row.accountType] }}
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="账号名称" />
        <el-table-column prop="category" label="交易类别: 销售/佣金/推荐费">
          <template slot-scope="scope">
            {{ dict.label.bus_category_type[scope.row.category] }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="交易类型: 收入/支出">
          <template slot-scope="scope">
            {{ dict.label.bus_money_status[scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" />
        <el-table-column prop="description" label="备注" />
        <el-table-column prop="date" label="交易日期" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column prop="updatedAt" label="更新时间" />
        <el-table-column v-if="checkPer(['admin','financeRecords:edit','financeRecords:del'])" label="操作" width="150px" align="center">
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
import crudFinanceRecords from '@/api/financeRecords/financeRecords'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker/index.vue'
import checkPermission from '@/utils/permission'

const defaultForm = {
  id: null,
  orderId: null,
  date: null,
  accountId: null,
  accountType: null,
  type: null,
  category: null,
  amount: null,
  description: null,
  createdAt: null,
  updatedAt: null
}

export default {
  name: 'FinanceRecords',
  components: {
    DateRangePicker,
    pagination,
    crudOperation,
    rrOperation,
    udOperation
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['bus_id_type', 'bus_money_status', 'bus_category_type'],
  cruds() {
    return CRUD({
      title: '财务管理',
      url: 'api/financeRecords',
      idField: 'id',
      sort: 'id,desc',
      crudMethod: { ...crudFinanceRecords }
    })
  },
  data() {
    return {
      permission: {
        add: ['admin', 'financeRecords:add'],
        edit: ['admin', 'financeRecords:edit'],
        del: ['admin', 'financeRecords:del']
      },
      rules: {
        // 如有必要，定义验证规则
      },
      queryTypeOptions: [
        { key: 'accountId', display_name: '账户ID' },
        { key: 'accountType', display_name: '账户类型: 员工/卖家/推荐人' },
        { key: 'type', display_name: '交易类型: 收入/支出' },
        { key: 'category', display_name: '交易类别: 销售/佣金/推荐费' }
      ],
      // 移除单独的 query 对象
      dict: {
        bus_id_type: [], // 员工/卖家/推荐人
        bus_money_status: [], // 收入/支出
        bus_category_type: [] // 销售/佣金/推荐费
      }
    }
  },

  methods: {
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

      return true // 确保刷新成功
    },
    [CRUD.HOOK.afterRefresh](response) {
      // 可选：在刷新后处理响应数据
    }
  }
}
</script>

<style scoped>

</style>
