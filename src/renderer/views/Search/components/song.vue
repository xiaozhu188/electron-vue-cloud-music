<template>
  <div>
    <track-list :tracks="songs" @dblclick="play" @download="download"/>
    <slot :total="result.songCount"></slot>
  </div>
</template>

<script>
import { normalSong } from '@/utils/song'
import TrackList from '@/components/Common/track-list/index.js'
export default {
  data () {
    return {
      songs: []
    }
  },
  props: {
    result: {
      type: Object
    }
  },
  watch: {
    result (newVal) {
      if (newVal) {
        this.normalData()
      }
    }
  },
  mounted () {
    this.normalData()
  },
  methods: {
    normalData () {
      let arr = []
      if (this.result && this.result.songs) {
        this.result.songs.forEach(song => {
          arr.push(normalSong(song))
        })
      }
      this.songs = arr
    },
    play (tracks, index) {
      this.$store.dispatch('play/selectPlay', { tracks, index })
    },
    download (song) {
      this.$store.dispatch('Download/download', song)
    }
  },
  components: { TrackList }
}
</script>

<style scoped></style>
