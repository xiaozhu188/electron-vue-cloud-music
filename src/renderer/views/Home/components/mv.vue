<template>
  <div class="mv">
    <ul class="list">
      <list-item
        item-type="mv"
        :ratio="0.56"
        class="list-item"
        v-for="(item) in list"
        :item="item"
        :key="item.id"
      >
        <div slot="copywriter" class="copywriter" v-if="item.copywriter">{{item.copywriter}}</div>
      </list-item>
    </ul>
  </div>
</template>

<script>
import listItem from '@/components/Common/list-item'

export default {
  name: 'mv',
  props: {
    list: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    listItem
  }
}
</script>

<style lang="less" scoped>
@gutter: 1%;
.list {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  margin: 0 -@gutter;
  .list-item {
    width: 23%;
    margin-left: @gutter;
    margin-right: @gutter;
    &:hover {
      /deep/ .top {
        display: none;
      }
      .copywriter {
        transform: translateY(0);
      }
    }
    .copywriter {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      padding: 6px;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      transform: translateY(-100%);
      transition: all 0.3s;
    }
  }
}
</style>
