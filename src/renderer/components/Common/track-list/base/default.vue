<template>
  <span>
    <template v-if="row[col.key] !== ''">{{ row[col.key] }}</template>
    <template v-else>未知</template>
  </span>
</template>

<script>
export default {
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
