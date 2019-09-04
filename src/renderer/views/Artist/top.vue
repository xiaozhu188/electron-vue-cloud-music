<template>
  <div class="artist-top">
    <ul>
      <li v-for="(artist, index) in artists" :key="artist.id" >
        <router-link :to="`/artist/${artist.id}`" class="artist">
          <div class="index">{{ index+1 }}</div>
          <img v-lazy="`${artist.picUrl}?param=50y50`" class="avatar">
          <div class="name">{{ artist.name }}</div>
          <div class="hot">
            <a-progress :percent="100 - artist.lastRank" strokeColor="#9a9a9a" :showInfo="false" size="small" />
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { getTopArtist } from '@/api/artist'
export default {
  data () {
    return {
      artists: []
    }
  },
  created () {
    this._getTopArtist()
  },
  methods: {
    _getTopArtist () {
      getTopArtist().then(res => {
        console.log(res)
        this.artists = res.list.artists
      })
    }
  }
}
</script>

<style lang="less" scoped>
.artist-top {
  background-color: #fff;
  li:nth-of-type(-n+3) .index{
    color: @primary-color;
  }
  .artist {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 10px 0;
    color: #333;
    box-sizing: content-box;
    border-bottom: 1px solid #eee;
    .index {
      flex: 0 0 40px;
      width: 40px;
      text-align: center;
    }
    .avatar {
      flex: 0 0 50px;
      width: 50px;
      height: 50px;
    }
    .name {
      flex: 1;
      padding: 0 10px;
    }
    .hot {
      flex: 0 0 150px;
      width: 150px;
      padding: 0 30px;
      /deep/ .ant-progress-inner {
        background: #dadada;
      }
    }
  }
}
</style>
