<template>
  <div :class="className" :style="{height: height, width: width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // 使用 macarons 主题
import { debounce } from '@/utils'

export default {
  name: 'IncomeChart',
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      handler() {
        if (this.chart) {
          this.updateChart()
        }
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHandler)
  },
  beforeDestroy() {
    if (this.chart) {
      window.removeEventListener('resize', this.__resizeHandler)
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.updateChart()
    },
    updateChart() {
      const { categories, series } = this.chartData
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: series.map(item => item.name)
        },
        grid: {
          top: 20,
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisTick: { alignWithLabel: true }
        },
        yAxis: {
          type: 'value'
        },
        series: series.map(item => ({
          ...item,
          barWidth: '10%', // 调整柱子宽度
          barGap: '10%', // 调整柱子之间的间距
          barCategoryGap: '20%' // 调整类目之间的间距
        }))
      })
    }
  }
}
</script>

<style scoped>
.chart {
  padding: 16px;
  background-color: #fff;
}
</style>
