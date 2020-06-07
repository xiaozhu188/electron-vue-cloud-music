<template>
  <div class="progress-bar" ref="progressBar" @click.prevent.stop="progressClick">
    <div class="progress" ref="progress" :style="{width : `${progressOffsetWidth}px`}"></div>
    <div class="buffered" ref="buffered" :style="{width : `${bufferedOffsetWidth}px`}"></div>
    <div :class="handleCls" @mousedown="onMouseDown" :style="{transform : `translateX(${progressbarTranslateX}px)`}">
      <img src="./../../assets/images/loading.gif" class="progress-waiting" v-if="waiting">
      <div class="progress-btn" v-else></div>
    </div>
    <div class="virtual-bar" ref="virtualBar"></div>
  </div>
</template>

<script>
import { debounce } from '@/utils/dom'

export default {
  name: 'progressBar',
  data () {
    this.mouse = {} // 记录鼠标位置，是否按下等信息
    return {
      bufferedOffsetWidth: 0,
      progressOffsetWidth: 0,
      progressbarTranslateX: 0
    }
  },
  props: {
    percent: {
      type: Number,
      default: 0
    },
    bufferedPercent: {
      type: Number,
      default: 0
    },
    size: {
      type: String,
      default: 'default',
      validator (value) {
        return ['default', 'small'].includes(value)
      }
    },
    waiting: {
      type: Boolean,
      default: false
    }
  },
  destroy () {
    window.removeEventListener('resize', debounce(this.handleResize, 50))
  },
  mounted () {
    this.changeProgressbarWidth(this.percent)
    let _this = this
    window.addEventListener('resize', debounce(this.handleResize, 50))
    const virtualBar = this.$refs.virtualBar
    virtualBar.addEventListener('mousemove', debounce(function (e) {
      e.stopPropagation()
      const progressBar = _this.$refs.progressBar
      let pageX = e.pageX
      let diff = pageX - progressBar.getBoundingClientRect().left
      let percent = (diff / progressBar.clientWidth).toFixed(2)
      _this.$emit('virtualBarMove', { pageX, percent })
    }, 200))
    virtualBar.addEventListener('mouseleave', debounce(function (e) {
      _this.$emit('virtualBarLeave')
    }, 200))
  },
  computed: {
    handleCls () {
      return this.size === 'small'
        ? 'handle small'
        : 'handle'
    }
  },
  watch: {
    percent (newPercent) {
      if (newPercent >= 0 && !this.mouse.isDown) {
        this.changeProgressbarWidth(newPercent)
      }
    },
    bufferedPercent (newPercent) {
      this.changeBufferedWidth(newPercent)
    }
  },
  methods: {
    handleResize () {
      this.changeBufferedWidth(this.bufferedPercent)
      this.changeProgressbarWidth(this.percent)
    },
    onMouseDown (e) {
      e.preventDefault()
      this.mouse.startX = e.pageX
      this.mouse.isDown = true
      this.mouse.left = this.$refs.progress.clientWidth
      document.onmousemove = e => {
        e.preventDefault()
        if (!this.mouse.isDown) return
        const progressBar = this.$refs.progressBar
        const progress = this.$refs.progress
        const progressBarWidth = progressBar.getBoundingClientRect().width
        this.mouse.moveX = e.pageX
        let diffX = this.mouse.moveX - this.mouse.startX + this.mouse.left
        if (diffX < 0) {
          diffX = 0
        }
        if (diffX > progressBarWidth) {
          diffX = progressBarWidth
        }
        this.progressOffsetWidth = diffX
        this.progressbarTranslateX = diffX
        this.$emit('percentChanging', this.calcPercent())
      }
      document.onmouseup = e => {
        if (!this.mouse.isDown) return
        this.mouse.isDown = false
        document.onmousemove = null
        this.$emit('percentChanged', this.calcPercent())
      }
    },
    progressClick (e) {
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this.progressOffsetWidth = offsetWidth
      this.progressbarTranslateX = offsetWidth
      this.$emit('percentChanged', this.calcPercent())
    },
    calcPercent () {
      return (this.progressOffsetWidth / this.$refs.progressBar.clientWidth).toFixed(2)
    },
    changeProgressbarWidth (percent) {
      const barWidth = this.$refs.progressBar.getBoundingClientRect().width
      const offsetWidth = percent * barWidth
      this.progressOffsetWidth = offsetWidth
      this.progressbarTranslateX = offsetWidth
    },
    changeBufferedWidth (percent) {
      const barWidth = this.$refs.progressBar.getBoundingClientRect().width
      const offsetWidth = percent * barWidth
      this.bufferedOffsetWidth = offsetWidth
    }
  }
}
</script>

<style lang="less" scoped>
  .progress-bar {
    position: relative;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: rgba(123, 123, 123, 0.3);
    cursor: pointer;
    .virtual-bar {
      position: absolute;
      left: 0;
      top: -4px;
      right: 0;
      bottom: -4px;
      z-index: 2;
    }
    .progress {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2;
      height: 100%;
      background: @primary-color;
      border-radius: 2px;
    }
    .buffered {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
      height: 100%;
      background: rgba(123, 123, 123, 0.5);
      transition: all .1s ease-out;
    }
    .handle {
      position: absolute;
      left: -10px;
      top: 50%;
      margin-top: -8px;
      z-index: 3;
      width: 20px;
      height: 16px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #ddd;
      cursor: pointer;
      box-sizing: border-box;
      &.small {
        left: -7px;
        margin-top: -7px;
        width: 14px;
        height: 14px;
        border-radius: 7px;
        .progress-btn {
          top: 3px;
          left: 3px;
        }
      }
      &:hover {
        box-shadow: 0px 0px 3px 2px rgba(0, 0, 0, 0.1);
      }
      .progress-btn {
        position: relative;
        top: 4px;
        left: 6px;
        z-index: 1;
        box-sizing: border-box;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: @primary-color;
      }
      .progress-waiting {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        z-index: 2;
      }
    }
  }
</style>
