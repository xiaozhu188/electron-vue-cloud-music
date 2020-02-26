import { app, protocol, Tray, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import pkg from './../../package.json'
import initIpcEvent from './modules/ipcEvent'
import createTray from './modules/tray'
import createTrayWindow from './windows/trayWindow'
import createLyricWindow from './windows/desktopLyricWindow'
import createMiniWindow from './windows/miniWindow'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { ACHEME, LOAD_URL } from './config'

const isDevelopment = process.env.NODE_ENV !== 'production'
if ( process.env.NODE_ENV === 'production' ) {
  global.__img = path.join(__dirname, './img')
  global.__images = path.join(__dirname, './images')
}
let mainWindow = null

protocol.registerSchemesAsPrivileged([
  { scheme: ACHEME, privileges: { secure: true, standard: true } }
])
const previewIcon = process.env.NODE_ENV === 'development' ? 'public/images/tray.ico' : `${global.__images}/tray.ico`
const prevIcon = process.env.NODE_ENV === 'development' ? 'public/images/prev.png' : `${global.__images}/prev.png`
const nextIcon = process.env.NODE_ENV === 'development' ? 'public/images/next.png' : `${global.__images}/next.png`
const playIcon = process.env.NODE_ENV === 'development' ? 'public/images/play.png' : `${global.__images}/play.png`
const pauseIcon = process.env.NODE_ENV === 'development' ? 'public/images/pause.png' : `${global.__images}/pause.png`
// 设置底部任务栏按钮和缩略图
const setThumbarButtons = function (mainWindow, playing) {
  mainWindow.setThumbarButtons([
    {
      tooltip: '上一曲',
      icon: prevIcon,
      click () {
        mainWindow.webContents.send('prev-play')
      }
    },
    {
      tooltip: playing ? '暂停' : '播放',
      icon: playing ? pauseIcon : playIcon,
      click () {
        mainWindow.webContents.send('toggle-play', {
          value: !playing
        })
      }
    },
    {
      tooltip: '下一曲',
      icon: nextIcon,
      click () {
        mainWindow.webContents.send('next-play')
      }
    }
  ])
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 690,
    minWidth: 1000,
    minHeight: 690,
    title: pkg.description,
    icon: previewIcon,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      navigateOnDragDrop: true,
      devTools: true
    }
  })
  // 设置appId才能使用Notification
  if ( process.platform === 'win32' ) {
    app.setAppUserModelId(pkg.appId)
  }
  // 去除原生顶部菜单栏
  mainWindow.setMenu(null)

  if ( process.env.WEBPACK_DEV_SERVER_URL ) {
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
  } else {
    createProtocol(ACHEME)
    mainWindow.loadURL(LOAD_URL)
  }

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow.webContents.send('will-close')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // 设置任务栏操作和缩略图
    if ( process.platform === 'win32' ) {
      setThumbarButtons(mainWindow, false)
      mainWindow.setThumbnailClip({ x: 0, y: 0, width: 180, height: 50 })
    }
    global.lyricWindow = createLyricWindow(BrowserWindow)
    global.miniWindow = createMiniWindow(BrowserWindow)
  })

  if ( isDevelopment ) {
    // 安装vue-devtools
    let extensions = BrowserWindow.getDevToolsExtensions()
    if ( !extensions[ 'Vue.js devtools' ] ) {
      BrowserWindow.addDevToolsExtension(path.resolve(__dirname, './../../src/main/vue-devtools'))
    }
    // 打开调试窗口
    // mainWindow.webContents.openDevTools()
  }
  mainWindow.webContents.openDevTools()

  global.mainWindow = mainWindow
  // 初始化进程之间事件监听
  initIpcEvent()
  // 如果是windows系统模拟托盘菜单
  if ( process.platform === 'win32' ) {
    global.tray = createTray(Tray)
    let trayBounds = global.tray.getBounds()
    global.trayWindow = createTrayWindow(BrowserWindow, trayBounds)
  }
}

app.on('window-all-closed', () => {
  if ( process.platform !== 'darwin' ) {
    app.quit()
  }
})

app.on('activate', () => {
  if ( global.mainWindow === null || mainWindow === null ) {
    createWindow()
  }
})

app.on('ready', () => {
  global.execPath = process.execPath
  global.argv = process.argv
  createWindow()
  // protocalHandler()
  ipcMain.on('thumbar-buttons', (e, data) => {
    if ( global.mainWindow === null || mainWindow === null ) return
    if ( process.platform === 'win32' ) {
      let { playing } = data
      setThumbarButtons(mainWindow, playing)
    }
  })
})

app.on('quit', () => {
  if ( global.downloadFile ) {
    shell.openItem(global.downloadFile)
  }
})

if ( isDevelopment ) {
  if ( process.platform === 'win32' ) {
    process.on('message', data => {
      if ( data === 'graceful-exit' ) {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
