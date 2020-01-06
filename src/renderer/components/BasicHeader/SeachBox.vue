<template>
  <div>
    <a-popover
      trigger="focus"
      placement="bottomLeft"
      overlayClassName="search-wrapper"
      :overlayStyle="overlayStyle"
      v-model="searchVisible"
    >
      <a-input-search
        placeholder="搜索音乐、视频、歌词、电台..."
        v-model="keyword"
        class="header-search"
        @search="onSearch"
      />
      <template slot="content">

        <div class="search-result" v-if="keyword && suggests">
          <dl v-for="(suggest, key) in suggests" :key="key">
            <dt>{{searchMap[key]}}</dt>
            <dd v-for="(item, index) in suggest" :key="index" @click="suggestClick(suggest,item,key)">
              <span v-if="key !== 'orders'">{{item.name}}</span>
            </dd>
          </dl>
        </div>

        <div class="search-content" v-else>
          <dl>
            <dt>
              热门搜索
            </dt>
            <dd
              v-for="(hot, index) in hots"
              :key="index"
              @click="setKeyword(hot.first)"
            >{{hot.first}}</dd>
          </dl>
          <dl>
            <dt class="space-between">
              <span>搜索历史</span>
              <a-icon type="delete" @click="clearHistory"/>
            </dt>
            <template v-if="searchHistory.length">
              <dd v-for="(item, index) in searchHistory" :key="index" class="space-between" @click="setKeyword(item)">
                <span>{{item}}</span>
                <a-icon type="close" @click="deleteHistory(index)"/>
              </dd>
            </template>
            <dd v-else>无</dd>
          </dl>
        </div>

      </template>
    </a-popover>
  </div>
</template>

<script>
import { getSearchHot, getSearchSuggest } from '@/api/search'
import { debounce } from '@/utils/dom'
import { normalSong } from '@/utils/song'
import { mapGetters } from 'vuex'
import playMixin from '@/mixins/Play.js'

export default {
  mixins: [
    playMixin
  ],
  data () {
    let keyword = this.$route.query.keyword || ''
    return {
      searchVisible: false,
      keyword: keyword,
      suggests: null,
      searchMap: {
        albums: '专辑',
        artists: '歌手',
        songs: '单曲',
        playlists: '歌单',
        mvs: 'MV',
        videos: '视频'
      },
      hots: []
    }
  },
  computed: {
    ...mapGetters('Search', ['searchHistory']),
    ...mapGetters('play', ['current_song']),
    overlayStyle () {
      return this.keyword && this.suggests
        ? { width: '200px', top: '50px' }
        : { width: '440px', top: '50px' }
    }
  },
  created () {
    this.$watch(
      'keyword',
      debounce(newQuery => {
        this.search(newQuery)
      }, 500)
    )
  },
  watch: {
    searchVisible (newVal) {
      if (this.keyword === '') {
        this.suggests = null
      } else {
        if (newVal) {
          this.search(this.keyword)
        }
      }
      if (newVal && !this.hots.length) {
        getSearchHot().then(res => {
          this.hots = res.result.hots
        })
      }
    }
  },
  methods: {
    onChange (e) {
      this.keyword = e.target.value
    },
    async search (newQuery) {
      if (newQuery === '') {
        this.suggests = null
        return
      }
      let { result } = await getSearchSuggest(newQuery)
      this.suggests = result
    },
    setKeyword (keyword) {
      this.keyword = keyword
      this.$router.push({ path: '/search', query: { keyword } })
    },
    onSearch (keyword, event) {
      if (!this.keyword) return
      event.preventDefault()
      console.log('onSearch')
      this.$router.push({ path: '/search', query: { keyword } })
    },
    deleteHistory (index) {
      this.$store.dispatch('Search/deleteKeyword', index)
    },
    clearHistory () {
      this.$store.dispatch('Search/clearKeyword')
    },
    suggestClick (suggest, item, key) {
      let path = ''
      switch (key) {
        case 'albums':
          path = `/album/${item.id}`
          this.$router.push({ path })
          break
        case 'artists':
          path = `/artist/${item.id}`
          this.$router.push({ path })
          break
        case 'playlists':
          path = `/playlist/${item.id}`
          this.$router.push({ path })
          break
        default:
          let tracks = []
          suggest.forEach(song => {
            tracks.push(normalSong(song))
          })
          console.log(item)
          let song = normalSong(item)
          // this.play(tracks, 0)
          if (song.id === this.current_song.id) return
          this.$store.dispatch('play/appendPlay', song)
          break
      }
    }
  }
}
</script>

<style lang="less" scoped>
.header-search {
  /deep/ .ant-input {
    height: 24px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.6);
    border: none;
    box-shadow: none;
    font-size: 12px;
  }
  /deep/ .ant-input-search-icon {
    color: rgba(255, 255, 255, 0.6) !important;
  }
}
.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-result {
  dd {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    a {
      color: #333;
    }
  }
}
</style>
