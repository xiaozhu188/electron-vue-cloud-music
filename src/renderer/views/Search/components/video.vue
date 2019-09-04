<template>
  <div>
    <ul class="videos">
      <li v-for="video in videos" :key="video.id">
        <video-item :video="video"/>
      </li>
    </ul>
    <slot :total="result.videoCount"></slot> 
  </div>
</template>

<script>
import VideoItem from '@/components/Common/video-item'
import { getMv } from '@/api/sublist'
import { normalVideo } from '@/utils/video.js'
export default {
  props: {
    result: {
      type: Object,
      default () {
        return null
      }
    }
  },
  components: { VideoItem },
  computed: {
    videos () {
      let arr = []
      if (this.result.videos && this.result.videos.length) {
        this.result.videos.forEach(video => {
          arr.push(normalVideo(video))
        })
      }
      return arr
    }
  }
}
</script>

<style lang="less" scoped>
.videos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  padding: 15px 20px;
  grid-gap: 20px;
}
</style>
