<template>
  <div class="tracks">
    <track-list :tracks="tracks" @dblclick="play" @download="download" />
  </div>
</template>

<script>
import { getSongUrl, getLyric } from '@/api/song'
// import TrackList from '@/components/Common/track-table'
import TrackList from '@/components/Common/track-list/index.js'
import Artists from '@/components/Common/artists'
export default {
  name: 'rank_id_songs',
  data () {
    return {
      songUrl: '',
      currentTime: 0,
      buffered: 0
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
  methods: {
    async play (tracks, index) {
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
