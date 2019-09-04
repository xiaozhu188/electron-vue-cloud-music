<template>
  <div class="search-album">
    <a-row
      type="flex"
      justify="space-around"
      align="middle"
      v-for="album in albums"
      :key="album.id"
    >
      <a-col :span="12">
        <router-link :to="`/album/${album.id}`" class="album">
          <img v-lazy="`${album.picUrl}?param=50y50`">
          <span>{{album.name}}</span>
        </router-link>
      </a-col>
      <a-col :span="12">
        <artists :artists="album.artists"/>
      </a-col>
    </a-row>
    <slot :total="result.albumCount"></slot>
  </div>
</template>

<script>
import Artists from '@/components/Common/artists'
export default {
  data () {
    return {
      albums: []
    }
  },
  props: {
    result: {
      type: Object
    }
  },
  components: {
    Artists
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
      this.albums = this.result.albums
    }
  }
}
</script>

<style lang="less" scoped>
.search-album .ant-row-flex {
  &:nth-child(even) {
    background: #eee;
  }
  &:hover {
    background: #ddd;
  }
}
.album {
  display: flex;
  align-items: center;
  padding: 10px 40px;
  font-size: 13px;
  color: #333;
  img {
    display: block;
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
}
</style>
