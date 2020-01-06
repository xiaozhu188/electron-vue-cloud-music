<template>
  <div class="recommend-songs">
    <div class="intro">
      <div class="date">
        <div class="week">{{ getWeek() }}</div>
        <div class="day">{{ getDate() }}</div>
      </div>
      <div class="info">
        <div class="name">每日歌曲推荐</div>
        <div class="desc">根据您的音乐口味生成，每日6:00更新</div>
      </div>
    </div>
    <div class="tracks">
      <div class="tracks-top">
        <div class="item">
          <a-button-group>
            <a-button type="primary" icon="play-circle" @click="play(songs,0)">播放全部</a-button>
            <a-button type="primary" icon="plus" title="添加所有到播放列表" @click="addToList" />
          </a-button-group>
        </div>

        <div class="item">
          <a-button :disabled="!songs.length || loading" :icon="subIcon" @click="subscribe">收藏全部</a-button>
        </div>
      </div>
      <track-list :isShowHead="false" :tracks="songs" @dblclick="play" @download="download" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getRecommendSongs, createPlaylist, addSongToList } from '@/api/user'
import { normalSong } from '@/utils/song'
import TrackList from '@/components/Common/track-list/index.js'
import { uniqueData } from '@/utils/assist'
export default {
  name: 'daily',
  data () {
    return {
      songs: [],
      loading: false,
      pid: ''
    }
  },
  computed: {
    ...mapGetters('play', [
      'mode',
      'current_song_index',
      'current_play_list',
      'playing',
      'current_song',
      'history_play_list',
      'fullscreen',
      'current_lyric'
    ]),
    ...mapGetters('User', [
      'userPlaylists', 'likedsongIds'
    ]),
    subIcon () {
      return this.likedsongIds.includes(this.pid) ? 'check' : 'folder-add'
    }
  },
  components: {
    TrackList
  },
  activated () {
    if (!this.songs.length) {
      this.getSongs()
    }
  },
  methods: {
    getSongs () {
      getRecommendSongs().then(res => {
        this.songs = res.recommend.map(song => {
          return normalSong(song)
        })
      })
    },
    async subscribe (op, tracks, pid) {
      try {
        this.loading = true
        const date = new Date()
        const name = `每日歌曲推荐(${date.getFullYear()}.${this._pad(date.getMonth() + 1)}.${this._pad(date.getDate())})`
        let { code, playlist } = await createPlaylist({ name })
        if (code) {
          let op = 'add'
          let pid = playlist.id
          let tracks = this.songs.map(song => {
            return song.id
          })
          let res = await addSongToList({ op, tracks: tracks.join(','), pid })
          console.log(res)
          this.pid = pid
          this.$message.success('收藏成功')
          this.$store.dispatch('User/getUserPlaylists')
          // let userPlaylists = this.userPlaylists.slice()
          // userPlaylists.push(playlist)
          // this.$store.commit('User/SET_USER_PLAYLISTS', userPlaylists)
        }
        this.loading = false
      } catch (error) {
        console.log(error)
        this.loading = false
        this.$message.error('收藏失败')
      }
      // createPlaylist()
    },
    _pad (num) {
      return num < 10 ? '0' + num : num
    },
    play (tracks, index) {
      this.$store.dispatch('play/selectPlay', { tracks, index })
    },
    addToList () {
      let current_play_list = this.current_play_list.slice()
      let list = current_play_list.concat(this.songs)
      list = uniqueData(list)
      this.$store.commit('play/SET_CURRENT_PLAY_LIST', list)
    },
    download (song) {
      this.$store.dispatch('Download/download', song)
    },
    getWeek () {
      return '星期' + '日一二三四五六'.charAt(new Date().getDay())
    },
    getDate () {
      return new Date().getDate()
    }
  }
}
</script>

<style lang="less" scoped>
.recommend-songs {
  padding: 30px;
  .intro {
    display: flex;
    margin-bottom: 10px;
    .date {
      width: 110px;
      height: 110px;
      flex: 0 0 110px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 1px solid #eee;
      background: #fff;
      line-height: 1;
      .week {
        font-size: 16px;
      }
      .day {
        font-size: 60px;
        color: @primary-color;
      }
    }
    .info {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-left: 15px;
      .name {
        margin: 10px 0;
        font-family: "Microsoft JhengHei", "明黑", Arial, Helvetica;
        font-size: 28px;
      }
    }
  }
  .tracks {
    border: 1px solid #ececec;
    .tracks-top {
      display: flex;
      justify-content: space-between;
      padding: 10px;
    }
  }
}
</style>
