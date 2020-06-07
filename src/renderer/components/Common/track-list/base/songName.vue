<template>
  <span class="songname" :title="getTitle(row, col)">
    <span>{{ row[col.key] }}</span>
    <small class="alia" v-if="row.alia && row.alia.length">({{ row.alia.join(',') }})</small>
    <span
      title="查看MV"
      @click="play(row.mvid)"
      class="icon-mv"
      v-if="row.mvid"
    >
      <a-icon type="youtube" />
    </span>
  </span>
</template>

<script>
import videoPlayer from '@/mixins/videoPlayer'

export default {
  mixins: [videoPlayer],
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
      if (row.alia && row.alia.length) {
        title += ` (${row.alia.join(',')})`
      }
      return title
    }
  }
}
</script>

<style lang="less" scoped>
  .songname .icon-mv {
    margin-left: 3px;
    font-size: 15px;
    color: @primary-color;
    cursor: pointer;
  }

  .alia {
    margin-left: 3px;
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
  }
</style>
