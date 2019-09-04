<template>
  <a-dropdown :trigger="['contextmenu']" overlayClassName="sider-right-menu">
    <slot></slot>
    <a-menu slot="overlay">
      <a-menu-item key="0">
        <div @click="deletePlaylist(row.id)">
          <a-icon type="play-circle"/>
          <span>查看评论</span>
        </div>
      </a-menu-item>
      <a-menu-item key="1">
        <div @click="deletePlaylist(row.id)">
          <a-icon type="play-circle"/>
          <span>播放(Enter)</span>
        </div>
      </a-menu-item>
      <a-menu-item key="2">
        <div @click="deletePlaylist(row.id)">
          <a-icon type="download"/>
          <span>下载全部</span>
        </div>
      </a-menu-item>
      <a-menu-item key="3">
        <div @click="deletePlaylist(row.id)">
          <a-icon type="link"/>
          <span>复制链接</span>
        </div>
      </a-menu-item>
      <a-menu-item key="4">
        <div @click="deletePlaylist(row.id)">
          <a-icon type="share-alt"/>
          <span>分享</span>
        </div>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
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
    deletePlaylist (id) {
      console.log(id)
    }
  }
}
</script>
