<template>
  <span class="songname" :title="getTitle(row, col)">
    <span>{{ row[col.key] }}</span>
    <small class="alia" v-if="row.alia && row.alia.length">({{ row.alia.join(',') }})</small>
    <router-link
      :to="`/mv/${row.mvid}`"
      title="查看MV"
      style="fontSize:15px;color:#c62f2f"
      v-if="row.mvid"
    >
      <a-icon type="youtube" />
    </router-link>
  </span>
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
  },
  methods: {
    getTitle (row, col) {
      let title = row[col.key]
      if (row.alia && row.alia.length) {
        title += ` (${row.alia.join(',')})`
      }
      return title
    }
  }
}
</script>

<style scoped>
.alia {
  margin-left: 3px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
}
</style>
