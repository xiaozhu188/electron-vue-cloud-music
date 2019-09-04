<template>
  <div class="tracks">
    <track-list :tracks="tracks" @dblclick="play" @download="download" />
    <!-- <infinite-loading forceUseInfiniteWrapper=".ant-layout-content" :identifier="infiniteId" @infinite="loadmore" /> -->
  </div>
</template>

<script>
import { getSongUrl, getLyric } from '@/api/song'
import { normalSong } from '@/utils/song'
import { getArtistSongs } from '@/api/artist'
import TrackList from '@/components/Common/track-list/index.js'
import Artists from '@/components/Common/artists'
import { setTimeout } from 'timers'
export default {
  name: 'artist_id_comment',
  data () {
    return {
      songUrl: '',
      currentTime: 0,
      buffered: 0,

      songs: [],
      limit: 10,
      offset: 10,
      infiniteId: +new Date()
    }
  },
  components: {
    TrackList,
    Artists
  },
  props: {
    tracks: {
      type: Array,
      default () {
        return []
      }
    }
  },
  // activated () {
  //   let { id } = this.$route.params
  //   this.offset = 50
  //   this.tracks = []
  //   this.$nextTick(() => {
  //     this.infiniteId++
  //   })
  // },
  methods: {
    async loadmore ($state) {
      let params = {
        id: this.$route.params.id,
        limit: this.limit,
        offset: this.offset
      }
      try {
        let { hotSongs, more } = await getArtistSongs(params)
        let tracks = []
        hotSongs.forEach(song => {
          tracks.push(normalSong(song))
        })
        this.songs.push(...tracks)
        this.$emit('loadmore', this.songs)
        $state.loaded()
        if (more) {
          this.offset += this.limit
        } else {
          $state.complete()
        }
      } catch (error) {
        $state.error()
      }
    },
    play (tracks, index) {
      this.$store.dispatch('play/selectPlay', { tracks, index })
    },
    download (song) {
      this.$store.dispatch('Download/download', song)
    }
  }
}
</script>

<style scoped>
.tracks {
  margin-top: -1px;
}
</style>
