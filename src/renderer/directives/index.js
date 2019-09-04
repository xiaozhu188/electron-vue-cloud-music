import Vue from 'vue'
import transferDom from './transfer-dom'

// 点击元素之外隐藏该元素
Vue.directive('clickOutside', {
  bind (el, binding) {
    el.__vueClickOutside__ = function documentHandle (e) {
      if (el.contains(e.target)) {
        return false
      }
      if (binding.expression) {
        binding.value(e)
      }
    }
    document.addEventListener('click', el.__vueClickOutside__, true)
  },
  unbind (el) {
    document.removeEventListener('click', el.__vueClickOutside__, true)
    delete el.__vueClickOutside__
  }
})
// 移动dom,解决层级问题
Vue.directive('transferDom', {
  inserted: transferDom.inserted,
  componentUpdated: transferDom.componentUpdated,
  unbind: transferDom.unbind
})
