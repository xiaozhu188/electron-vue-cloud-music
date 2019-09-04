<template>
  <div class="newSong">
    <song-item :bordered="true" :tracks="tracks" @onclick="play" />
  </div>
</template>

<script>
import SongItem from '@/components/Common/song-item'
import { normalSong } from '@/utils/song'

export default {
  data () {
    return {
      tracks: []
    }
  },
  props: {
    list: {
      type: Array,
      default () {
        return []
      }
    }
  },
  mounted () {
    this.list.forEach(item => {
      this.tracks.push(normalSong(item.song, '44y44'))
    })
  },
  components: { SongItem },
  methods: {
    play (tracks, index) {
      this.$store.dispatch('play/appendPlay', tracks[index])
    }
  }
}
</script>

<style lang="less" scoped>
.newSong {
  height: 290px;
}
</style>
