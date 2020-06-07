<template>
  <div class="player">
    <div class="bar1" :class="disableCls">
      <a-icon type="step-backward" class="step-icon" @click="backward"/>
      <a-icon :type="playIcon" theme="filled" class="play-icon" @click="togglePlay"/>
      <a-icon type="step-forward" class="step-icon" @click="forward"/>
    </div>
    <div class="bar2">
      <time class="time">{{currentTime | duration}}</time>
      <progress-bar
        :percent="percent"
        :bufferedPercent="bufferedPercent"
        :waiting="waiting"
        @percentChanged="onpercentChanged"
        @percentChanging="onpercentChanged"
        @virtualBarMove="onVirtualBarMove"
        @virtualBarLeave="onVirtualBarLeave"
      />
      <time class="time">{{current_song.duration | duration}}</time>
    </div>
    <div class="bar3">
      <z-icon :type="mutedIcon" @click.native="onMuted" title="静音" style="cursor: pointer;" />
      <progress-bar :percent="0.5" size="small" @percentChanged="onvolumeChanged" class="bar-volume"/>
      <audio
        crossOrigin="anonymous"
        :id="source"
        ref="audio"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnd"
        @timeupdate="updateTime"
        @waiting="onWaiting"
        @playing="onPlaying"
        @error="onError"
      />
    </div>
    <div class="bar4">
      <z-icon type="tubiao" @click.native="showMusicView"/>
      <a-tooltip :title="modeText">
        <span @click="changeMode">
          <z-icon :type="modeIcon" />
        </span>
      </a-tooltip>
      <z-icon type="geci" class="lrc" :class="{'active' : showDesktoplyric}" @click.native="toggleCurrentLyric"/>
      <span class="count-wrapper" @click="showDrawer">
        <z-icon type="yinleliebiaokuai" />
        <span class="count">{{ current_play_list.length }}</span>
      </span>
    </div>

    <span class="resize"></span>

    <a-drawer placement="right" wrapClassName="play-history" :width="550" :closable="false" :visible="visible" @close="closeDrawer">
      <div class="play-history-title" slot="title">
        <a-radio-group v-model="playComponent" buttonStyle="solid">
          <a-radio-button value="current-play-table">播放列表</a-radio-button>
          <a-radio-button value="history-play-table">历史记录</a-radio-button>
        </a-radio-group>
      </div>
      <component :is="playComponent"></component>
    </a-drawer>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from '@/config/config'
import { getUrl } from '@/utils/song'
import { getLyric } from '@/api/song'
import Lyric from '@/utils/class/Lyric.js'
import { shuffle } from '@/utils/calculate.js'
import ProgressBar from '@/components/Common/progressBar'
import TrackList from '@/components/Common/track-list/index.js'
import ZIcon from '@/components/ZIcon'
import Drag from '@/components/Common/drag'
import CurrentPlayTable from './CurrentPlayTable'
import HistoryPlayTable from './HistoryPlayTable'

export default {
  name: 'player',
  data () {
    return {
      currentTime: 0,
      visible: false,
      lyricInstance: null,
      buffered: 0,
      playComponent: 'current-play-table',
      autoplay: false,
      isSongReady: false,
      waiting: false
    }
  },
  components: {
    ProgressBar,
    Drag,
    ZIcon,
    TrackList,
    HistoryPlayTable,
    CurrentPlayTable
  },
  computed: {
    ...mapState(['play']),
    ...mapGetters('play', [
      'mode',
      'original_play_list',
      'current_song_index',
      'current_play_list',
      'playing',
      'current_song',
      'history_play_list',
      'fullscreen',
      'current_lyric',
      'lyric',
      'source',
      'volume',
      'isMuted',
      'showDesktoplyric'
    ]),
    ...mapGetters('App', ['isOnliline']),
    playIcon () {
      return this.playing ? 'pause-circle' : 'play-circle'
    },
    mutedIcon () {
      return this.isMuted ? 'muted' : 'no-muted'
    },
    modeIcon () {
      return this.mode === playMode.sequence
        ? 'liebiaoxunhuan'
        : this.mode === playMode.loop
          ? 'danquxunhuan1'
          : this.mode === playMode.random
            ? 'suijibofang'
            : 'FMcollect'
    },
    modeText () {
      return this.mode === playMode.sequence
        ? '顺序播放'
        : this.mode === playMode.loop
          ? '循环播放'
          : this.mode === playMode.random
            ? '随机播放'
            : '心动模式'
    },
    percent () {
      return this.currentTime / this.current_song.duration
    },
    bufferedPercent () {
      return this.buffered / this.current_song.duration
    },
    disableCls () {
      return this.isSongReady ? '' : 'disable'
    }
  },
  watch: {
    playing (newVal, oldVal) {
      const audio = this.$refs.audio

      // 通知主进程,同步任务栏控制按钮的状态
      this.$electron.ipcRenderer.send('thumbar-buttons', {
        playing: newVal
      })

      if (newVal) {
        this.$nextTick(() => {
          audio.play()
        })
        if (!this.lyricInstance) {
          if (this.current_song.folder) {
            this.getLocalLyric(this.current_song.name)
          } else {
            this.getOnlineLyric(this.current_song.id)
          }
        }
        this.lyricInstance && this.lyricInstance.play()
      } else {
        audio.pause()
        this.lyricInstance && this.lyricInstance.stop()
      }
    },
    volume (newVal) {
      const audio = this.$refs.audio
      newVal = Number(newVal)
      if (newVal == 0) {
        this.$store.commit('play/SET_MUTED', true)
      }
      this.$nextTick(() => {
        audio.volume = newVal
      })
    },
    isMuted (newVal) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        if (newVal) {
          audio.volume = 0
        } else {
          audio.volume = this.volume
        }
      })
    },
    current_song: 'handleSongChange'
  },
  mounted () {
    this.$electron.ipcRenderer.on('toggle-play', (e, data) => {
      this.$store.commit('play/SET_PLAY_STATUS', data.value)
      this.lyricInstance && this.lyricInstance.togglePlay()
    })
    this.$electron.ipcRenderer.on('play-song', (e, data) => {
      console.log(data.value)
      this.$store.dispatch('play/selectPlay', data.value)
    })
    this.$electron.ipcRenderer.on('prev-play', (e, data) => {
      this.backward()
    })
    this.$electron.ipcRenderer.on('next-play', (e, data) => {
      this.forward()
    })
    if (Object.keys(this.current_song).length) {
      this.isSongReady = true
      if (this.current_song.folder && this.current_song.url) {
        this.$refs.audio.src = this.current_song.url
      } else {
        if (!this.isOnliline) return
        this.getOnlineSong(this.current_song).then(songUrl => {
          if (songUrl) {
            this.$store.commit('play/SET_SOURCE', songUrl)
            this.$refs.audio.src = songUrl
          } else {
            this.$message.error('暂无资源')
            this.$store.commit('play/SET_SOURCE', '')
            this.$store.commit('play/SET_PLAY_STATUS', false)
            this.isSongReady = true
            this.lyricInstance && this.resetLyric()
          }
        }).catch(error => {
          console.log(`获取歌曲播放链接失败:${error}`)
          this.isSongReady = true
        })
      }
    }
  },
  methods: {
    async handleSongChange (newSong, oldSong) {
      if (!newSong.id || (oldSong && (newSong.id === oldSong.id))) return
      this.isSongReady = false
      if (newSong.folder) { // 如果是本地歌曲
        this.$store.commit('play/SET_SOURCE', newSong.url)
        this.$refs.audio.src = newSong.url
        this.$refs.audio.play()
        this.getLocalLyric(newSong.name)
      } else {
        this.waiting = true
        this.$refs.audio.pause()
        this.getOnlineSong(newSong).then(songUrl => {
          if (songUrl) {
            this.$store.commit('play/SET_SOURCE', songUrl)
            this.$refs.audio.src = songUrl
            this.$refs.audio.play()
            this.getOnlineLyric(newSong.id)
          } else {
            this.$message.error('暂无资源')
            this.$store.commit('play/SET_SOURCE', '')
            this.$store.commit('play/SET_PLAY_STATUS', false)
            this.isSongReady = true
            this.lyricInstance && this.resetLyric()
          }
        }).catch(error => {
          console.log(`获取歌曲播放链接失败:${error}`)
          this.isSongReady = true
        }).finally(() => {
          this.waiting = true
        })
      }
    },
    getOnlineSong (song) {
      return new Promise(async (resolve, reject) => {
        try {
          let songUrl = await getUrl(song.id)
          resolve(songUrl)
        } catch (error) {
          reject(error)
        }
      })
    },
    // 根据歌名搜索歌词,后期根据检索的本地记录与下载记录匹配出id进行查询
    getLocalLyric (songName) {
      this.$db.lyric.findOne({ name: songName }, (err, doc) => {
        if (!err) {
          console.log('localLyric', doc)
          let lyric = ''
          if (!doc) {
            // this.$store.commit('play/SET_LYRIC', null)
            // this.$store.commit('play/SET_CURRENT_LYRIC', null)
            // this.$store.commit('play/SET_CURRENT_LYRIC_LINE', 0)
            // this.lyricInstance && this.resetLyric()
            // return
            lyric = '[00:00.000] 无歌词'
          } else {
            lyric = doc.lyric
          }

          this.lyricInstance && this.resetLyric()
          this.getLyricInstance(lyric)
          if (this.playing) {
            this.lyricInstance.play()
          }
          this.lyricInstance.seek(this.currentTime * 1000)
        }
      })
    },
    async getOnlineLyric (id) {
      try {
        let res = await getLyric(id)
        let lyric = ''
        if (res.nolyric) {
          lyric = '[00:00.000] 暂无歌词'
        } else {
          lyric = (res.lrc && res.lrc.lyric) || '[00:00.000] 纯音乐'
        }
        this.lyricInstance && this.resetLyric()
        this.getLyricInstance(lyric)
        if (this.playing) {
          this.lyricInstance.play()
        }
        this.lyricInstance.seek(this.currentTime * 1000)
      } catch (e) {
        this.lyricInstance = null
        this.$store.commit('play/SET_LYRIC', null)
        this.$store.commit('play/SET_CURRENT_LYRIC', null)
        this.$store.commit('play/SET_CURRENT_LYRIC_LINE', 0)
      }
    },
    handleLyric ({ lineNum, txt }) {
      this.$store.commit('play/SET_CURRENT_LYRIC_LINE', lineNum)
      this.$store.commit('play/SET_CURRENT_LYRIC', txt)
    },
    getLyricInstance (lyric) {
      this.lyricInstance = new Lyric(lyric, this.handleLyric)
      this.$store.commit('play/SET_LYRIC', this.lyricInstance)
      this.$store.commit('play/SET_CURRENT_LYRIC', this.lyricInstance.lines[0].txt || null)
    },
    resetLyric () {
      this.lyricInstance.stop()
      this.lyricInstance = null
      this.currentTime = 0
      this.$store.commit('play/SET_LYRIC', null)
      this.$store.commit('play/SET_CURRENT_LYRIC', null)
      this.$store.commit('play/SET_CURRENT_LYRIC_LINE', 0)
    },
    closeDrawer () {
      this.visible = false
    },
    updateTime (e) {
      const audio = this.$refs.audio
      this.currentTime = e.target.currentTime
      const timeRanges = audio.buffered
      if (timeRanges.length != 0) {
        this.buffered = timeRanges.end(timeRanges.length - 1)
      }
    },
    onPlay () {
      this.isSongReady = true
      this.$store.commit('play/SET_PLAY_STATUS', true)
      // 设置底部缩略图标题
      let artistStr = this.current_song.artist.length ? this.current_song.artist.map(item => item.name).join(',') : ''
      document.title = `${this.current_song.name} - ${artistStr}`
      // 歌词位置同步
      if (this.lyricInstance) {
        this.lyricInstance.seek(this.currentTime * 1000)
      }
      // 添加本地播放历史
      this.$store.dispatch('play/addHistorySong', this.current_song)
      // 如果设置静音将音频音量设置为0
      const audio = this.$refs.audio
      this.$nextTick(() => {
        if (this.isMuted) {
          audio.volume = 0
        } else {
          audio.volume = this.volume
        }
      })
    },
    onPause () {
      this.$store.commit('play/SET_PLAY_STATUS', false)
    },
    onEnd () {
      this.currentTime = 0
      this.buffered = 0
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.forward()
      }
    },
    onWaiting () {
      this.waiting = true
      // 播放期间如果卡住暂定歌词的滚动
      if (this.lyricInstance) {
        this.lyricInstance.stop()
      }
    },
    onPlaying () {
      this.waiting = false
      if (this.lyricInstance) {
        const currentTime = this.$refs.audio.currentTime
        this.lyricInstance.seek(currentTime * 1000)
      }
    },
    onError () {
      this.isSongReady = true
      this.waiting = false
    },
    onMuted () {
      this.$store.commit('play/SET_MUTED', !this.isMuted)
    },
    changeMode () {
      let mode = this.mode
      mode = ++mode % (Object.keys(playMode).length - 1)
      this.$store.commit('play/SET_MODE', mode)
      let list = []
      if (mode === playMode.random) {
        list = shuffle(this.original_play_list)
      } else {
        list = this.original_play_list
      }
      this.resetCurrentIndex(list)
      this.$store.commit('play/SET_CURRENT_PLAY_LIST', list)
    },
    resetCurrentIndex (list) {
      let index = list.findIndex(item => {
        return item.id === this.current_song.id
      })
      this.$store.commit('play/SET_CURRENT_INDEX', index)
    },
    getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min) // min,max之间的随机数（包含min,max）
    },
    loop () {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.lyricInstance) {
        this.$store.commit('play/SET_CURRENT_LYRIC', this.lyricInstance.lines[0].txt || null)
      }
    },
    forward () {
      if (!this.isSongReady) {
        return
      }
      let list_len = this.current_play_list.length
      let { current_song_index } = this
      current_song_index++
      if (current_song_index > list_len - 1) {
        current_song_index = 0
      }
      this.$store.commit('play/SET_CURRENT_INDEX', current_song_index)
      // if (!this.playing) {
      //   this.$store.commit('play/SET_PLAY_STATUS', true)
      // }
    },
    backward () {
      if (!this.isSongReady) {
        return
      }
      let list_len = this.current_play_list.length
      let { current_song_index } = this
      if (this.mode === playMode.random) {
        current_song_index = this.getRandomInt(0, list_len - 1)
      } else {
        current_song_index--
        if (current_song_index < 0) current_song_index = list_len - 1
      }
      this.$store.commit('play/SET_CURRENT_INDEX', current_song_index)
      // if (!this.playing) {
      //   this.$store.commit('play/SET_PLAY_STATUS', true)
      // }
    },
    togglePlay () {
      if (!this.isSongReady) {
        return
      }
      this.$store.commit('play/SET_PLAY_STATUS', !this.playing)
    },
    onpercentChanged (percent) {
      if (!this.isSongReady) {
        return
      }
      this.currentTime = this.$refs.audio.currentTime = this.current_song.duration * percent
      if (!this.playing) {
        this.lyricInstance && this.lyricInstance.stop()
      } else {
        this.lyricInstance && this.lyricInstance.seek(this.currentTime * 1000)
      }
    },
    onvolumeChanged (persent) {
      if (persent < 0) persent = 0
      if (persent > 1) persent = 1
      this.$store.commit('play/SET_VOLUME', Number(persent))
    },
    onVirtualBarMove ({ pageX, percent }) {
      if (!this.lyricInstance) return
      if (!document.getElementById('progress-lyric')) {
        let div = document.createElement('div')
        div.setAttribute('id', 'progress-lyric')
        document.body.appendChild(div)
      }
      let targetTime = this.current_song.duration * percent
      let current_lyric = this.lyricInstance.findLyricByTime(targetTime * 1000) || ''
      const dom = document.getElementById('progress-lyric')
      dom.style.left = `${pageX}px`
      if (dom.style.display == 'none') {
        dom.style.display = 'block'
      }
      if (current_lyric) {
        dom.innerText = `词: ${current_lyric.txt}`
      }
    },
    onVirtualBarLeave () {
      const dom = document.getElementById('progress-lyric')
      if (dom) {
        dom.style.display = 'none'
      }
    },
    showDrawer () {
      this.visible = !this.visible
    },
    toggleCurrentLyric () {
      let flag = !this.showDesktoplyric
      this.$electron.ipcRenderer.send('toggle-desktop-lyric', flag)
      this.$store.commit('play/SET_SHOW_DESKTOP_LYRIC', flag)
    },
    showMusicView () {
      this.$store.commit('App/SHOW_VIEW', true)
    }
  }
}
</script>

<style lang="less">
  .play-history {
    /deep/ .ant-drawer-header {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      background: #f3f5f7;
      z-index: 10;
    }
    .play-history-title {
      display: flex;
      justify-content: center;
      /deep/ .ant-radio-button-wrapper {
        height: 28px;
        line-height: 26px;
      }
    }
    .ant-drawer-body {
      padding: 60px 0 0;
    }
  }
</style>
<style lang="less" scoped>
.player {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  .resize {
    position: absolute;
    right: 2px;
    bottom: 2px;
    display: inline-block;
    width: 12px;
    height: 12px;
    opacity: .75;
    background: linear-gradient(to left top, #333, #333 1px, transparent 1px, transparent 3px, #333 3px, #333 4px, transparent 4px, transparent 6px, #333 6px, #333 7px, transparent 7px);
  }
  .bar1 {
    flex: 0 0 200px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    &.disable {
      .play-icon, .step-icon {
        opacity: .5;
      }
    }
    .play-icon {
      color: @primary-color;
      font-size: 37px;
      cursor: pointer;
    }
    .step-icon {
      padding: 7px;
      border-radius: 50%;
      background: @primary-color;
      color: #fff;
      font-size: 17px;
      cursor: pointer;
    }
  }
  .bar2 {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .time {
      width: 80px;
      flex: 0 0 80px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      text-align: center;
    }
  }
  .bar3,
  .bar4 {
    padding: 0 10px;
    .anticon {
      font-size: 18px;
      cursor: pointer;
      &.lrc {
        &.active {
          color: @primary-color;
        }
      }
    }
  }
  .bar3 {
    display: flex;
    align-items: center;
    flex: 0 0 150px;
  }
  .bar4 {
    flex: 0 0 180px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    .count-wrapper {
      line-height: 1;
      cursor: pointer;
      .count {
        font-size: 11px;
      }
    }
  }
}

.bar-volume {
  margin-left: 4px;
  /deep/ .progress {
    background: @primary-color;
  }
  /deep/ .progress-btn-wrapper {
    display: none;
  }
  &:hover {
    /deep/ .progress-btn-wrapper {
      display: block;
    }
  }
}
</style>
