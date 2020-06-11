<template>
  <div class="tab-bar">
    <nav class="nav">
      <!-- <router-link
        :to="{name:tab.name,query:{...$route.query,page:1}}"
        v-for="(tab , index) in tabs"
        :key="index"
      >{{tab.label}}</router-link>-->
      <router-link :to="{name:tab.name}" v-for="(tab , index) in tabs" :key="index">{{tab.label}}</router-link>
    </nav>
    <div class="tab-bar-extra-content" v-if="showSearch">
      <a-input-search
        size="small"
        placeholder="搜索歌单音乐"
        style="width: 200px;"
        class="extra-search"
        @change="onChange"
        @search="onSearch"
      />
    </div>
  </div>
</template>

<script>
import debounce from 'loadsh/debounce'
export default {
  name: 'tabBar',
  props: {
    tabs: {
      type: Array,
      default () {
        return [
          {
            name: 'playlist-id-tracks',
            label: '歌曲列表'
          },
          {
            name: 'playlist-id-comment',
            label: '评论'
          },
          {
            name: 'playlist-id-subscriber',
            label: '收藏者'
          }
        ]
      }
    },
    showSearch: { type: Boolean, default: true }
  },
  methods: {
    onSearch (value) {
      this.$emit('search', value)
    },
    onChange: debounce(function (e) {
      this.$emit('search', e.target.value)
      // console.log(e.target.value)
    }, 600)
  }
}
</script>

<style scoped>
.tab-bar >>> .ant-tabs-nav-container {
  margin-left: 80px;
}

.tab-bar >>> .ant-tabs-extra-content {
  margin-right: 40px;
}

.tab-bar >>> .ant-tabs-bar {
  margin: 0;
}

.tab-bar >>> .ant-tabs-ink-bar {
  height: 4px;
}

.tab-bar >>> .ant-tabs-nav .ant-tabs-tab {
  margin: 0 50px 0 0;
  padding: 12px 0px;
}

.tab-bar >>> .ant-input {
  font-size: 12px;
  border-radius: 12px;
}
</style>
<style lang="less" scoped>
.tab-bar {
  position: sticky;
  top: 0;
  z-index: 99;
  background: #f5f5f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 45px;
  border-bottom: 1px solid #ddd;
  .nav {
    a {
      display: inline-block;
      line-height: 32px;
      margin: 0 20px;
      color: #333;
      text-decoration: none;
      &.router-link-exact-active,&.router-link-active {
        border-bottom: 3px solid @primary-color;
        color: @primary-color;
      }
    }
  }
}
</style>
