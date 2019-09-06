import Vue from 'vue'
import Notification from './notification.vue'

Notification.newInstance = (properties = {}) => {
  const _props = properties
  const NotificationTpl = Vue.extend(Notification) // 创建vue构造器
  const instance = new NotificationTpl() // 实例化vue实例
  // 用$el来访问元素，并插入到body中
  const notification = instance.$mount().$el
  document.body.appendChild(notification)
  return {
    notice (noticeProps) {
      instance.create(noticeProps)
    },
    remove (name) {
      instance.remove(name)
    },
    component: notification
  }
}

export default Notification
