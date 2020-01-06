<template>
  <home-layout>
    <div class="rank" v-if="!loading">
      <header class="header">官方榜</header>
      <div class="first-four">
        <dl class="list" v-for="item in firstFour" :key="item.id">
          <dt class="title" :style="`background-image: url(${imgs[item.ToplistType]})`">
            <span class="text">{{ item.updateTime | toDate('MM月DD日') }} 更新</span>
            <a-icon type="play-circle" class="icon-play" @click="play(item.tracks, 0)"></a-icon>
          </dt>
          <dd class="item" v-for="(track, i) in item.tracks" :key="track.id" @dblclick="play(item.tracks, i)">
            <span class="index" :class="{'highlight' : i < 3}">{{ i+1 }}</span>
            <span class="name">{{ track.name }}</span>
            <artists :artists="track.artist" class="artist" />
          </dd>
          <footer class="footer">
            <router-link :to="`/rank/${item.id}`">查看全部
              <a-icon type="right" />
            </router-link>
          </footer>
        </dl>
        <dl class="list" v-if="topArtist">
          <dt class="title" :style="`background-image: url(${imgs['A']})`">
            <span class="text">{{ topArtist.updateTime | toDate('MM月DD日') }} 更新</span>
          </dt>
          <router-link tag="dd" :to="`/artist/${artist.id}`" class="item"
                       v-for="(artist, i) in topArtist.artists.slice(0, 8)" :key="artist.id" style="cursor: pointer">
            <span class="index" :class="{'highlight' : i < 3}">{{ i+1 }}</span>
            <span class="name">{{ artist.name }}</span>
          </router-link>
          <footer class="footer">
            <router-link to="/artist-top">查看全部
              <a-icon type="right" />
            </router-link>
          </footer>
        </dl>
      </div>
      <header class="header">全球榜</header>
      <a-row type="flex" :gutter="16" class="rank-row">
        <a-col :xl="4" :lg="6" class="rank-col" v-for="item in rest" :key="item.id">
          <router-link class="rank-item" :to="`/rank/${item.id}`">
            <div class="avatar">
              <img v-lazy="`${item.coverImgUrl}?param=280y280`" />
              <div class="top">
                <a-icon type="customer-service" />
                {{ item.playCount | toWan }}
              </div>
            </div>
            <div class="name">{{item.name}}</div>
          </router-link>
        </a-col>
      </a-row>
    </div>
    <loading v-else />
  </home-layout>
</template>

<script>
import HomeLayout from '@/layouts/HomeLayout'
import Loading from '@/components/Common/loading'
import Artists from '@/components/Common/artists'
import { getToplist, getTopDetail } from '@/api/rank'
import { getTopArtist } from '@/api/artist'
import { normalSong } from '@/utils/song'

const ToplistType = {
  N: {
    idx: 0
  }, // 云音乐新歌榜
  H: {
    idx: 1
  }, //  云音乐热歌榜
  O: {
    idx: 2
  }, //  网易原创歌曲榜
  S: {
    idx: 3
  } //  云音乐飙升榜
}
export default {
  name: 'rank',
  data () {
    return {
      loading: false,
      list: [],
      imgs: {
        A: require('./../../assets/images/rank/rankA_bg.jpg'),
        H: require('./../../assets/images/rank/rankH_bg.jpg'),
        N: require('./../../assets/images/rank/rankN_bg.jpg'),
        O: require('./../../assets/images/rank/rankO_bg.jpg'),
        S: require('./../../assets/images/rank/rankS_bg.jpg')
      },
      topArtist: ''
    }
  },
  computed: {
    firstFour () {
      return this.list.slice(0, 4)
    },
    rest () {
      return this.list.slice(4)
    }
  },
  components: {
    HomeLayout,
    Loading,
    Artists
  },
  activated () {
    this._getToplist()
    this._getTopArtist()
  },
  methods: {
    async _getToplist () {
      this.loading = true
      try {
        let { list } = await getToplist()
        this.list = list
        list.forEach(async item => {
          if ( item.ToplistType ) {
            let { playlist } = await getTopDetail(ToplistType[ item.ToplistType ].idx)
            item.tracks = playlist.tracks.slice(0, 8).map(track => {
              return normalSong(track)
            })
          }
        })
        this.loading = false
      } catch ( error ) {
        this.$toast('加载失败')
        this.loading = false
      }
    },
    _getTopArtist () {
      getTopArtist().then(res => {
        this.topArtist = res.list
      })
    },
    play (tracks, index) {
      this.$store.dispatch('play/selectPlay', { tracks, index })
    }
  }
}
</script>

<style lang="less" scoped>
  @import "./../../styles/mixins";

  @keyframes firstLine {
    0% {
      transform: translateZ(0) rotateX(-10deg);
    }
    100% {
      transform: translateZ(0) rotateX(0);
    }
  }

  @keyframes secLine {
    0% {
      transform: translateZ(-25px) rotateX(-30deg);
    }
    100% {
      transform: translateZ(0) rotateX(0);
    }
  }

  @keyframes thrLine {
    0% {
      transform: translateZ(-90px) rotateX(-40deg);
    }
    100% {
      transform: translateZ(0) rotateX(0);
    }
  }

  @keyframes forthLine {
    0% {
      transform: translateZ(-200px) rotateX(-50deg);
    }
    100% {
      transform: translateZ(0) rotateX(0);
    }
  }

  .rank {
    .artist {
      flex: 0 0 100px;
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      /deep/ a {
        color: rgba(0, 0, 0, .5);
      }
    }
    .header {
      line-height: 40px;
      border-bottom: 1px solid #ddd;
      margin: 20px auto;
      font-size: 20px;
      background: none;
      box-shadow: none;
      color: #000;
    }
    .first-four {
      .grid-layout(2%, 30%);
      .list {
        border: 1px solid #e8e8e8;
        .title {
          position: relative;
          height: 75px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: left;
          .text {
            position: absolute;
            left: 25%;
            bottom: 10px;
            font-size: 13px;
            font-family: "宋体";
            color: rgba(255, 255, 255, .7);
          }
          .icon-play {
            position: absolute;
            right: 20px;
            top: 50%;
            margin-top: -20px;
            color: rgba(255, 255, 255, .7);
            font-size: 40px;
            cursor: pointer;
          }
        }
        .item {
          display: flex;
          align-items: center;
          height: 35px;
          background: #f5f5f7;
          margin: 0;
          padding: 0 10px;
          font-size: 13px;
          &:nth-child(2n) {
            background: #efefef;
          }
          &:hover {
            background: #eee;
          }
          .index {
            flex: 0 0 30px;
            text-align: center;
            &.highlight {
              color: @primary-color;
            }
          }
          .name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #000;
          }
        }
        .footer {
          line-height: 50px;
          text-align: right;
          padding: 0 10px;
          background: #f3f3f3;
          color: rgba(0, 0, 0, .5);
          a {
            color: inherit;
          }
        }
      }
    }
    .rank-row {
      perspective: 400px;
      .rank-col {
        transform-origin: top center;
        transition: transform 0.5s cubic-bezier(0.15, 1, 0.3, 1.1);
        &:nth-child(n + 7) {
          animation: firstLine 0.5s cubic-bezier(0.15, 1, 0.3, 1.1);
          animation-delay: 0.3s;
        }
        &:nth-child(n + 13) {
          animation: secLine 0.5s cubic-bezier(0.15, 1, 0.3, 1.1);
          animation-delay: 0.3s;
        }
        &:nth-child(n + 19) {
          animation: thrLine 0.5s cubic-bezier(0.15, 1, 0.3, 1.1);
          animation-delay: 0.3s;
        }
        &:nth-child(n + 25) {
          animation: forthLine 0.5s cubic-bezier(0.15, 1, 0.3, 1.1);
          animation-delay: 0.3s;
        }
      }
    }
    .rank-item {
      display: block;
      margin-bottom: 32px;
      .avatar {
        position: relative;
        overflow: hidden;
        background: #ddd;
        &:hover {
          img {
            cursor: pointer;
            transform: scale(1.2)
          }
        }
        img {
          display: block;
          width: 100%;
          height: 100%;
          background: #ddd;
          transition: all .3s;
        }
        .top {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          padding: 0 5px;
          background: linear-gradient(to right, transparent 0, rgba(0, 0, 0, .5));
          color: #fff;
          font-size: 12px;
          text-align: right;
          line-height: 20px;
        }
      }
      .name {
        line-height: 25px;
        font-size: 13px;
        text-align: center;
        color: initial;
      }
    }
  }
</style>
