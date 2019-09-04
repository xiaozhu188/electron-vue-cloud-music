const electron = require('electron')
const createTray = function (Tray) {
  let { width: screenWidth } = electron.screen.getPrimaryDisplay().size
  const trayIconPath = __static + '/images/tray.ico'
  const appTray = new Tray(trayIconPath)
  appTray.setToolTip('网易云音乐')
  appTray.on('right-click', (event, bounds) => {
    const [trayMenuWidth, trayMenuHeight] = global.trayWindow.getSize()
    let { x, y } = electron.screen.getCursorScreenPoint()
    if (x + trayMenuWidth > screenWidth) {
      global.trayWindow.setPosition(x - trayMenuWidth, y - trayMenuHeight)
    } else {
      global.trayWindow.setPosition(x, y - trayMenuHeight)
    }
    global.trayWindow.show()
  })
  // appTray.on('click', (event, bounds) => {
  //   if (global.mainWindow.isVisible()) {
  //     global.mainWindow.hide()
  //   } else {
  //     global.mainWindow.show()
  //   }
  // })
  return appTray
}

export default createTray
