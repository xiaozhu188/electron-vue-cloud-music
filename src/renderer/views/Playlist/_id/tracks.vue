<template>
  <div class="tracks">
    <track-list :tracks="tracks" @dblclick="play" @download="download" />
  </div>
</template>

<script>
import TrackList from '@/components/Common/track-list/index.js'
import playMixin from '@/mixins/Play'
export default {
  name: 'playlist_id_tracks',
  mixins: [
    playMixin
  ],
  components: {
    TrackList
  },
  props: {
    tracks: {
      type: Array,
      default () {
        return []
      }
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
