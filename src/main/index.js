'use strict'

import { app, Tray, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import pkg from './../../package.json'
import initIpcEvent from './modules/ipcEvent'
import createTray from './modules/tray'
import createTrayWindow from './windows/trayWindow'
import createLyricWindow from './windows/desktopLyricWindow'
import createUpdateWindow from './windows/updateWindow'
import { checkUpdate } from './utils/update'
let updateWindow = null

if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// 设置appId才能使用Notification
if (process.platform === 'win32') {
  app.setAppUserModelId(pkg.build.appId)
}

let mainWindow
let winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const previewIcon = process.env.NODE_ENV === 'development' ? 'static/images/tray.ico' : `${global.__static}/images/tray.ico`
const prevIcon = process.env.NODE_ENV === 'development' ? 'static/images/prev.png' : `${global.__static}/images/prev.png`
const nextIcon = process.env.NODE_ENV === 'development' ? 'static/images/next.png' : `${global.__static}/images/next.png`
const playIcon = process.env.NODE_ENV === 'development' ? 'static/images/play.png' : `${global.__static}/images/play.png`
const pauseIcon = process.env.NODE_ENV === 'development' ? 'static/images/pause.png' : `${global.__static}/images/pause.png`
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

const createWindow = function () {
  mainWindow = new BrowserWindow({
    icon: previewIcon,
    height: 690,
    useContentSize: true,
    width: 1000,
    minWidth: 992,
    minHeight: 670,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      navigateOnDragDrop: true
      // devTools: false
    }
  })

  mainWindow.setMenu(null)

  mainWindow.loadURL(winURL)

  // 只能打开一个实例
  const gotTheLock = app.requestSingleInstanceLock()
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (mainWindow) {
      mainWindow.webContents.send('open-files', {event, argv, workingDirectory, args: process.argv})
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  if (!gotTheLock) {
    return app.quit()
  }
  // limit one end

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow.webContents.send('will-close')
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // 设置任务栏操作和缩略图
    setThumbarButtons(mainWindow, false)
    mainWindow.setThumbnailClip({ x: 0, y: 0, width: 180, height: 50 })
    global.lyricWindow = createLyricWindow(BrowserWindow)
  })

  if (process.env.NODE_ENV === 'development') {
    // global.mainWindow.webContents.openDevTools()
  }

  // 初始化进程之间事件监听
  initIpcEvent()
  global.mainWindow = mainWindow
  global.mainWindow.webContents.openDevTools()

  // 如果是windows系统模拟托盘菜单
  if (process.platform === 'win32') {
    global.tray = createTray(Tray)
    let trayBounds = global.tray.getBounds()
    global.trayWindow = createTrayWindow(BrowserWindow, trayBounds)
  }
}

/**
 * 协议处理
 */
function protocalHandler () {
  const args = []
  if (!app.isPackaged) {
    // 如果是开发阶段，需要把我们的脚本的绝对路径加入参数中
    args.push(path.resolve(process.argv[1]))
  }
  // 加一个 `--` 以确保后面的参数不被 Electron 处理
  args.push('--')

  // 注册协议
  const PROTOCOL = pkg.name
  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
  // 如果打开协议时，没有其他实例，则当前实例当做主实例，处理参数
  handleArgv(process.argv)

  // 其他实例启动时，主实例会通过 second-instance 事件接收其他实例的启动参数 `argv`
  app.on('second-instance', (event, argv) => {
    // Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
    if (process.platform === 'win32') {
      handleArgv(argv)
    }
  })

  // macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
  app.on('open-url', (event, urlStr) => {
    handleUrl(urlStr)
  })

  // 处理参数
  function handleArgv (argv) {
    const prefix = `${PROTOCOL}:`
    // 开发阶段，跳过前两个参数（`electron.exe .`）
    // 打包后，跳过第一个参数,即app的安装路径如E:\electron-vue-cloud-music\网易云音乐.exe
    const offset = app.isPackaged ? 1 : 2
    const url = argv.find((arg, i) => i >= offset && arg.startsWith(prefix))
    if (url) handleUrl(url)
  }

  // 解析Url
  function handleUrl (urlStr) {
    // electron-vue-cloud-music:?origin=web
    // 根据参数做出相应处理
    global.urlStr = {urlStr}
  }
}

app.on('ready', () => {
  global.execPath = process.execPath
  global.argv = process.argv
  createWindow()
  protocalHandler()
  ipcMain.on('thumbar-buttons', (e, data) => {
    if (global.mainWindow === null || mainWindow === null) return
    let { playing } = data
    setThumbarButtons(mainWindow, playing)
  })
})

app.on('quit', () => {
  console.log('quit')
  if (global.downloadFile) {
    shell.openItem(global.downloadFile)
  }
})

app.on('window-all-closed', () => {
  console.log('window-all-closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
