<template>
  <div class="dashboard-container">
    <div class="dashboard-editor-container">

      <!-- PanelGroup 展示总收入和总支出 -->
      <panel-group
        :total-income="currentTotalIncome"
        :total-payment="currentTotalPayment"
        @handleSetLineChartData="handleSetLineChartData"
      />

      <!-- 视图切换按钮 -->
      <el-row style="margin-bottom: 16px;">
        <el-button type="primary" @click="changeView('daily')">每日统计</el-button>
        <el-button type="primary" @click="changeView('weekly')">每周统计</el-button>
        <el-button type="primary" @click="changeView('monthly')">每月统计</el-button>
      </el-row>

      <!-- 折线图展示 -->
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <line-chart :chart-data="lineChartData" />
      </el-row>

      <!-- 三个图表展示区域 -->
      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <radar-chart />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <pie-chart />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <bar-chart :chart-data="barChartData" />
          </div>
        </el-col>
      </el-row>

      <!-- 收入统计图展示 -->
      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :lg="24">
          <div class="chart-wrapper">
            <IncomeChart :chart-data="incomeChartData" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import RadarChart from '@/components/Echarts/RadarChart'
import PieChart from '@/components/Echarts/PieChart'
import BarChart from '@/components/Echarts/BarChart'
import request from '@/utils/request'
import IncomeChart from '@/components/Echarts/IncomeChart'

export default {
  name: 'Dashboard',
  components: {
    PanelGroup,
    LineChart,
    RadarChart,
    PieChart,
    BarChart,
    IncomeChart
  },
  data() {
    return {
      currentView: 'daily',
      currentType: 'default', // 当前图表展示类型
      lineChartData: {
        categories: [],
        incomeData: [],
        paymentData: []
      },
      barChartData: { categories: [], series: [] },
      incomeChartData: { categories: [], series: [] },
      currentTotalIncome: 0,
      currentTotalPayment: 0
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.updateChartData()
      }, 100)
    })
  },
  methods: {
    // 切换视图
    changeView(view) {
      this.currentView = view
      this.updateChartData()
    },

    // 点击 PanelGroup 卡片时切换图表展示内容
    handleSetLineChartData(type) {
      this.currentType = type
      this.updateChartData(type)
    },

    async updateChartData(type = 'default') {
      try {
        const data = await this.fetchFinancialData(this.currentView) || {}
        const categories = data.categories || []
        const incomeData = data.incomeData || []
        const paymentData = data.paymentData || []

        console.log('更新图表时的数据:', { categories, incomeData, paymentData })

        if (!categories.length || !incomeData.length || !paymentData.length) {
          throw new Error('数据格式不正确')
        }

        // 更新总收入和总支出
        this.currentTotalIncome = incomeData.reduce((sum, val) => sum + val, 0)
        this.currentTotalPayment = paymentData.reduce((sum, val) => sum + val, 0)

        switch (type) {
          case 'income':
            this.lineChartData = {
              categories,
              incomeData,
              paymentData: Array(categories.length).fill(null) // 占位符，避免为空
            }
            break
          case 'payment':
            this.lineChartData = {
              categories,
              incomeData: Array(categories.length).fill(null),
              paymentData
            }
            break
          case 'total': {
            const totalIncomeData = incomeData.map((value, index) => {
              const total = value - paymentData[index]
              return total < 0 ? 0 : total
            })
            this.lineChartData = {
              categories,
              incomeData: totalIncomeData,
              paymentData: Array(categories.length).fill(null)
            }
            break
          }
          default:
            this.lineChartData = {
              categories,
              incomeData,
              paymentData
            }
            break
        }

        // 更新柱状图数据
        this.barChartData = {
          categories,
          series: [
            { name: '收入', type: 'bar', stack: '总计', data: incomeData },
            { name: '支出', type: 'bar', stack: '总计', data: paymentData }
          ]
        }

        // 更新收入统计图
        const totalIncomeData = incomeData.map((value, index) => {
          const total = value - paymentData[index]
          return total < 0 ? 0 : total
        })

        this.incomeChartData = {
          categories,
          series: [
            { name: '销售收入', type: 'bar', stack: '总计', data: incomeData },
            { name: '支出', type: 'bar', stack: '总计', data: paymentData },
            { name: '总收入', type: 'bar', data: totalIncomeData }
          ]
        }
      } catch (error) {
        console.error('更新图表数据失败:', error)
        this.$message.error('无法加载图表数据，请稍后重试。')
      }
    },

    async fetchFinancialData(viewType) {
      try {
        const endpoint = `/api/financeRecords/${viewType}-summary`
        console.log('请求路径:', endpoint)
        const response = await request.get(endpoint)
        console.log('API 响应:', response)

        if (!response || typeof response !== 'object') {
          console.error('API 响应无效:', response)
          throw new Error('API 响应无效或数据为 undefined')
        }

        return response
      } catch (error) {
        console.error('获取财务数据失败:', error)
        throw error
      }
    }
  }
}
</script>

<style scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
}

.chart-wrapper {
  background: #fff;
  padding: 16px;
  margin-bottom: 32px;
}
</style>
