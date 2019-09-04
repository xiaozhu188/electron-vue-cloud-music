<template>
  <span>
    <artists :artists="row[col.key]" v-if="Array.isArray(row[col.key]) && row[col.key].length" />
    <span v-else>{{ '未知歌手' }}</span>
  </span>
</template>

<script>
import Artists from '@/components/Common/artists'
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
  components: {
    Artists
  }
}
</script>

<style scoped></style>
