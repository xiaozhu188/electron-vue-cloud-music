import { LOAD_URL } from "./../config";
const electron = require("electron");
const winURL =
    process.env.NODE_ENV === "development"
        ? `http://localhost:9080/#desktop-lyric`
        : `${LOAD_URL}#desktop-lyric`;

const createLyricWindow = function (BrowserWindow) {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
    const obj = {
        minWidth: 650,
        width,
        height: 80,
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
        hasShadow: process.platform === "darwin" ? false : true,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            devTools: false,
        },
    };

    let lyricWindow = new BrowserWindow(obj);
    // lyricWindow.webContents.openDevTools()
    lyricWindow.loadURL(winURL);
    // lyricWindow.setIgnoreMouseEvents(true)

    return lyricWindow;
};
export default createLyricWindow;
