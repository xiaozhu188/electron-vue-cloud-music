<template>
  <span>
    <template v-if="row[col.key] && row[col.key].name && row[col.key].id">
      <router-link
        :to="`/album/${row[col.key].id}`"
        :title="`专辑:${row[col.key].name}`"
      >{{ row[col.key].name }}</router-link>
    </template>
    <span v-else-if="row[col.key] && row[col.key].name" :title="row[col.key].name">{{ row[col.key].name }}</span>
    <span v-else>{{ row[col.key] && typeof row[col.key] === 'string' ? row[col.key] : '未知专辑' }}</span>
  </span>
</template>

<script>
export default {
  props: {
    row: {
      type: Object,
      default () {
        return null
      }
    },
    col: {
      type: Object,
      default () {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
  a {
    color: #333;
  }
</style>
