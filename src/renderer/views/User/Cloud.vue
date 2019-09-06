<template>
  <div>
    <track-list :tracks="tracks" @dblclick="play" @download="download" />
  </div>
</template>

<script>
import TrackList from '@/components/Common/track-list'
import DebounceBtn from '@/components/Common/debounce-btn'
import { getUserCloud } from '@/api/user'
import { normalSong } from '@/utils/song'
import { mapGetters } from 'vuex'
import playMixin from '@/mixins/Play.js'
export default {
  name: 'cloud',
  mixins: [
    playMixin
  ],
  data () {
    return {
      tracks: []
    }
  },
  components: {
    TrackList, DebounceBtn
  },
  computed: {
    ...mapGetters('User', ['userId'])
  },
  activated () {
    this._getUserCloud()
  },
  methods: {
    _getUserCloud () {
      getUserCloud(this.userId).then(res => {
        let arr = []
        res.data.forEach(song => {
          arr.push(normalSong(song.simpleSong))
        })
        this.tracks = arr
      })
    }
  }
}
</script>

<style scoped></style>
