<template>
  <div class="newsong">
    <div class="cates">
      <a href="#" v-for="(val, key) in cateMap" :key="key" class="item" :class="{'current': key == songType}"
         @click="changeType(key)">{{ val }}</a>
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
        <a-spin v-if="loading" />
        <track-list :columns="columns" :tracks="songs" :isShowHead="false" :isShowActions="false" @dblclick="play">
          <template slot="name" slot-scope="{ row }">
            <img v-lazy="`${row.avatar}?param=40y40`" class="avatar" />
            <span>{{ row.name }}</span>
          </template>
        </track-list>
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

const columns = [
  {
    title: '音乐标题',
    dataIndex: 'name',
    key: 'name',
    slot: 'name'
  },
  {
    title: '歌手',
    dataIndex: 'artist',
    key: 'artist'
  },
  {
    title: '专辑',
    dataIndex: 'album',
    key: 'album'
  },
  {
    title: '时长',
    dataIndex: 'duration',
    key: 'duration'
  }
]
export default {
  data () {
    return {
      columns,
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
    ...mapGetters('User', [ 'userPlaylists', 'likedsongIds' ]),
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
      this.loading = true
      try {
        let { data } = await getTopSong(songType)
        this.songs = data.map(song => {
          return normalSong(song, '40y40')
        })
        this.loading = false
      } catch ( error ) {
        this.loading = false
      }
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
    changeType (type) {
      this.songType = type
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

      &-body {
        position: relative;

        .avatar {
          width: 40px;
          height: 40px;
          margin-right: 4px;
        }

        /deep/ .song-item {
          padding: 5px 0;
        }

        /deep/ .ant-spin-spinning {
          position: absolute;
          left: 50%;
          top: 100px;
          transform: translateX(-50%);
          z-index: 1;
        }
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
