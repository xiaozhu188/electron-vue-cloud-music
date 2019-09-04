import Notification from './../base/notification'
let toastInstance

function getToastInstance () {
  toastInstance = toastInstance || Notification.newInstance()
  return toastInstance
}

const notice = function ({ content = '提示', icon = '', duration = 3 }) {
  let instance = getToastInstance()
  // console.log('instance', instance)
  instance.notice({
    content,
    icon,
    duration
  })
}

export default notice

// export default {
//   info (options) {
//     return notice(options)
//   }
// }
