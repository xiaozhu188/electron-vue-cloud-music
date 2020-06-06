<template>
  <transition name="player">
    <div class="player" ref="player" v-show="fullscreen">
      <section class="main">
        <a-icon type="shrink" class="shrink" @click="shrinkScreen" />
        <div class="main-top">
          <div class="left">
            <div class="avatar-wrapper" ref="avatarWrapper"
                 :class="[{'play' : isAddAnimation},{'pause' : !playing},{'has-freq' : showFreq}]">
              <img :src="current_song.avatar" class="song-avatar" />
            </div>
            <div class="actions" v-if="current_song">
              <a-button :disabled="!!current_song.folder" @click="_handleLikeSong">
                <song-heart :isLiked="isLiked" style="marginRight:4px" />
                <span>喜欢</span>
              </a-button>
              <collect-btn />
              <a-button icon="share-alt" :disabled="!!current_song.folder" @click="share">
                分享
              </a-button>
              <a-button :disabled="!!current_song.folder || downloadstatus.downloaded" :icon="downloadstatus.icon"
                        @click="download(current_song)">
                {{downloadstatus.text}}
              </a-button>
            </div>
            <div :class="lineCls" v-if="!showFreq">
              <img src="./../../assets/images/track_line.png">
            </div>
          </div>
          <div class="right" v-if="Object.keys(current_song).length">
            <h4 class="name">
              <span>{{current_song.name}}</span>
              <router-link to="/" v-if="current_song.mv" class="label">mv</router-link>
            </h4>
            <div class="alia" v-if="current_song.alia && current_song.alia.length">
              <span v-for="(item ,index) in current_song.alia" :key="index">{{item.name}}</span>
            </div>
            <div class="info">
              <div class="album" :title="current_song.album.name" v-if="current_song.album">
                专辑：
                <router-link :to="`/album/${current_song.album.id}`" class="value">{{current_song.album.name}}
                </router-link>
              </div>
              <div class="singer" v-if="current_song.artist">
                歌手：
                <artists :artists="current_song.artist" />
              </div>
            </div>
            <div class="lyric">
              <span class="pushpin" :class="{'active':fixLyric}" :title="fixLyric?'取消固定':'固定歌词'"
                    @click="toggleFixLyric">
                <a-icon type="pushpin" />
              </span>
              <a-tooltip placement="left">
                <template slot='title'>
                  {{ delay > 0 ? `+${delay/1000}` : delay/1000 }}s
                </template>
                <div class="lyric-control">
                  <div class="backward" @click="backward" title="后退0.5s">
                    <a-icon type="double-left" />
                  </div>
                  <div class="forward" @click="forward" title="前进0.5s">
                    <a-icon type="double-right" />
                  </div>
                </div>
              </a-tooltip>

              <lyric-list class="default" ref="lyrics" />
            </div>
          </div>
        </div>
        <div class="main-bottom">
          <div class="left" v-if="!refresh && !this.current_song.folder">
            <comment :commentData="comment" v-if="!current_song.folder"></comment>
            <infinite-loading :identifier="infiniteId" @infinite="loadmore" />
          </div>
          <div class="right">
            <div class="col" v-if="!this.current_song.folder && simiPlaylists.length">
              <h5 class="title">包含这首歌的歌单</h5>
              <ul>
                <li v-for="playlist in simiPlaylists" :key="playlist.id" class="simi-song" @click="goRoute(playlist)">
                  <img v-lazy="`${playlist.coverImgUrl}?param=40y40`" class="song-avatar">
                  <div class="song-info">
                    <div class="song-name">{{playlist.name}}</div>
                    <div class="playcount">播放次数: {{ playlist.playCount | toWan }}</div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="col" v-if="!this.current_song.folder && simiSongs.length">
              <h5 class="title">相似歌曲</h5>
              <ul>
                <li v-for="(song, index) in simiSongs" :key="song.id" class="simi-song" @click="play(simiSongs, index)">
                  <img v-lazy="song.avatar" class="song-avatar">
                  <div class="song-info">
                    <div class="song-name">{{song.name}}</div>
                    <artists :artists="song.artist" />
                  </div>
                </li>
              </ul>
            </div>
            <div class="col" v-if="!this.current_song.folder && users.length">
              <h5 class="title">喜欢这首歌的人</h5>
              <ul>
                <li v-for="user in users" :key="user.userId" class="related-user" @click="goUserRoute(user.userId)">
                  <div class="user-info">
                    <img v-lazy="user.avatarUrl" class="song-avatar">
                    <div class="username">
                      <span>{{user.nickname}} </span>
                    </div>
                  </div>
                  <z-icon type="man" v-if="user.gender == 1" />
                  <z-icon type="woman" v-else-if="user.gender == 2" />
                  <div class="time">{{user.recommendReason}}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <div class="bg-player" :style="'backgroundImage: url('+current_song.avatar+')'"
           v-if="Object.keys(current_song).length"></div>
    </div>
  </transition>
</template>

<script>
import LyricList from '@/components/Lyric/index.vue'
import debounce from 'loadsh/debounce'
import { mapState, mapGetters } from 'vuex'
import Lyric from '@/utils/class/Lyric.js'
import Artists from '@/components/Common/artists'
import Comment from '@/components/Comment/index.vue'
import ZIcon from '@/components/ZIcon/index.vue'
import SongHeart from '@/components/Common/song-heart'
import CollectBtn from './CollectBtn'
import { getSongComment } from '@/api/comment'
import { getSimiPlaylist, getSimiSong, getSongUsers } from '@/api/song'
import { normalSong } from '@/utils/song'

const LYRIC_LINE_HEIGHT = 34

export default {
  name: 'player',
  data () {
    return {
      isAddAnimation: false,
      comment: null,
      simiSongs: [],
      simiPlaylists: [],
      users: [],
      fixLyric: false,
      limit: 20,
      offset: 0,
      infiniteId: +new Date(),
      refresh: false,
      delay: 0,
      showTime: false,
      showFreq: false
    }
  },
  mounted () {
    if (this.current_song.avatar) {
      let img = new Image()
      img.src = this.current_song.avatar
      console.log('this.current_song.avatar', this.current_song.avatar)
      img.onload = () => {
        this.isAddAnimation = true
      }
    }
  },
  components: {
    Artists, Comment, ZIcon, SongHeart, CollectBtn, LyricList
  },
  computed: {
    ...mapState('Download', ['downloaded', 'downloading', 'queue']),
    ...mapState('play', ['lyric']),
    ...mapGetters('play', [
      'fullscreen',
      'current_song',
      'playing',
      'source',
      'current_lyric_line'
    ]),
    ...mapGetters('User', [
      'likedsongIds', 'createdList', 'userId'
    ]),
    isLiked () {
      return this.likedsongIds.includes(this.current_song.id)
    },
    lineCls () {
      return this.playing ? 'track-line' : 'track-line paused'
    },
    downloadstatus () {
      return [...this.downloaded, ...this.queue].findIndex(item => item.id === this.current_song.id) >= 0
        ? { icon: 'check-circle', text: '已下载', downloaded: true }
        : { icon: 'download', text: '下载' }
    }
  },
  watch: {
    fixLyric (newVal) {
      if (!newVal) { // 如果取消了固定歌词,自动滚到当前歌词行
        const lines = this.$refs.lyrics.$refs.lyricLine
        let top = Number(lines[ this.current_lyric_line ].offsetTop - LYRIC_LINE_HEIGHT * 3)
        this.$refs.lyrics.scrollTo(top, 'smooth')
      }
    },
    current_song (newSong, oldSong) {
      if (newSong.id === oldSong.id || !this.fullscreen) return
      this.delay = 0
      this.$refs.lyrics.scrollTo(0)
      this._getSimiPlaylist(newSong.id)
      this._getSimiSong(newSong.id)
      this._getSongUsers(newSong.id)

      this.offset = 0
      this.comment = null
      this.refresh = true
      this.$nextTick(() => {
        this.refresh = false
      })
    },
    fullscreen (newVal) {
      this.$nextTick(() => {
        if (newVal) {
          this.unWatcher_lyric = this.$watch('current_lyric_line', (newLine) => {
            if (this.fixLyric) return
            const lines = this.$refs.lyrics.$refs.lyricLine
            if (lines && lines[ newLine ]) {
              let top = lines[ newLine ].offsetTop > 0 ? Number(lines[ newLine ].offsetTop - LYRIC_LINE_HEIGHT * 3) : 0
              this.$refs.lyrics.scrollTo(top, 'smooth')
            }
          })
          let img = new Image()
          img.src = this.current_song.avatar
          img.onload = () => {
            this.isAddAnimation = true
          }

          this.$nextTick(() => {
            this.scrollToCurrentLine()
          })

          if (this.current_song.folder) return

          this.offset = 0
          this.comment = null
          this.refresh = true
          this.$nextTick(() => {
            this.refresh = false
          })
          this._getSimiPlaylist(this.current_song.id)
          this._getSimiSong(this.current_song.id)
          this._getSongUsers(this.current_song.id)
        } else {
          this.isAddAnimation = false
          this.unWatcher_lyric && this.unWatcher_lyric()
        }
      })
    }
  },
  methods: {
    scrollToCurrentLine () {
      const lines = this.$refs.lyrics.$refs.lyricLine
      if (lines && lines[ this.current_lyric_line ]) {
        let top = Number(lines[ this.current_lyric_line ].offsetTop - LYRIC_LINE_HEIGHT * 3)
        this.$refs.lyrics.scrollTo(top, 'smooth')
      }
    },
    backward () {
      this.delay += 500
      this.lyric.resetTime && this.lyric.resetTime(500)

      const currentTime = document.getElementById(this.source).currentTime
      this.lyric.seek(currentTime * 1000)
      if (!this.playing) {
        this.lyric.stop()
      }
    },
    forward () {
      this.delay -= 500
      this.lyric.resetTime && this.lyric.resetTime(-500)

      const currentTime = document.getElementById(this.source).currentTime
      this.lyric.seek(currentTime * 1000)
      if (!this.playing) {
        this.lyric.stop()
      }
    },
    share () {
      let url = `https://music.163.com/#/song?id=${this.current_song.id}`
      let _shareUrl = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?'
      _shareUrl += 'url=' + url
      _shareUrl += '&showcount=' + 1 // 参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
      _shareUrl += '&desc=' + '♪我发现一首不错的歌曲-' + this.current_song.name
      _shareUrl += '&summary=' + '分享摘要'
      _shareUrl += '&title=' + '♪我发现一首不错的歌曲-' + this.current_song.name
      _shareUrl += '&site=' + 'https://music.163.com/'
      _shareUrl += '&pics=' + this.current_song.avatar
      this.$electron.remote.shell.openExternal(_shareUrl)
    },
    shrinkScreen () {
      this.$store.commit('play/SET_FULLSCREEN', false)
    },
    toggleFixLyric () {
      this.fixLyric = !this.fixLyric
    },
    _getSimiSong (id) {
      if (this.current_song.folder) return
      getSimiSong(id).then(res => {
        this.simiSongs = res.songs.map(song => {
          return normalSong(song)
        })
      })
    },
    _getSimiPlaylist (id) {
      if (this.current_song.folder) return
      getSimiPlaylist(id).then(res => {
        this.simiPlaylists = res.playlists
      })
    },
    _getSongUsers (id) {
      if (!!this.current_song.folder || !this.userId) {
        return
      }
      getSongUsers(id).then(res => {
        this.users = res.userprofiles
      })
    },
    async loadmore ($state) {
      if (this.current_song.folder) return
      let res = await getSongComment(this.current_song.id, this.limit, this.offset)
      if (res.comments.length) {
        if (this.comment) {
          this.comment.comments.push(...res.comments)
        } else {
          this.comment = res
        }
      }
      if (res.more) {
        this.offset += this.limit
        $state.loaded()
      } else {
        $state.complete()
      }
    },
    _handleLikeSong () {
      this.$store.dispatch('User/handleLikeSong', { songId: this.current_song.id, isLike: !this.isLiked })
    },
    download (song) {
      // if (this.downloaded.findIndex(item => item.id === this.current_song.id) >= 0) return
      this.$store.dispatch('Download/adddownloadQueue', [song])
    },
    play (tracks, index) {
      this.$store.dispatch('play/appendPlay', tracks[ index ])
    },
    goRoute (playlist) {
      this.shrinkScreen()
      this.$router.push({ path: `/playlist/${playlist.id}` })
    },
    goUserRoute (userId) {
      this.shrinkScreen()
      this.$router.push({ path: `/user?id=${userId}` })
    }
  }
}
</script>

<style lang="less" scoped>
  @main-width: 1000px;
  .player {
    position: fixed;
    left: 0;
    right: 0;
    top: 50px;
    bottom: 50px;
    z-index: 999;
    background: #fff;
    overflow-y: auto;
    overflow-x: hidden;
    transform-origin: left bottom;
    &.player-enter-active,
    &.player-leave-active {
      transition: all 0.2s ease-out;
    }
    &.player-enter,
    &.player-leave-to {
      opacity: 0;
      transform: scale(0.16, 0.08);
    }

    .bg-player {
      position: absolute;
      left: 0;
      top: 0;
      overflow: hidden;
      width: 100%;
      height: 600px;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: 50%;
      filter: blur(50px);
      -webkit-filter: blur(50px);
      opacity: 0.6;
      background-image: linear-gradient(to top, #000, #fff);
      mask-image: linear-gradient(to bottom,
      #fff 0,
      #fff 15%,
      #fff 25%,
      rgba(255, 255, 255, 0.25) 75%,
      rgba(255, 255, 255, 0.1) 90%,
      rgba(255, 255, 255, 0) 100%);
      -webkit-mask-image: linear-gradient(to bottom,
      #fff 0,
      #fff 15%,
      #fff 25%,
      rgba(255, 255, 255, 0.25) 75%,
      rgba(255, 255, 255, 0.1) 90%,
      rgba(255, 255, 255, 0) 100%);
    }
    .main {
      position: relative;
      z-index: 2;
      max-width: @main-width;
      margin: auto;
      padding-bottom: 50px;
      background: transparent;
      .shrink {
        position: fixed;
        left: 50%;
        top: 80px;
        z-index: 222;
        padding: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: rgba(0, 0, 0, 0.5);
        font-size: 22px;
        cursor: pointer;
        margin-left: 455px;
        border: 1px solid rgba(0, 0, 0, .05);
      }
      .main-top {
        display: flex;
        height: 445px;
        .left {
          position: relative;
          width: 55%;
          .track-line {
            position: absolute;
            left: 50%;
            top: -4px;
            margin-left: -22px;
            z-index: 1;
            width: 107px;
            height: 125px;
            filter: drop-shadow(0 4px 2px rgba(0, 0, 0, .5));
            transform-origin: 10px 0;
            transform: rotate(-5deg);
            transition: all .4s ease-out;
            &.paused {
              transform: rotate(-25deg);
            }
          }
          .avatar-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 310px;
            height: 310px;
            margin: 50px auto 40px;
            background: url("./../../assets/images/coverall.png") no-repeat;
            background-size: 100%;
            border-radius: 50%;
            border: 8px solid rgba(255, 255, 255, 0.2);
            animation: rotateAni 20s linear infinite;
            animation-play-state: paused;
            box-sizing: content-box;
            &.has-freq {
              border: 8px solid rgba(255, 255, 255, 0);;
              background: none;
              .song-avatar {
                margin-top: -6px;
              }
            }
            &.play {
              animation-play-state: running;
            }
            &.pause {
              animation-play-state: paused;
            }
            .song-avatar {
              display: block;
              width: 210px;
              height: 210px;
              border-radius: 50%;
              box-shadow: 0 0 0 8px rgba(0, 0, 0, .9);
            }
            .freq {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              z-index: -1;
            }
          }
          .actions {
            width: 360px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            /deep/ .ant-btn {
              background-color: rgba(243, 243, 243, 0.5);
              .anticon {
                font-size: 15px;
              }
            }
          }
        }
        .right {
          width: 50%;
          padding: 20px 40px 20px 20px;
          .name {
            font-size: 20px;
            display: flex;
            align-items: center;
            .label {
              padding: 1px 4px;
              border: 1px solid @primary-color;
              border-radius: 3px;
              font-size: 12px;
              color: @primary-color;
              margin-left: 4px;
            }
          }
          .info {
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .album,
            .singer {
              flex: 1;
              padding-right: 15px;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
            }
          }
          .lyric {
            position: relative;
            border-right: 1px solid rgba(0, 0, 0, .05);
            min-height: 330px;
            margin-right: 30px;
            .lyric-control {
              position: absolute;
              right: -35px;
              top: 0;
              color: rgba(255, 255, 255, .5);
              .backward, .forward {
                background: rgba(0, 0, 0, 0.2);;
                transform: rotate(90deg);
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 5px;
                font-size: 10px;
                cursor: pointer;
              }
            }
            .pushpin {
              position: absolute;
              right: -35px;
              bottom: 0;
              border-radius: 50%;
              line-height: 1;
              padding: 5px;
              font-size: 16px;
              background: rgba(0, 0, 0, 0.2);
              color: rgba(255, 255, 255, 0.7);
              cursor: pointer;
              &.active {
                background: #fff;
                color: #333;
                border: 1px solid #eee
              }
            }
          }
          .lyric-list {
            display: inline-block;
            vertical-align: top;
            width: 100%;
            height: 330px;
            overflow: auto;
            -webkit-mask-image: linear-gradient(to bottom,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.6) 15%,
            rgba(255, 255, 255, 1) 25%,
            rgba(255, 255, 255, 1) 75%,
            rgba(255, 255, 255, 0.6) 85%,
            rgba(255, 255, 255, 0) 100%);
            .lyric-wrapper {
              overflow: auto;
              .text {
                margin: 0;
                padding: 4px 0;
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
                  text-shadow: 1px 1px rgba(0, 0, 0, 0.2),
                  1px 2px rgba(0, 0, 0, 0.1);
                }
              }
            }
          }

          .value {
            color: #215eb9;
          }
        }
      }
      .main-bottom {
        display: flex;
        margin-top: 30px;
        padding: 0 40px;
        .left {
          flex: 1;
        }
        .right {
          flex: 0 0 25%;
          width: 25%;
          margin-left: 50px;
          .col {
            margin-bottom: 35px;
          }
          .title {
            line-height: 1;
            font-size: 18px;
            border-bottom: 1px solid #e6e6e6;
            margin-bottom: 10px;
            padding-bottom: 10px;
            margin-top: 8px;
          }
          .simi-song {
            display: flex;
            margin: 10px 0;
            cursor: pointer;
            .song-avatar {
              width: 40px;
              height: 40px;
              flex: 0 0 40px;
            }
            .song-info {
              flex: 1;
              margin-left: 10px;
              font-size: 12px;
              .song-name {
                color: #000;
                font-size: 13px;
              }
              .playcount {
                color: #999;
              }
            }
          }
          .related-user {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 10px 0;
            font-size: 13px;
            .user-info {
              flex: 1;
              display: flex;
              align-items: center;
              overflow: hidden;
              padding-right: 5px;
              .username {
                margin-left: 5px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
              img {
                width: 35px;
                height: 35px;
                border: 1px solid #f3f5f7;
                border-radius: 50%;
              }
            }
            .anticon {
              font-size: 18px;
            }
            .time {
              width: 100px;
              flex: 0 0 100px;
              color: #999;
              text-align: right;
            }
          }
        }
      }
    }
  }
</style>
