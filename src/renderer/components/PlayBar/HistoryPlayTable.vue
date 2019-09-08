<template>
  <div class="play-table">
    <track-list :isShowHead="false" :isShowActions="false" :tracks="history_play_list" @dblclick="play" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TrackList from '@/components/Common/track-list/index.js'
export default {
  components: { TrackList },
  computed: {
    ...mapGetters('play', [
      'history_play_list'
    ])
  },
  methods: {
    play (tracks, index) {
      this.$store.dispatch('play/selectPlay', { tracks, index })
    }
  }
}
</script>
