<template>
  <my-icon :type="`icon-${type}`" />
</template>

<script>
import { Icon } from 'ant-design-vue'

// let iconURL = 'public/js/icon.js'
const iconURL = 'https://at.alicdn.com/t/font_1188071_1m1k6mct6ob.js'
// console.log(iconURL)

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
