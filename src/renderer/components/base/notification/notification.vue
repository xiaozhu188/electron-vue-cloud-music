<template>
  <div class="notices-wrapper">
    <transition-group
      tag="div"
      name="zoom"
      enter-active-class="animated zoomIn"
      leave-active-class="animated zoomOut"
    >
      <div
        class="message-box"
        v-for="(notice) in notices"
        :key="notice.name"
        @click="remove(notice.name)"
      >
        <a-icon :type="notice.icon" class="notice-icon" v-if="notice.icon" />
        <span class="notice-text">{{notice.content}}</span>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { duration } from 'moment'
let seed = 0
const now = Date.now()
function getUuid () {
  return 'ZNotification_' + now + '_' + seed++
}
export default {
  data () {
    return {
      notices: [],
      duration: 3
    }
  },
  methods: {
    create (notice) {
      // console.log(notice)
      const name = notice.name || getUuid()
      let _notice
      if (typeof notice === 'string') {
        _notice = {
          content: notice,
          name
        }
      } else {
        _notice = Object.assign(
          {
            content: '',
            name
          },
          notice
        )
      }

      this.notices.push(_notice)
      let duration = notice.duration ? notice.duration : this.duration
      setTimeout(() => {
        this.remove(name)
      }, duration * 1000)
    },
    remove (name) {
      const notices = this.notices
      for (let i = 0; i < notices.length; i++) {
        if (notices[i].name === name) {
          this.notices.splice(i, 1)
          break
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
@keyframes zoomIn {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}
@keyframes zoomOut {
  0% {
    transform: translate(-50%, -50%) scale(1);

  }
  20% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0;
  }
}
.zoomIn {
  animation-duration: .2s;
  animation-name: zoomIn;
  animation-timing-function: ease-in;
}
.zoomOut {
  animation-name: zoomOut;
  animation-duration: 1.2s;
}
.animated {
  animation-fill-mode: both;
}
.message-box {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 5000;
  display: flex;
  // flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 80%;
  min-width: 200px;
  min-height: 40px;
  line-height: 1.1;
  padding: 15px 30px;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 30px;
  .notice-icon {
    margin-right: 15px;
  }
  .notice-text {
    // font-size: inherit;
  }
}
</style>
