<template>
  <div>
    <ul class="albums">
      <album-item
        v-for="(album, index) in albums"
        :album="album"
        desc="artist"
        :key="`${album.id}_${index}`"
      />
    </ul>
    <infinite-loading forceUseInfiniteWrapper=".ant-layout-content" @infinite="loadmore" />
  </div>
</template>

<script>
import albumItem from '@/components/Common/album-item'
import { getTopAlbum } from '@/api/album'

export default {
  data () {
    return {
      albums: [],
      limit: 18,
      offset: 0
    }
  },
  components: {
    albumItem
  },
  methods: {
    async loadmore ($state) {
      let params = {
        limit: this.limit,
        offset: this.offset
      }
      try {
        let { albums, total } = await getTopAlbum(params)
        this.albums = this.albums.concat(albums)
        if ( this.albums.length < total ) {
          this.offset += this.limit
          $state.loaded()
        } else {
          $state.complete()
        }
      } catch ( error ) {
        $state.error()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import "./../../../styles/mixins";

  .albums {
    .grid-layout(20px, 141px);
    padding: 20px 0;
  }
</style>
