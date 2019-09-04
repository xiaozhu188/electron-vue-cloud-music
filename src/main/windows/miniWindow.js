const miniWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#mini`
  : `file://${__dirname}/index.html#mini`
const createMiniWindow = function (BrowserWindow) {
  let obj = {
    height: 50,
    width: 320,
    minWidth: 320,
    show: true,
    frame: false,
    fullscreenable: false,
    skipTaskbar: true,
    resizable: process.env.NODE_ENV === 'development',
    transparent: process.platform !== 'linux',
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: false,
      webSecurity: false
    }
  }

  let miniWindow = new BrowserWindow(obj)

  miniWindow.loadURL(miniWinURL)

  miniWindow.on('closed', () => {
    miniWindow = null
  })
  return miniWindow
}
export default createMiniWindow
