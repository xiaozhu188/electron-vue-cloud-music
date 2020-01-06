<template>
  <div>
    <loading v-show="loading" />
    <a-list class="intro">
      <a-list-item v-if="playlist">
        <a-list-item-meta>
          <div slot="title">
            <h1>{{playlist.name}}</h1>
          </div>
          <div slot="description">
            <div class="creator">
              <img  class="creator-avatar" v-lazy="`${playlist.creator.avatarUrl}?param=32y32`" />
              <router-link :to="`/user?id=${playlist.creator.userId}`" class="name">{{playlist.creator.nickname}}</router-link>
              <span class="time">{{playlist.createTime | toDate}}创建</span>
            </div>
            <ul class="actions">
              <li class="item">
                <a-button-group size="small">
                  <a-button type="primary" icon="play-circle" @click="play">播放全部</a-button>
                  <a-button type="primary" icon="plus" title="添加所有到播放列表" @click="addToList" />
                </a-button-group>
              </li>
              <li class="item">
                <a-button size="small" icon="check" @click="subscribe(2, playlist)" v-if="isLiked">
                  已收藏({{playlist.subscribedCount}})
                </a-button>
                <a-button size="small" icon="folder-add" @click="subscribe(1, playlist)" v-else>
                  收藏({{playlist.subscribedCount}})
                </a-button>
              </li>
              <li class="item" @click="share">
                <a-button size="small" icon="share-alt">分享({{playlist.shareCount}})</a-button>
              </li>
              <li class="item">
                <a-button size="small" @click="downloadAll"><z-icon type="download"></z-icon> 下载全部</a-button>
              </li>
            </ul>
            <div class="tags">
              <span>标签：</span>
              <a-breadcrumb v-if="playlist.tags && playlist.tags.length">
                <a-breadcrumb-item v-for="(tag, tagIndex) in playlist.tags" :key="tagIndex">
                  <router-link :to="`/playlist?cat=${tag}`">{{tag}}</router-link>
                </a-breadcrumb-item>
              </a-breadcrumb>
              <span v-else>无</span>
            </div>
            <div class="desc">
              <span>简介：</span>
              <span v-html="playlist.description" v-if="playlist.description"></span>
              <span v-else>无</span>
            </div>
          </div>
          <img slot="avatar" width="200" height="200" v-lazy="`${playlist.coverImgUrl}?param=200y200`" :key="playlist.id" />
        </a-list-item-meta>
        <ul class="action">
          <li>
            <div>歌曲数</div>
            <strong>{{playlist.trackCount}}</strong>
          </li>
          <li>
            <div>播放数</div>
            <strong>{{playlist.playCount}}</strong>
          </li>
        </ul>
      </a-list-item>
    </a-list>

    <tab-bar @search="searchSongs" />
    <keep-alive>
      <router-view :tracks="songs"/>
    </keep-alive>
  </div>
</template>

<script>
import { getPlaylistDetail } from '@/api/playlist'
import TabBar from '@/components/Common/tabBar'
import Loading from '@/components/Common/loading'
import ZIcon from '@/components/ZIcon/index.vue'
import { normalSong } from '@/utils/song'
import { uniqueData } from '@/utils/assist'
import { mapGetters } from 'vuex'

export default {
  name: 'playlist_id',
  data () {
    return {
      playlist: null,
      tracks: [],
      loading: false,
      searchKey: ''
    }
  },
  components: {
    TabBar,
    Loading,
    ZIcon
  },
  activated () {
    this.getDetail(this.$route.params.id)
  },
  beforeRouteUpdate (to, from, next) {
    this.getDetail(to.params.id)
    next()
  },
  computed: {
    ...mapGetters('User', [
      'likedPlaylistIds'
    ]),
    ...mapGetters('play', [
      'current_play_list'
    ]),
    isLiked () {
      return this.likedPlaylistIds.includes(this.playlist.id)
    },
    songs () {
      return this.tracks.filter(track => {
        return track.name.includes(this.searchKey)
      })
    }
  },
  methods: {
    async getDetail (id) {
      try {
        this.loading = true
        let res = await getPlaylistDetail(id)
        this.playlist = res.playlist
        this.tracks = res.playlist.tracks.map(track => {
          return normalSong(track)
        })
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    searchSongs (value) {
      this.searchKey = value
    },
    subscribe (t, playlist) {
      this.$store.dispatch('User/subscribePlatlist', { t, playlist })
    },
    play () {
      this.$store.dispatch('play/selectPlay', { tracks: this.tracks, index: 0 })
    },
    addToList () {
      let current_play_list = this.current_play_list.slice()
      let list = current_play_list.concat(this.tracks)
      list = uniqueData(list)
      this.$store.commit('play/SET_CURRENT_PLAY_LIST', list)
    },
    share () {
      let url = `https://music.163.com/#/playlist?id=${this.$route.params.id}`
      let _shareUrl = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?'
      _shareUrl += 'url=' + url
      _shareUrl += '&showcount=' + 1 // 参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
      _shareUrl += '&desc=' + '♪我发现一个不错的歌单-' + (this.playlist.description || this.playlist.name)
      _shareUrl += '&summary=' + '分享摘要'
      _shareUrl += '&title=' + '♪我发现一个不错的歌单-' + this.playlist.name
      _shareUrl += '&site=' + 'https://music.163.com/'
      _shareUrl += '&pics=' + this.playlist.coverImgUrl
      this.$electron.remote.shell.openExternal(_shareUrl)
    },
    downloadAll () {
      this.tracks.forEach(song => {
        this.$set(song, 'isWaitting', true)
      })
      this.$store.dispatch('Download/adddownloadQueue', this.tracks)
    }
  }
}
</script>

<style scoped>
.intro >>> .ant-list-item {
  align-items: initial;
}

.intro >>> .ant-avatar {
  border-radius: 0;
}

.intro >>> .ant-list-item-content {
  position: absolute;
  right: 0;
  top: 0;
}
.intro >>> .ant-list-item-meta-title {
  padding-right: 120px;
  line-height: 1.1;
}
</style>
<style lang="less" scoped>
.intro {
  padding: 20px;
  .creator {
    display: flex;
    align-items: center;
    .creator-avatar {
      border-radius: 50%;
      margin-right: 5px;
    }
    .name {
      margin-right: 5px;
      color: #333;
    }
    .time {
      font-size: 13px;
    }
  }
  .actions {
    margin: 15px 0;
    .item {
      display: inline-block;
      margin-right: 10px;
    }
    button {
      font-size: 13px;
    }
  }
  .tags {
    display: flex;
    margin-bottom: 10px;
    font-size: 13px;
    a {
      font-size: 13px;
      color: #006fe3;
    }
  }
  .action {
    display: flex;
    text-align: right;
    font-size: 12px;
    li {
      padding: 0 10px;
      margin-top: 12px;
      &:not(:last-child) {
        border-right: 1px solid #ddd;
      }
    }
  }
}

.desc {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
