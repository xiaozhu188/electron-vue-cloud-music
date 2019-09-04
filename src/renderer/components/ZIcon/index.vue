<template>
  <my-icon :type="`icon-${type}`" />
</template>

<script>
import path from 'path'
import { Icon } from 'ant-design-vue'
let iconURL = process.env.NODE_ENV === 'development'
  ? '/static/js/icon.js'
  : path.join(__static, 'js/icon.js')

let MyIcon = Icon.createFromIconfontCN({
  scriptUrl: iconURL
})

export default {
  components: {
    MyIcon
  },
  props: {
    type: {
      type: String,
      required: true
    }
  }
}
</script>
