import Vue from 'vue'
import VueLazyload from 'vue-lazyload'

Vue.use(VueLazyload, {
  preLoad: 1.3,
  observer: true, // 使用IntersectionObserver监听
  // error: 'dist/error.png',
  // loading: 'dist/loading.gif',
  attempt: 1
})
