<template>
  <router-link :to="`/playlist/${event.playlist.id}`" class="playlist">
    <div class="avatar">
      <img v-lazy="`${event.playlist.coverImgUrl}?param=40y40`" />
    </div>
    <div class="name">{{ event.playlist.name }}</div>
  </router-link>
</template>

<script>
export default {
  props: {
    event: {
      type: Object
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.playlist {
  display: flex;
  align-items: center;
  padding: 10px;
  height: 100%;
  background: #eee;
  color: rgba(0,0,0,.65);
  &:hover {
    cursor: pointer;
    background: #ddd;
  }
  .avatar {
    position: relative;
    width: 40px;
    height: 40px;
  }
  .name {
    margin-left: 10px;
  }
}
</style>
