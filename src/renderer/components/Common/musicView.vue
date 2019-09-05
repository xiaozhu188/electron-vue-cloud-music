<template>
  <div>
    <canvas id="canvas" v-show="!showWater"></canvas>
    <canvas id="wrap" height="640" width="640" v-show="showWater"></canvas>
    <div class="avatar-wrapper" v-show="showWater" @click="avatarClick">
      <img
        :src="`${current_song.avatar}?param=400y400`"
        class="avatar"
        :class="{'paused' : !playing}"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      context: null,
      mediaElementSource: null,
      analyser: null,
      dataArray: [],
      gradient: '',
      width: 0,
      height: 0,
      showWater: false
    }
  },
  props: {
    canvasHeight: {
      type: Number,
      default: 0
    }
  },
  computed: {
    ...mapGetters('play', ['source', 'current_song', 'playing']),
    ...mapGetters('App', ['showView'])
  },
  watch: {
    source (newVal) {
      this.$nextTick(() => {
        this.audioDom = document.getElementById(newVal)
      })
    },
    showWater (newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initWater()
          this.timer && cancelAnimationFrame(this.timer)
        })
      } else {
        this.$nextTick(() => {
          this.init()
          this.timer2 && cancelAnimationFrame(this.timer2)
        })
      }
    },
    showView (newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.audioDom = document.getElementById(this.source)
          this.canvas.width = window.innerWidth
          this.canvas.height =
            this.canvasHeight === 0 ? window.innerHeight : this.canvasHeight
          this.width = window.innerWidth
          this.height =
            this.canvasHeight === 0 ? window.innerHeight : this.canvasHeight

          this.init()
        })
      } else {
        this.timer && cancelAnimationFrame(this.timer)
        this.timer2 && cancelAnimationFrame(this.timer2)
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.canvas = document.getElementById('canvas')
      this.wrap = document.getElementById('wrap')
      // this.audioDom = document.getElementById(this.source)
    })
    window.onresize = () => {
      this.canvas.width = window.innerWidth
      this.canvas.height =
        this.canvasHeight === 0 ? window.innerHeight : this.canvasHeight
      this.width = window.innerWidth
      this.height =
        this.canvasHeight === 0 ? window.innerHeight : this.canvasHeight

      this.init()
    }
  },
  methods: {
    init () {
      let AudioContext = window.AudioContext || window.webkitAudioContext
      let context = new AudioContext()
      if (!this.mediaElementSource) {
        try {
          if (!(this.audioDom instanceof window.Node)) return
          this.mediaElementSource = context.createMediaElementSource(
            this.audioDom
          )

          this.analyser = context.createAnalyser()
          this.mediaElementSource.connect(this.analyser)
          this.analyser.connect(context.destination)
          this.analyser.fftSize = 2048 / 2
          const length = this.analyser.fftSize
          // 创建数据
          this.dataArray = new Uint8Array(length)
          // console.log(this.dataArray)
        } catch (error) {
          console.log(error)
        }
      }
      this.context = this.canvas.getContext('2d')
      this.gradient = this.context.createLinearGradient(
        0,
        0,
        0,
        this.height
      )
      this.gradient.addColorStop('0', '#860000')
      this.gradient.addColorStop('1.0', '#c62f2f')
      let _this = this;
      (function draw () {
        _this.analyser.getByteFrequencyData(_this.dataArray)
        _this.context.clearRect(0, 0, _this.width, _this.height)
        _this.context.beginPath()
        _this.context.moveTo(0, _this.height)
        let x = 0
        let step = 12
        let length = Math.ceil(_this.width / step)
        for (let i = 1; i <= length; i++) {
          let lineHeight = ((_this.dataArray[i] / 256) * _this.height) / 5
          if (i < length / 10) {
            _this.context.lineTo(x, _this.height - lineHeight / 2)
          } else if (i > length - 1) {
            _this.context.lineTo(x, _this.height)
          } else {
            _this.context.lineTo(x, _this.height - lineHeight)
          }
          x += step
        }

        _this.context.fillStyle = _this.gradient
        _this.context.fill()
        _this.context.closePath()

        if (_this.audioDom && !_this.audioDom.paused) {
          _this.context.beginPath()
          _this.context.moveTo(0, _this.height)
          let x2 = 0
          for (let j = 1; j <= length; j++) {
            let lineHeight2 =
                  ((_this.dataArray[j] / 256) * _this.height) / 5
            let diffH = Math.floor(Math.random() * 20 + 1)
            if (j < length / 10) {
              _this.context.lineTo(
                x2,
                _this.height - lineHeight2 / 2 - diffH
              )
            } else if (j > length - 1) {
              _this.context.lineTo(x2, _this.height - diffH)
            } else {
              _this.context.lineTo(x2, _this.height - lineHeight2 - diffH)
            }
            x2 += step
          }

          _this.context.strokeStyle = _this.gradient
          _this.context.stroke()
          _this.context.closePath()
        }
        _this.timer = requestAnimationFrame(draw)
      })()
    },
    initWater () {
      let { width, height } = this.wrap
      let cxt = this.wrap.getContext('2d')
      // 获取API
      let AudioContext = window.AudioContext || window.webkitAudioContext
      let context = new AudioContext()
      // 创建数据
      const length = this.analyser.fftSize
      let output = new Uint8Array(460)
      let du = 1.5 // 角度
      let potInt = { x: width / 2, y: height / 2 } // 起始坐标
      let R = 200 // 半径
      let W = 1.5 // 宽
      let _this = this;
      (function drawSpectrum () {
        _this.analyser.getByteFrequencyData(output) // 获取频域数据
        cxt.clearRect(0, 0, _this.wrap.width, _this.wrap.height)

        for (let i = 0; i < 360; i++) {
          let value = output[i + 100] / 4
          cxt.lineWidth = W
          let Rv1 = R - value
          let Rv2 = R + value
          cxt.beginPath()
          _this.gradient2 = cxt.createLinearGradient(
            Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
            -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x,
            Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + 30) + potInt.y,
            -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + 30) + potInt.x
          )
          _this.gradient2.addColorStop(0, 'rgba(226, 225, 0, .4)')
          _this.gradient2.addColorStop(0.3, 'rgba(226, 225, 0, .4)')
          _this.gradient2.addColorStop(0.3, 'rgba(226, 225, 0, .4)')
          _this.gradient2.addColorStop(1, 'rgba(226, 225, 0, 0)')
          if (i < 360 / du) {
            cxt.moveTo(
              Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
            )
            cxt.lineTo(
              Math.sin(((i * du) / 180) * Math.PI) * (Rv2 + 30) + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * (Rv2 + 30) + potInt.x
            )
          }

          cxt.lineCap = 'round'
          cxt.strokeStyle = '#eefb00'
          cxt.strokeStyle = _this.gradient2
          cxt.stroke()
          cxt.closePath()

          cxt.beginPath()
          if (i < 360 / du / 3) {
            let diff = Rv1 + 20 > R ? R : Rv1 + 20
            cxt.arc(
              Math.sin(((i * du * 3) / 180) * Math.PI) * diff + potInt.y,
              -Math.cos(((i * du * 3) / 180) * Math.PI) * diff + potInt.x,
              2,
              0,
              Math.PI * 2,
              false
            )
            cxt.fillStyle = 'rgba(226, 225, 0, .5)'
          }
          cxt.fill()
          cxt.closePath()

          cxt.beginPath()
          if (i < 360 / du) {
            cxt.moveTo(
              Math.sin(((i * du) / 180) * Math.PI) * R + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * R + potInt.x
            )
            cxt.lineTo(
              Math.sin(((i * du) / 180) * Math.PI) * Rv2 + potInt.y,
              -Math.cos(((i * du) / 180) * Math.PI) * Rv2 + potInt.x
            )
          }

          cxt.lineCap = 'round'
          cxt.strokeStyle = 'rgba(226, 225, 0, 1)'
          cxt.stroke()
          cxt.closePath()
        }
        _this.time2 = requestAnimationFrame(drawSpectrum)
      })()
    },
    toggleWater () {
      this.showWater = !this.showWater
    },
    avatarClick () {
      this.$emit('avatarClick')
      this.toggleWater()
    }
  }
}
</script>

<style lang="less" scoped>
@keyframes rotate {
  0%{transform: rotate(0)}
  100%{transform: rotate(360deg)}
}
#wrap,
.avatar-wrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1111;
  transform: translate(-50%, -50%);
  -webkit-app-region: no-drag;
}
.avatar-wrapper {
  width: 640px;
  height: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  .avatar {
    border-radius: 50%;
    width: 350px;
    height: 350px;
    z-index: -1;
    animation: rotate 20s linear infinite both;
    &.paused {
      animation-play-state: paused;
    }
  }
}
</style>