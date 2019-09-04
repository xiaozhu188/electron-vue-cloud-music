<template>
  <div class="drag-box" ref="drag">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Drag',
  data () {
    return {
      title: '可拖动组件'
    }
  },
  props: {
    axis: {
      type: String,
      default: ''
    },
    containment: {
      type: [String, Boolean],
      default: 'body'
    },
    handle: {
      type: String,
      default: String
    }
  },
  mounted () {
    setTimeout(() => {
      this._initDrag()
    }, 20)
  },
  methods: {
    _initDrag () {
      const Draggabilly = require('draggabilly')
      this.drag = new Draggabilly(this.$refs.drag, {
        axis: this.axis, // 限制在仅在x或y轴上可拖动,默认均可拖动
        containment: this.containment, // Element,Selector String,限制元素可拖动范围,true为父元素
        handle: this.handle // Element,Selector String
      })
    }
  }
}
</script>
