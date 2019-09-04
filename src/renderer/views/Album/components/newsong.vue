<template>
  <div class="newsong">
    <div class="cates">
      <a href="#" v-for="(val, key) in cateMap" :key="key" class="item" :class="{'current': key == songType}" @click="songType = key">{{ val }}</a>
    </div>
    <div class="tracks">
      <div class="tracks-top">
        <div class="item">
          <a-button-group>
            <a-button type="primary" icon="play-circle" @click="play(songs,0)">播放全部</a-button>
            <a-button type="primary" icon="plus" title="添加所有到播放列表" @click="addToList" />
          </a-button-group>
        </div>
      </div>
      <div class="tracks-body">
        <track-list :tracks="songs" :isShowHead="false" :isShowActions="false" @dblclick="play" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import albumItem from '@/components/Common/album-item'
import TrackList from '@/components/Common/track-list/index.js'
import { normalSong } from '@/utils/song'
import { getTopSong } from '@/api/song'
import { uniqueData } from '@/utils/assist'
export default {
  data () {
    return {
      songs: [],
      loading: false,
      songType: 0,
      cateMap: {
        0: '全部',
        7: '华语',
        96: '欧美',
        8: '日本',
        16: '韩国'
      }
    }
  },
  components: {
    albumItem,
    TrackList
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
    ...mapGetters('User', ['userPlaylists', 'likedsongIds']),
    subIcon () {
      return this.likedsongIds.includes(this.pid) ? 'folder-add' : 'check'
    }
  },
  created () {
    this.getData(this.songType)
  },
  watch: {
    songType (newVal) {
      this.getData(newVal)
    }
  },
  methods: {
    async getData (songType) {
      try {
        let { data } = await getTopSong(songType)
        let songs = []
        data.forEach(song => {
          songs.push(normalSong(song))
        })
        this.songs = songs
      } catch (error) {}
    },
    play (tracks, index) {
      this.$store.dispatch('play/selectPlay', { tracks, index })
    },
    addToList () {
      let current_play_list = this.current_play_list.slice()
      let list = current_play_list.concat(this.songs)
      list = uniqueData(list)
      this.$store.commit('play/SET_CURRENT_PLAY_LIST', list)
    }
  }
}
</script>

<style lang="less" scoped>
.newsong {
  .tracks {
    border: 1px solid #eee;
    &-top {
      display: flex;
      justify-content: space-between;
      padding: 10px;
    }
  }
  .cates {
    margin: 10px 0;
    .item {
      margin-right: 12px;
      color: #333;
      &.current {
        color: @primary-color;
      }
    }
  }
}
</style>
