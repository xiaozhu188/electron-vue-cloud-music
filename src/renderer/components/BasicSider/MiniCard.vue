<template>
  <transition name="player">
    <div
      class="mini-card"
      @click="setFullscreen"
      v-show="Object.keys(current_song).length && !fullscreen"
    >
      <figure class="figure-wrapper">
        <img v-lazy="current_song.avatar" :key="current_song.avatar" width="50" height="50" />
        <a-icon type="arrows-alt" class="fullscreen" />
      </figure>
      <section class="card-info">
        <header class="info-header">
          <h5 class="songname" :title="current_song.name">{{current_song.name}}</h5>
          <span class="icon-wrapper" v-if="!current_song.folder">
            <song-heart
              :isLiked="likedsongIds.includes(current_song.id)"
              @heartClick="(isLike)=>{handleLikeSong({songId:current_song.id,isLike})}"
            />
          </span>
        </header>
        <footer class="info-footer">
          <div class="artist" @click.stop>
            <artists :artists="current_song.artist" style="paddingLeft:10px" />
          </div>
          <span class="icon-wrapper" @click.stop="showShareWindow" v-if="!current_song.folder">
            <z-icon type="share" />
          </span>
        </footer>
      </section>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import ZIcon from '@/components/ZIcon'
import Artists from '@/components/Common/artists'
import SongHeart from '@/components/Common/song-heart'
export default {
  data () {
    return {}
  },
  components: {
    ZIcon,
    Artists,
    SongHeart
  },
  computed: {
    ...mapGetters('User', ['userId', 'likedsongIds']),
    ...mapGetters('play', ['current_song', 'fullscreen'])
  },
  methods: {
    setFullscreen () {
      this.$store.commit('play/SET_FULLSCREEN', true)
    },
    handleLikeSong ({ songId, isLike }) {
      this.$store.dispatch('User/handleLikeSong', { songId, isLike })
    },
    showShareWindow () {
      let url = `https://music.163.com/#/song?id=${this.current_song.id}`
      let _shareUrl =
        'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?'
      _shareUrl += 'url=' + url
      _shareUrl += '&showcount=' + 1 // 参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
      _shareUrl += '&desc=' + '♪我发现一首不错的歌曲-' + this.current_song.name
      _shareUrl += '&summary=' + '分享摘要'
      _shareUrl +=
        '&title=' + '♪我发现一首不错的歌曲-' + this.current_song.name
      _shareUrl += '&site=' + 'https://music.163.com/'
      _shareUrl += '&pics=' + this.current_song.avatar
      this.$electron.remote.shell.openExternal(_shareUrl)
    }
  }
}
</script>

<style lang="less" scoped>
.mini-card {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 12;
  display: flex;
  align-items: center;
  width: 100%;
  border-top: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  transform-origin: left bottom;
  &.player-enter-active {
    transition: all 0.2s ease-out;
    opacity: 0;
    transform: translateY(0) scale(1);
  }
  &.player-leave-active {
    transition: all 0.3s ease-out;
  }
  &.player-enter {
    opacity: 0;
    transform: translateY(30px) scale(1);
  }
  &.player-leave-to {
    opacity: 0;
    transform: translateY(0) scale(1.6);
  }

  .figure-wrapper {
    position: relative;
    flex: 0 0 50px;
    width: 50px;
    margin: 0;
    &:hover {
      .fullscreen {
        display: block;
      }
    }
    .fullscreen {
      position: absolute;
      left: 0;
      top: 0;
      font-size: 50px;
      background: rgba(0, 0, 0, 0.5);
      color: rgba(255, 255, 255, 0.8);
      display: none;
      &.f80 {
        font-size: 80px;
      }
    }
  }
  .card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    overflow: hidden;
    .info-header,
    .info-footer {
      display: flex;
      align-items: center;
      height: 25px;
      .songname,
      .artist {
        flex: 1;
        margin: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        /deep/ a {
          font-size: 12px;
        }
      }
      .songname {
        font-size: 14px;
        padding-left: 10px;
      }
      .icon-wrapper {
        flex: 0 0 20px;
        font-size: 17px;
      }
    }
  }
}
</style>
