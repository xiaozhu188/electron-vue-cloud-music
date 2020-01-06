<template>
  <router-link tag="li" :to="`/artist/${artist.id}`">
    <figure class="figure">
      <img v-lazy="`${artist.img1v1Url}?param=360y360`" />
      <figcaption class="figcaption">{{artist.name}}</figcaption>
    </figure>
  </router-link>
</template>

<script>
export default {
  name: 'artist-item',
  props: {
    artist: {
      type: Object
    }
  }
}
</script>

<style lang="less" scoped>
  .figure {
    overflow: hidden;
    cursor: pointer;
    &:hover {
      img {
        transform: scale3d(1.23,1.23,1.23);
      }
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      transition: all .23s;
      transform-origin: center bottom;
    }
    .figcaption {
      line-height: 25px;
      font-size: 13px;
      color: #333;
      text-align: center;
    }
  }
</style>
