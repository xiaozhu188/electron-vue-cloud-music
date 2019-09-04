<template>
  <div class="tracks">
    <track-list :tracks="tracks" @dblclick="play" @download="download" />
  </div>
</template>

<script>
import { getSongUrl, getLyric } from '@/api/song'
import TrackList from '@/components/Common/track-list/index.js'
import Artists from '@/components/Common/artists'
export default {
  name: 'playlist_id_tracks',
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
.virtual-list-item__cell {
  line-height: 32px;
}
.tracks {
  margin-top: -1px;
}
</style>
