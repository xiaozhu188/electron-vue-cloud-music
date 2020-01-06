<template>
  <a-button
    v-bind="{...$attrs,...$slots}"
    v-on="$listeners"
    @click="handleClick"
  >
    <slot></slot>
  </a-button>
</template>

<script>
import debounce from 'loadsh/debounce'
export default {
  data () {
    return {

    }
  },
  methods: {
    handleClick: debounce(function () {
      this.$emit('click')
    }, 1000, {
      leading: true,
      trailing: false
    })
  }
}
</script>

<style lang='less' scoped></style>
