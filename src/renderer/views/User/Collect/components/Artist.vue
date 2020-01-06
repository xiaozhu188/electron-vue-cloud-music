<template>
  <div class="artists">
    <a-row type="flex" align="middle" v-for="artist in data" :key="artist.id" class="artist-item" @click.native="onClick(artist)">
      <a-col :span="14">
        <img v-lazy="`${artist.picUrl}?param=40y40`" alt="" width="40">
        <router-link :to="`/artist/${artist.id}`"> {{artist.name}} </router-link>
      </a-col>
      <a-col :span="5">
        专辑: {{artist.albumSize}}
      </a-col>
      <a-col :span="5">
        MV: {{artist.mvSize}}
      </a-col>
    </a-row>
    <infinite-loading @infinite="loadmore" />
  </div>
</template>

<script>
import { getArtist } from '@/api/sublist'
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
  methods: {
    async loadmore ($state) {
      try {
        let res = await getArtist(this.params)
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
    },
    onClick (artist) {
      this.$router.push({ path: `/artist/${artist.id}/album` })
    }
  }
}
</script>

<style lang="less" scoped>
.artists {
  margin: -16px;
}
.artist-item {
  padding: 10px;
  &:nth-child(odd){
    background: #eee;
  }
  &:nth-child(even){
    background: #f3f5f7;
  }
  &:hover {
    background: #ddd;
  }
  a {
    color: #333;
  }
}
</style>
