<template>
  <transition-group
    appear
    :tag="tag"
    :css="false"
    @before-enter="beforeEnter"
    @enter="enter"
    @leave="leave"
  >
    <slot></slot>
  </transition-group>
</template>

<script>
import anime from 'animejs'
export default {
  props: {
    tag: {
      type: String,
      default: 'ul'
    },
    easing: {
      type: String,
      default: ''
    },
    loop: {
      type: [Number, Boolean],
      default: false
    },
    delay: {
      type: Number,
      default: 0
    },
    speed: {
      type: Number,
      default: 250
    },
    beforeEnterStyle: {
      type: Object,
      default () {
        return null
      }
    },
    enterStyle: {
      type: Object,
      default () {
        return null
      }
    }
  },
  methods: {
    beforeEnter (el) {
      const { beforeEnterStyle } = this
      if (beforeEnterStyle) {
        for (let k in beforeEnterStyle) {
          el.style[k] = beforeEnterStyle[k]
        }
      }
      el.style.opacity = 0
      el.style.transform = `translateX(100%)`
    },
    enter (el, done) {
      const { speed, easing, enterStyle } = this
      let i = el.getAttribute('data-i') || 0
      let iDelay = i * speed
      let animeOption = {
        targets: el,
        duration: 300,
        easing: 'linear',
        opacity: 1,
        translateX: 0,
        complete: () => {
          done()
        }
      }
      setTimeout(() => {
        anime(animeOption)
      }, iDelay)
    },
    leave (el, done) {
      let animeOption = {
        targets: el,
        duration: 300,
        easing: 'linear',
        opacity: 0,
        translateX: '-100%',
        complete: () => {
          done()
        }
      }
      anime(animeOption)
    }
  }
}
</script>
