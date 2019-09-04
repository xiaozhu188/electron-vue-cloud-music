<template>
  <span title="时长">{{row[col.key] | duration}}</span>
</template>

<script>
export default {
  data () {
    return {}
  },
  props: {
    row: {
      type: Object
    },
    col: {
      type: Object
    }
  }
}
</script>

<style scoped></style>
