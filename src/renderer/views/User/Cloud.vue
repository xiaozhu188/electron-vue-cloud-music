<template>
  <div>
    <!-- <debounce-btn @click="handleClick">
      debounce
    </debounce-btn> -->
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
import semver from 'semver'
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
    console.log(semver.gt('1.0.7', '1.0.6'), semver.diff('1.1.7', '1.0.6'))
  },
  methods: {
    handleClick () {
      console.log('handleClick')
    },
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
