<template>
  <div>
    <loading v-show="loading" />
    <a-list class="intro">
      <a-list-item v-if="dj">
        <a-list-item-meta>
          <div slot="title">
            <h1>{{dj.name}}</h1>
          </div>
          <div slot="description">
            <div class="creator">
              <a-avatar class="creator-avatar" :src="`${dj.dj.avatarUrl}?param=32y32`"/>
              <span class="name">{{dj.dj.nickname}}</span>
            </div>
            <ul class="actions">
              <li class="item">
                <a-button-group size="small">
                  <a-button type="primary" icon="play-circle" @click="play">播放全部</a-button>
                </a-button-group>
              </li>
              <li class="item">
                <a-button size="small" icon="check" @click="subscribe(2, dj)" v-if="dj.subed">
                  已订阅({{dj.subCount}})
                </a-button>
                <a-button size="small" icon="folder-add" @click="subscribe(1, dj)" v-else>
                  订阅({{dj.subCount}})
                </a-button>
              </li>
              <li class="item">
                <a-button size="small" icon="download">下载全部</a-button>
              </li>
            </ul>
            <div class="desc">
              <span>简介：</span>
              <span v-html="dj.desc" v-if="dj.desc"></span>
              <span v-else>无</span>
            </div>
            <div class="desc">
              <span>{{ dj.rcmdText }}</span>
            </div>
          </div>
          <img slot="avatar" width="200" height="200" v-lazy="`${dj.picUrl}?param=200y200`" :key="dj.id" />
        </a-list-item-meta>
      </a-list-item>
    </a-list>
    <tab-bar :tabs="tabs" />
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TabBar from '@/components/Common/tabBar'
import Loading from '@/components/Common/loading'
import { getDjDetail } from '@/api/dj'
import { normalSong } from '@/utils/song'
import { uniqueData } from '@/utils/assist'
export default {
  name: 'dj_id',
  data () {
    return {
      tabs: [
        {
          name: 'dj-id-programs',
          label: '节目'
        },
        {
          name: 'dj-id-sublist',
          label: '订阅者'
        }
      ],
      dj: null,
      loading: false
    }
  },
  computed: {
    ...mapGetters('play', [
      'current_play_list'
    ])
  },
  components: {
    TabBar, Loading
  },
  activated () {
    this._getDjDetail()
  },
  // beforeRouteUpdate (to, from, next) {
  //   this._getDjDetail(to.params.id)
  //   next()
  // },
  methods: {
    _getDjDetail () {
      this.loading = true
      let id = this.$route.params.id
      getDjDetail(id).then(res => {
        this.dj = res.djRadio
        this.loading = false
      })
    },
    searchSongs (value) {
      this.searchKey = value
    },
    play () {
      this.$store.dispatch('play/selectPlay', { tracks: this.tracks, index: 0 })
    },
    subscribe (t, dj) {
      this.$store.dispatch('User/subscribeDj', { t, dj })
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
}

.desc {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
