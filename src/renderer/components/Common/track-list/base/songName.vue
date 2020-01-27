<template>
  <span class="songname" :title="getTitle(row, col)">
    <span>{{ row[col.key] }}</span>
    <small class="alia" v-if="row.alia && row.alia.length">({{ row.alia.join(',') }})</small>
    <router-link
      :to="`/mv/${row.mvid}`"
      title="查看MV"
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
      let title = row[ col.key ]
      if ( row.alia && row.alia.length ) {
        title += ` (${row.alia.join(',')})`
      }
      return title
    }
  }
}
</script>

<style lang="less" scoped>
  .songname a {
    margin-left: 3px;
    font-size: 15px;
    color: @primary-color;
  }

  .alia {
    margin-left: 3px;
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
  }
</style>
