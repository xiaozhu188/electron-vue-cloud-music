<template>
  <div v-if="event">
    <div class="video-wrapper" @click="handleClick">
      <div class="background" :style="`background-image:url(${event.video.coverUrl}?param=340y190)`"
           v-if="event.video.height > event.video.width"></div>
      <video
        ref="eventVideo"
        :controls="controls"
        :poster="`${event.video.coverUrl}?param=340y190`"
        :src="source"
        :key="event.video.videoId"
        class="video"
        @play="play"
        @ended="onEnd"
        @timeupdate="updateTime"
        @waiting="onWaiting"
        @playing="onPlaying"
        @error="onError"
      ></video>
      <template v-if="!isClick">
        <a-icon type="play-circle" class="icon" />
        <div class="bottom">
          <div class="l">
            <a-icon type="video-camera" />
            {{ event.video.playTime | toWan }}
          </div>
          <div class="r">{{ event.video.duration | duration }}</div>
        </div>
      </template>
      <div class="video-controls" v-else>
        <div class="video-progress">
          <progress-bar
            :percent="percent"
            :bufferedPercent="bufferedPercent"
            :waiting="waiting"
            @percentChanged="onProgressBarChange"
            @percentChanging="onProgressBarChanging"
          />
        </div>

        <div class="video-operation">
          <div class="left">
            <a-icon :type="playIcon" class="play-icon" @click.stop="togglePlaying" />
            <span class="time">{{currentTime | duration}}</span>
            <i>|</i>
            <span class="time">{{event.video.duration | duration}}</span>
          </div>
          <div class="right">
            <div class="fullScreen" @click="toggleFullScreen" title="网页全屏">
              <a-icon :type="screenIcon" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--<div class="title">{{event.video.title}}</div>-->
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ProgressBar from '@/components/Common/progressBar'
import { getVideoUrl } from '@/api/video'
import { truncate } from 'fs'

export default {
  props: {
    event: {
      type: Object,
      default () {
        return null
      }
    }
  },
  components: {
    ProgressBar
  },
  data () {
    return {
      source: '',
      autoplay: false,
      isClick: false,
      controls: false,
      waiting: false,
      currentTime: 0,
      buffered: 0,
      fullScreenFlag: false,
      videoPlaying: false
    }
  },
  computed: {
    percent () {
      return this.currentTime / this.event.video.duration
    },
    bufferedPercent () {
      return this.buffered / this.event.video.duration
    },
    playIcon () {
      return this.videoPlaying ? 'pause-circle' : 'play-circle'
    },
    screenIcon () {
      return this.fullScreenFlag ? 'fullscreen-exit' : 'fullscreen'
    }
  },
  watch: {
    videoPlaying (newVal) {
      const video = this.$refs.eventVideo
      this.$nextTick(() => {
        newVal ? video.play() : video.pause()
      })
    }
  },
  methods: {
    pause () {
      this.videoPlaying = false
    },
    handleClick () {
      this.isClick = true
      this.$emit('click')
      if ( this.source ) {
        this.videoPlaying = true
        return
      }
      let videoId = this.event.video.videoId
      getVideoUrl(videoId).then(res => {
        if ( res.urls[ 0 ].url ) {
          this.source = res.urls[ 0 ].url
          this.videoPlaying = true
          this.$store.commit('play/SET_PLAY_STATUS', false)
        }
      })
    },
    togglePlaying () {
      this.videoPlaying = !this.videoPlaying
    },
    toggleFullScreen () {
      this.fullScreenFlag = !this.fullScreenFlag
      this.$refs.eventVideo.webkitRequestFullScreen()
    },
    play () {
      this.videoPlaying = true
      if ( this.playing ) { // 暂停音频
        this.$store.commit('play/SET_PLAY_STATUS', false)
      }
    },
    onEnd () {
      this.videoPlaying = false
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
      const video = this.$refs.eventVideo
      if ( video ) {
        const timeRanges = video.buffered
        if ( timeRanges.length != 0 ) {
          this.buffered = timeRanges.end(timeRanges.length - 1)
        }
      }
    },
    onWaiting () {
      this.waiting = true
    },
    onPlaying () {
      this.waiting = false
    },
    onError () {
      this.waiting = false
    },
    onProgressBarChange (percent) {
      const currentTime = this.event.video.duration * percent
      this.currentTime = this.$refs.eventVideo.currentTime = currentTime
    },
    onProgressBarChanging (percent) {
      const currentTime = this.event.video.duration * percent
      this.currentTime = this.$refs.eventVideo.currentTime = currentTime
    }
  }
}
</script>

<style lang="less" scoped>
  .video-wrapper {
    position: relative;
    height: 100%;
    max-height: 500px;
    overflow: hidden;
    .background {
      position: absolute;
      left: -20px;
      right: -20px;
      top: -20px;
      bottom: -20px;
      z-index: 1;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: top;
      filter: blur(17px);
    }
    .video {
      z-index: 2;
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
      max-height: 500px;
      cursor: pointer;
    }
    .icon {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 10;
      transform: translate(-50%, -50%);
      font-size: 50px;
      color: rgba(255, 255, 255, 0.8);
      &:hover {
        color: rgba(255, 255, 255, 1);
        cursor: pointer;
      }
    }
    .bottom {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
      line-height: 28px;
      padding: 0 10px;
      color: #fff;
      font-size: 12px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
      .l {
        float: left;
      }
      .r {
        float: right;
      }
    }
    &:hover .video-controls {
      transform: translateY(0);
    }
  }

  .title {
    margin: 10px 0;
  }

  .video-controls {
    background: rgba(0, 0, 0, .4);
    overflow: hidden;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 11;
    transform: translateY(100%);
    transition: all .5s;
    .video-progress {
      height: 20px;
      display: flex;
      align-items: center;
      padding: 0 10px;
    }
    .left {
      height: 100%;
      display: flex;
      align-items: center;
      .play-icon {
        font-size: 27px;
        cursor: pointer;
      }
      .time {
        margin: 0 5px;
      }
    }
  }

  .video-operation {
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: rgba(255, 255, 255, 0.7);
    padding: 0 10px;
    font-size: 13px;
    .left {
      height: 100%;
      display: flex;
      align-items: center;
      .icon {
        width: 30px;
        line-height: 30px;
        text-align: center;
        margin: 0 5px;
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-radius: 50%;
      }
      .time {
        margin: 0 5px;
      }
    }
    .right {
      height: 100%;
      display: flex;
      align-items: center;
      .fullScreen {
        width: 40px;
        text-align: center;
        font-size: 18px;
      }
    }
  }
</style>
