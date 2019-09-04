<template>
  <div>
    <ul class="list">
      <li v-for="album in data" :key="album.id" :lg="6" :xl="4">
        <album-item :album="album"/>
      </li>
    </ul>
    <infinite-loading @infinite="loadmore" />
  </div>
</template>

<script>
import AlbumItem from '@/components/Common/album-item'
import { getSubAlbum } from '@/api/sublist'
export default {
  data () {
    return {
      data: [],
      params: {
        limit: 20,
        offset: 0
      }
    }
  },
  components: {
    AlbumItem
  },
  methods: {
    async loadmore ($state) {
      try {
        let res = await getSubAlbum(this.params)
        if (res.data.length) {
          this.data.push(...res.data)
          $state.loaded()
        }
        if (res.hasMore) {
          this.params.offset += this.params.limit
        } else {
          $state.complete()
        }
      } catch (error) {
        $state.error()
      }
    }
  }
}
</script>

<style scoped>
.list {
  display: flex;
  flex-wrap: wrap;
}
</style>
