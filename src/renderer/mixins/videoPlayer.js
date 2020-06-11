import { LOAD_URL } from '../../main/config'

const { BrowserWindow } = require('electron').remote
const previewIcon = process.env.NODE_ENV === 'development' ? 'public/images/tray.ico' : `${global.__images}/tray.ico`
export default {
  created () {
    this.videoType = 'mv'
  },
  methods: {
    play (id) {
      let __videoPlayerWinId__ = localStorage.getItem('__videoPlayerWinId__')
      let win = __videoPlayerWinId__ ? BrowserWindow.fromId(Number(__videoPlayerWinId__)) : null
      const WIN_WIDTH = 800
      const WIN_MIN_WIDTH = 400
      const url = process.env.NODE_ENV === 'development'
        ? `http://localhost:9080/#/local-player?id=${id}`
        : `${LOAD_URL}#local-player?id=${id}`

      if (win === null) {
        win = new BrowserWindow({
          width: WIN_WIDTH,
          height: (WIN_WIDTH * (9 / 16)) + 110,
          minWidth: WIN_MIN_WIDTH,
          minHeight: (WIN_MIN_WIDTH * (9 / 16)) + 110,
          // show: false,
          frame: false,
          fullscreen: false,
          darkTheme: true,
          icon: previewIcon,
          backgroundColor: '#000000',
          webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            backgroundThrottling: false,
            devTools: true
          }
        })
        localStorage.setItem('__videoPlayerWinId__', win.id)
        // win.once('ready-to-show', () => {
        //   win.show()
        // })
        win.setMenu(null)
        win.setAspectRatio(16 / 9)
        win.on('closed', () => {
          win = null
        })
        win.loadURL(url)
        win.webContents.openDevTools()
      }

      this.$store.commit('Video/SET_VIDEO_TYPE', this.videoType)
      this.$store.commit('Video/SET_VIDEO_ID', id)
    }
  }
}
