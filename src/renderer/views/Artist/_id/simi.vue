<template>
  <ul class="simi">
    <artist-item
      class="artist-item"
      v-for="(artist) in artists"
      :artist="artist"
      :key="artist.id"
    />
  </ul>
</template>

<script>
import artistItem from '@/components/Common/artist-item'
import { getArtistSimi } from '@/api/artist'
export default {
  name: 'artist_id_simi',
  data () {
    return {
      artists: []
    }
  },
  components: {
    artistItem
  },
  activated () {
    this._getArtistSimi()
  },
  methods: {
    async _getArtistSimi () {
      let { id } = this.$route.params
      let { artists } = await getArtistSimi({ id })
      this.artists = artists
    }
  }
}
</script>

<style lang="less" scoped>
.simi {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-gap: 15px;
  padding: 15px;
}
</style>
