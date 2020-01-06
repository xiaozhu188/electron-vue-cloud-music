<template>
  <home-layout>
    <div class="title">
      <a-radio-group v-model="type" buttonStyle="solid">
        <a-radio-button value="newsong">新歌速递</a-radio-button>
        <a-radio-button value="newalbum">新碟上架</a-radio-button>
      </a-radio-group>
    </div>
    <div class="new-album">
      <component :is="type"></component>
    </div>
  </home-layout>
</template>

<script>
import HomeLayout from '@/layouts/HomeLayout'
import Loading from '@/components/Common/loading'
import Newsong from './components/newsong'
import Newalbum from './components/newalbum'

export default {
  name: 'newAlbum',
  data () {
    return {
      type: 'newsong'
    }
  },
  components: {
    HomeLayout,
    Loading,
    Newsong,
    Newalbum
  }

}
</script>

<style lang="less" scoped>
  .new-album {
    max-width: 1100px;
    margin: auto;
  }

  .title {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;

    /deep/ .ant-radio-button-wrapper {
      height: 28px;
      line-height: 26px;
    }
  }
</style>
