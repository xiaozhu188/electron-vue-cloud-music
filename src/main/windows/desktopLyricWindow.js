const electron = require('electron')
import { LOAD_URL } from './../config'
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#desktop-lyric`
  : `${LOAD_URL}#desktop-lyric`

const createLyricWindow = function (BrowserWindow) {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  const obj = {
    minWidth: 650,
    width,
    height: 60,
    show: false,
    frame: false,
    x: 0,
    y: height - 150,
    fullscreenable: false,
    minimizable: false,
    maximizable: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true, // 任务栏中不显示窗口
    closable: false,
    // parent: global.mainWindow,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: false,
      devTools: false
    }
  }

  let lyricWindow = new BrowserWindow(obj)

  lyricWindow.loadURL(winURL)
  // lyricWindow.setIgnoreMouseEvents(true)

  return lyricWindow
}
export default createLyricWindow
