<template>
  <div class="fm">
    <div class="fm-cover">
      <div class="l">
        <div class="cover-wrapper">
          <template v-if="tracks.length">
            <template v-for="(item, index) in tracks">
              <img v-lazy="item.avatar" ref="avatar" v-if="current_song_index-3<index" :key="`${item.id}_${index}`" class="avatar" :class="setClass(index)" @click="prev($event, index)">
            </template>
            <a-icon :type="playIcon" class="icon-play" :class="{'right-bottom' : playing}" @click="togglePlay" />
          </template>
          <div class="loading-wrapper" v-else>
            <loading></loading>
          </div>
        </div>
        <div class="fm-actions">
          <a-button size="large" shape="circle" icon="heart" title="喜欢"/>
          <a-button size="large" shape="circle" icon="delete" title="垃圾桶"/>
          <a-button size="large" shape="circle" icon="step-forward" title="下一曲" :disabled="loading || disabled" @click="next"/>
          <a-button size="large" shape="circle" icon="ellipsis" title="更多"  />
        </div>
      </div>
      <div class="r" v-if="current_song">
        <h2 class="song-name">{{current_song.name}}</h2>
        <div class="song-info">
          <div class="song-album">专辑: <router-link :to="`/album/${current_song.album.id}`">{{current_song.album.name}}</router-link> </div>
          <div class="song-artist">
            歌手:
            <artists :artists="current_song.artist"/>
          </div>
        </div>
        <lyric-list class="default" ref="lyrics" />
      </div>
    </div>

    <div class="fm-comment">
      <comment :commentData="commentData"></comment>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapState, mapGetters } from 'vuex'
import { getFm } from '@/api/user'
import { normalSong, getUrl } from '@/utils/song'
import { getSongComment } from '@/api/comment'
import LyricList from '@/components/Lyric/index.vue'
import Artists from '@/components/Common/artists'
import Comment from '@/components/Comment/index.vue'
import Loading from '@/components/Common/loading.vue'

export default {
  name: 'fm',
  data () {
    return {
      tracks: [],
      disabled: false,
      commentData: null,
      loading: false
    }
  },
  components: {
    Artists, Comment, Loading, LyricList
  },
  computed: {
    ...mapState('play', ['lyric']),
    ...mapGetters('play', [
      'fullscreen',
      'current_song',
      'playing',
      'current_lyric_line',
      'current_song_index',
      'current_play_list'
    ]),
    playIcon () {
      return this.playing ? 'pause-circle' : 'play-circle'
    }
  },
  watch: {
    current_lyric_line (newLine) {
      const lines = this.$refs.lyrics.$refs.lyricLine
      const line_HEIGHT = lines[newLine].getBoundingClientRect().height
      let top = lines[newLine].offsetTop > 0 ? Number(lines[newLine].offsetTop - line_HEIGHT * 4) : 0
      this.$refs.lyrics.scrollTo(top, 'smooth')
    },
    current_song (newSong, oldSong) {
      if (newSong.id === oldSong.id) return
      this.handleFmChange(newSong)
    }
  },
  activated () {
    if (this.current_song.isFm && this.playing) return
    this.init()
  },
  methods: {
    setClass (index) {
      if (index === this.current_song_index) {
        return 'active'
      } else if (index === this.current_song_index - 1) {
        return 'prev'
      } else if (index === this.current_song_index - 2) {
        return 'hide'
      }
    },
    init () {
      this.loading = true
      this._getFm().then(tracks => {
        this.tracks = tracks
        this.$store.dispatch('play/selectPlay', { tracks: tracks, index: 0 })
        this.loading = false
      }).catch(() => {
        this.disabled = false
      })
    },
    handleFmChange (song) {
      this.$nextTick(() => {
        // this.$refs.lyrics.scrollTo(0)
        if (song.id) {
          this.getComment(song.id)
        }
      })
      if (this.current_song_index === this.current_play_list.length - 1) {
        this._getFm().then(tracks => {
          this.tracks = this.tracks.concat(tracks)
          let list = this.current_play_list
          list = list.concat(tracks)
          this.$store.commit('play/SET_CURRENT_PLAY_LIST', list)
        }).catch(err => {
          console.log(err)
        })
      }
    },
    play () {
      this.$store.dispatch('play/selectPlay', { tracks: this.tracks, index: 0 })
    },
    togglePlay () {
      this.$store.commit('play/SET_PLAY_STATUS', !this.playing)
    },
    async _getFm () {
      try {
        let { data } = await getFm()
        let tracks = data.map(song => {
          return normalSong(song, '290y290', true)
        })
        return tracks
      } catch (error) {
        throw new Error(error)
      }
    },
    async prev (e, index) {
      console.log(e)
      if (this.disabled) return
      this.disabled = true
      let current_song_index = this.current_song_index
      current_song_index--
      if (current_song_index < 0) {
        this.disabled = false
        return
      }

      this.$store.commit('play/SET_CURRENT_INDEX', current_song_index)
      setTimeout(() => {
        this.disabled = false
      }, 1000)
    },
    async next () {
      if (this.disabled) return
      this.disabled = true
      let current_song_index = this.current_song_index
      current_song_index++

      this.$store.commit('play/SET_CURRENT_INDEX', current_song_index)
      setTimeout(() => {
        this.disabled = false
      }, 1000)
    },
    getComment (id) {
      getSongComment(id).then(res => {
        this.commentData = res
      })
    }
  }
}
</script>

<style lang="less" scoped>
.fm {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 10px;
}
.fm-cover {
  display: flex;
  justify-content: space-between;
  .l,
  .r {
    position: relative;
    flex: 1;
  }
  .l {
    padding-right: 15px;
  }
  .r {
    overflow: hidden;
    .song-name {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .song-info {
      display: flex;
      justify-content: space-between;
      white-space: nowrap;
      padding-right: 4px;
      a {
        color: #215eb9;
      }
      .song-album,.song-artist {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        max-width: 50%;
      }
    }
  }
  .cover-wrapper {
    position: relative;
    height: 360px;
    perspective: 400px;
    .avatar {
      position: absolute;
      right: 0;
      top: 50%;
      margin-top: -145px;
      width: 290px;
      height: 290px;
      background: #f3f5f9;
      border: 1px solid #eee;
      transform: translate3d(100%, 0, 0);
      transition: all 1s .3s;
      opacity: 0;
      &[lazy="loaded"] {
        animation: none;
      }
      &.active {
        transform: translate3d(0, 0, 0);opacity: 1;
      }
      &.prev {
        transform: translate3d(-80px, 0, -100px);opacity: 1;
        &:hover {
          transform: translate3d(-220px, 0, -100px);
          transition-duration: .3s;
          transition-delay: 0s;
          cursor: pointer;
        }
      }
      &.hide {
        transform: translate3d(-200px, 0, -200px);opacity: 0;
      }
    }
    .icon-play {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
      z-index: 11;
      font-size: 44px;
      color: rgba(255, 255, 255, 0.7);
      margin-left: 50px;
      cursor: pointer;
      transition: all.5s;
      &.right-bottom {
        transform: translate(90px,90px);
      }
    }
  }
  .fm-actions {
    display: flex;
    justify-content: space-between;
    width: 300px;
    float: right;
  }
}
.fm-comment {
  padding: 15px 30px;
}
.lyric-list {
  display: inline-block;
  vertical-align: top;
  width: 100%;
  height: 330px;
  border-right: 1px solid #ddd;
  overflow: auto;
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.6) 15%,
    rgba(255, 255, 255, 1) 25%,
    rgba(255, 255, 255, 1) 75%,
    rgba(255, 255, 255, 0.6) 85%,
    rgba(255, 255, 255, 0) 100%
  );
  .lyric-wrapper {
    overflow: auto;
    .text {
      margin: 8px 0;
      line-height: 26px;
      color: #333;
      font-size: 13px;
      transition: all 0.3s;
      &:first-child {
        margin-top: 30px;
      }
      &:last-child {
        padding-bottom: 100px;
      }
      &.current {
        color: @primary-color;
        font-size: 15px;
        text-shadow: 1px 1px rgba(0, 0, 0, 0.2), 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.value {
  color: #215eb9;
}
</style>
