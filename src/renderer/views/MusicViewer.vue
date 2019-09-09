<template>
  <div>
    <transition name="viewSlideTop">
      <div class="music-view" v-show="showView">
        <div
          class="bg-player"
          :style="'backgroundImage: url('+current_song.avatar+')'"
          v-if="current_song.avatar"
        ></div>
        <a-icon type="down" class="icon" @click="closeMusicView"></a-icon>
        <music-view ref="viewer" @avatarClick="handleAvatarClick" />
        <div class="lyric" @click="toggleViewer" v-show="showLyric">
          <lyric-list class="view" ref="lyrics" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import MusicView from '@/components/Common/musicView.vue'
import LyricList from '@/components/Lyric/index.vue'
const LINE_HEIGHT = 42
export default {
  data () {
    return {
      songs: [],
      currentLine: 6,
      showLyric: true
    }
  },
  computed: {
    ...mapState('play', ['lyric']),
    ...mapGetters('play', [
      'current_song',
      'current_play_list',
      'current_song_index',
      'playing',
      'current_lyric_line',
      'source'
    ]),
    ...mapGetters('App', ['showView'])
  },
  components: {
    MusicView, LyricList
  },
  watch: {
    showView (newVal) {
      if (newVal) {
        this.$nextTick(() => {
          const lines = this.$refs.lyrics.$refs.lyricLine
          if (lines && lines[this.current_lyric_line]) {
            let top = Number(lines[this.current_lyric_line].offsetTop - LINE_HEIGHT * this.currentLine)
            this.$refs.lyrics.scrollTo(top)
          }
        })
        this.unWatcher = this.$watch('current_lyric_line', (newLine) => {
          this.handleLineChange(newLine)
        })
      } else {
        this.unWatcher()
      }
    }
  },
  methods: {
    handleLineChange (newLine) {
      const lines = this.$refs.lyrics.$refs.lyricLine
      if (lines && lines[newLine]) {
        let top =
          lines[newLine].offsetTop > 0
            ? Number(lines[newLine].offsetTop - LINE_HEIGHT * this.currentLine)
            : 0
        this.$refs.lyrics.scrollTo(top, 'smooth')
      }
    },
    closeMusicView () {
      this.$store.commit('App/SHOW_VIEW', false)
    },
    scrollToCurrentline (top, behavior = 'auto') {
      const lyricDom = this.$refs.lyricList
      if (lyricDom && lyricDom.scrollTo) {
        lyricDom.scrollTo({ top, behavior })
      }
    },
    toggleViewer () {
      this.$refs.viewer.toggleGlow()
      this.showLyric = !this.showLyric
    },
    handleAvatarClick () {
      this.showLyric = !this.showLyric
    }
  }
}
</script>

<style lang="less" scoped>
.lyric {
  position: absolute;
  left: 0;
  top: 10%;
  width: 100%;
  bottom: 28%;
  color: #fff;
  text-align: center;
  -webkit-app-region: no-drag;
}
.music-view {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 9999;
  overflow: hidden;
  -webkit-app-region: drag;
  background-color: #000;
  .bg-player {
    position: absolute;
    left: -60px;
    top: -60px;
    bottom: -60px;
    right: -60px;
    z-index: -1;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50%;
    filter: blur(30px) brightness(0.24);
  }
  .icon {
    position: absolute;
    right: 15px;
    top: 15px;
    font-size: 30px;
    color: rgba(255, 255, 255, 0.2);
    -webkit-app-region: no-drag;
    &:hover {
      color: rgba(255, 255, 255, 1);
      cursor: pointer;
    }
  }
}
</style>
