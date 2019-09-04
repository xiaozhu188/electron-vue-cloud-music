import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import { ipcRenderer, remote } from 'electron'
import db from './datastore'
import './plugins/andt-design-vue'
import './plugins/vue-lazyload'
import './plugins/infinite-loading'
import './filters'
import './directives'
import createdInit from './core/createdInit'
import './styles/index.less'
import { errorCaptured } from './utils/assist'
Vue.prototype.$db = db
Vue.prototype.$errorCaptured = errorCaptured
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
const welcome = document.getElementById('welcome')
const welcomeImg = welcome.querySelector('.welcome-img')
Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  created () {
    createdInit()
  },
  mounted () {
    window.ondragenter = (event) => {
      event.preventDefault()
    }
    window.ondragover = (event) => {
      event.preventDefault()
    }
    window.ondrop = disableDrag
    // window.addEventListener('dragenter', function (event) {
    //   event.preventDefault()
    // })
    // window.addEventListener('dragover', function (event) {
    //   event.preventDefault()
    // })
    // window.addEventListener('drop', disableDrag)

    async function disableDrag (event) {
      event.preventDefault()
      let efile = event.dataTransfer
      console.log(event.type, efile.files)
      if (efile.files.length > 0 && event.type === 'drop') {
        const mm = require('music-metadata')
        const uuid = require('uuid/v1')
        let songs = []
        for (let i = 0; i < efile.files.length; i++) {
          let file = efile.files[i]
          let file_name = efile.files[i].name
          let path = file.path
          if (file_name.endsWith('.mp3') || file_name.endsWith('wma')) {
            const metadata = await mm.parseFile(path)
            // console.log('metadata', metadata)
            const songItem = {
              id: uuid(),
              name: file_name.substring(0, file_name.lastIndexOf('.')),
              avatar: 'static/images/default_album.jpg',
              album: {
                name: metadata.common.album || '未知专辑'
              },
              artist: metadata.common.artists
                ? metadata.common.artists.map(item => {
                  return {
                    id: uuid(),
                    name: item
                  }
                })
                : [{
                  id: uuid(),
                  name: '未知歌手'
                }],
              duration: parseInt(metadata.format.duration) || 0,
              url: path,
              folder: path,
              size: file.size
              // size: `${(stat.size / 1024 / 1024).toFixed(2)}M`
            }
            songs.push(songItem)
          }
        }
        // store.commit('Localsong/mutateState', {localSongs: songs})
        store.dispatch('play/selectPlay', { tracks: songs, index: 0 })
      }
      return false
    }
  },
  destroy () {
    window.ondragenter = null
    window.ondragover = null
    window.ondrop = null
  },
  template: '<App/>'
}).$mount('#app')

setTimeout(() => {
  welcomeImg.classList.add('fade')
}, 1000)
welcomeImg.addEventListener('webkitAnimationEnd', () => {
  Vue.nextTick(() => {
    document.body.removeChild(welcome)
  })
})
