import { ipcMain, dialog, app, BrowserWindow, shell } from 'electron'
import path from 'path'
import createMiniWindow from '../windows/miniWindow'
import createUpdateWindow from './../windows/updateWindow'
import { defaultDownloadFolder } from '../../renderer/config/downloadSettings'
let { download } = require('electron-dl')
let downloads = {}
let updateWindow

export default function () {
  ipcMain.on('resize-mini', (event, params) => {
    let height = params.height
    global.miniWindow.setBounds({ height })
  })

  ipcMain.on('toggle-play', (event, params) => {
    let value = params.value
    global.mainWindow.webContents.send('toggle-play', {
      value
    })
  })

  ipcMain.on('play-song', (event, params) => {
    let value = params.value
    global.mainWindow.webContents.send('play-song', {
      value
    })
  })

  ipcMain.on('prev-play', (event, params) => {
    let value = params.value
    global.mainWindow.webContents.send('prev-play', {
      value
    })
  })

  ipcMain.on('next-play', (event, params) => {
    let value = params.value
    global.mainWindow.webContents.send('next-play', {
      value
    })
  })

  ipcMain.on('toggle-mini', (event, params) => {
    if (params.value) {
      global.miniWindow.show()
      global.mainWindow.hide()
    } else {
      global.miniWindow.hide()
      global.mainWindow.show()
    }
  })

  ipcMain.on('show-window', () => {
    global.mainWindow.show()
  })

  ipcMain.on('window-min', () => {
    global.mainWindow.minimize()
  })

  ipcMain.on('window-max', () => {
    if (global.mainWindow.isMaximized()) {
      global.mainWindow.restore()
    } else {
      global.mainWindow.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    let wins = BrowserWindow.getAllWindows()
    for (let i = 0; i < wins.length; i++) {
      wins[i].close()
    }
  })

  ipcMain.on('app-exit', () => {
    // 所有窗口都将立即被关闭，而不询问用户，而且 before-quit 和 will-quit 事件也不会被触发。
    app.exit()
  })

  ipcMain.on('quit-and-open', (event, data) => {
    global.downloadFile = data
    app.quit()
  })

  ipcMain.on('download-start', (e, args) => {
    let downloadFolder = args.downloadFolder
    let downloadUrl = args.url
    download(global.mainWindow, downloadUrl, {
      filename: args.filename,
      directory: downloadFolder, // 本地若不存在该目录会自动创建
      // saveAs: true
      onStarted (downloadItem) {
        global.mainWindow.webContents.send('download-onStarted', {
          id: args.id,
          song: args.song,
          totalBytes: downloadItem.getTotalBytes()
        })
        downloads[args.id] = downloadItem
      },
      onProgress (progress) {
        global.mainWindow.webContents.send('download-onProgress', {
          id: args.id,
          progress: progress.percent * 100,
          state: downloads[args.id].getState()
        })
      }
    }).then(downloadItem => {
      // console.log(downloadItem)
      global.mainWindow.webContents.send('download-success', {
        id: args.id,
        song: args.song,
        downloadFolder,
        downloadUrl
      })
    }).catch(e => {
      global.mainWindow.webContents.send('download-error', {
        id: args.id,
        error: e
      })
    })
  })

  ipcMain.on('download-cancel', (e, data) => {
    let { id } = data
    downloads[id].cancel && downloads[id].cancel()
  })

  ipcMain.on('download-toggle', (e, data) => {
    let { id } = data
    if (downloads[id].isPaused()) {
      downloads[id].resume && downloads[id].resume()
    } else {
      downloads[id].pause && downloads[id].pause()
    }
  })

  ipcMain.on('open-directory-dialog', event => {
    dialog.showOpenDialog(
      {
        defaultPath: defaultDownloadFolder,
        properties: ['openDirectory', 'multiSelections']
        // filters: [
        //   { name: 'Audio', extensions: ['mp3', 'wma'] }
        // ]
      },
      function (files) {
        if (files) {
          event.sender.send('selectedItem', files)
        }
      }
    )
  })

  ipcMain.on('ondragstart', (event, e) => {
    event.sender.startDrag({
      file: 'images/play.png',
      icon: 'images/play.png'
    })
  })

  ipcMain.on('set-tray-title', (event, data) => {
    if (global.tray) {
      global.tray.setToolTip(data)
    }
  })

  ipcMain.once('hide-welcome', () => {
    global.welcomeWindow.hide()
    global.mainWindow.focus()
  })

  ipcMain.once('hide-tray', () => {
    global.trayWindow.hide()
  })

  ipcMain.on('restart', () => {
    app.relaunch()
    app.exit(0)
  })

  ipcMain.on('toggle-desktop-lyric', (event, flag) => {
    if (flag) {
      global.lyricWindow.showInactive()
    } else {
      global.lyricWindow.hide()
    }
  })

  ipcMain.on('fix-desktop-lyric', (event, data) => {
    global.lyricWindow.setIgnoreMouseEvents(data, {
      forward: true
    })
    if (data === false) {
      global.lyricWindow.webContents.send('show-lock')
    }
  })

  ipcMain.on('close-updatewin', (event, data) => {
    updateWindow.close()
    updateWindow = null
  })

  ipcMain.on('toggle-updatewin', (event, data) => {
    if (!updateWindow) {
      updateWindow = createUpdateWindow(BrowserWindow)
      updateWindow.show()
    } else {
      if (updateWindow.isVisible()) {
        updateWindow.minimize()
      } else {
        updateWindow.show()
      }
    }
  })

  ipcMain.on('update-version', (event, data) => {
    let version = data
    global.remoteVersion = version
  })
}
