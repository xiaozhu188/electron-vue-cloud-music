<template>
  <a-modal
    v-bind="{...$attrs,...$slots}"
    v-on="$listeners"
    v-model="currentValue"
  >
    <slot></slot>
  </a-modal>
</template>

<script>
export default {
  data () {
    return {
      inited: false
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    dragOptions: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  watch: {
    value (newVal) {
      if (newVal) {
        this.$nextTick(() => {
          const Draggabilly = require('draggabilly')
          if (this.inited) {
            return
          }
          const draggableElems = document.querySelectorAll('.ant-modal')
          const target = draggableElems[draggableElems.length - 1]
          const handleElem = target.querySelector('.ant-modal-header')
          const dragOptions = {}
          if (handleElem && handleElem instanceof window.Node) {
            handleElem.style.cursor = '-webkit-grab'
            dragOptions.handle = '.ant-modal-header'
          } else {
            dragOptions.handle = '.ant-modal-body'
          }
          const drag = new Draggabilly(target, Object.assign(dragOptions, this.dragOptions))
          this.inited = true
        })
      }
    }
  },
  computed: {
    currentValue: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  }
}
</script>

<style lang='less'>
.draggableModal .ant-modal.is-pointer-down {
  opacity: 1;
}
.draggableModal .ant-modal.is-dragging {
  cursor: -webkit-grabbing;
}
</style>
