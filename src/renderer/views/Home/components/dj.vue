<template>
  <div class="dj">
    <ul class="list">
      <dj-item class="list-item" v-for="item in list.slice(0, 6)" :dj="item" :key="item.id"/>
    </ul>
  </div>
</template>

<script>
import djItem from '@/components/Common/dj-item'

export default {
  name: 'dj',
  props: {
    list: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    djItem
  }
}
</script>

<style lang="less" scoped>
  .list {
    display: flex;
    justify-content: space-between;
    .list-item {
      width: 15%;
    }
  }
</style>
