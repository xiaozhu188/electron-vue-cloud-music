import { LOAD_URL } from "./../config";

const miniWinURL =
    process.env.NODE_ENV === "development"
        ? `http://localhost:9080/#mini`
        : `${LOAD_URL}#mini`;
const createMiniWindow = function (BrowserWindow) {
    let obj = {
        height: 48,
        width: 320,
        minWidth: 320,
        show: false,
        titleBarStyle: "hiddenInset",
        frame: false,
        fullscreenable: false,
        minimizable: false,
        maximizable: false,
        transparent: true,
        skipTaskbar: true, // 任务栏中不显示窗口
        closable: false,
        resizable: process.env.NODE_ENV === "development",
        // transparent: process.platform !== "linux",
        hasShadow: process.platform !== "darwin",
        alwaysOnTop: true,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        },
    };

    let miniWindow = new BrowserWindow(obj);

    miniWindow.loadURL(miniWinURL);

    miniWindow.on("closed", () => {
        miniWindow = null;
    });

    return miniWindow;
};
export default createMiniWindow;
