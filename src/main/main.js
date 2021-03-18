"use strict";

import {
    app,
    protocol,
    Tray,
    BrowserWindow,
    ipcMain,
    shell,
    session,
} from "electron";
import path from "path";
import pkg from "./../../package.json";
import initIpcEvent from "./modules/ipcEvent";
import createTray from "./modules/tray";
import createTrayWindow from "./windows/trayWindow";
import createLyricWindow from "./windows/desktopLyricWindow";
import createMiniWindow from "./windows/miniWindow";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { ACHEME, LOAD_URL } from "./config";

const isDevelopment = process.env.NODE_ENV !== "production";

if (process.env.NODE_ENV === "production") {
    global.__img = path.join(__dirname, "./img");
    global.__images = path.join(__dirname, "./images");
}

const previewIcon =
    process.env.NODE_ENV === "development"
        ? "public/images/tray.ico"
        : `${global.__images}/tray.ico`;

const prevIcon =
    process.env.NODE_ENV === "development"
        ? "public/images/prev.png"
        : `${global.__images}/prev.png`;
const nextIcon =
    process.env.NODE_ENV === "development"
        ? "public/images/next.png"
        : `${global.__images}/next.png`;
const playIcon =
    process.env.NODE_ENV === "development"
        ? "public/images/play.png"
        : `${global.__images}/play.png`;
const pauseIcon =
    process.env.NODE_ENV === "development"
        ? "public/images/pause.png"
        : `${global.__images}/pause.png`;

// 设置底部任务栏按钮和缩略图
const setThumbarButtons = function (mainWindow, playing) {
    mainWindow.setThumbarButtons([
        {
            tooltip: "上一曲",
            icon: prevIcon,
            click() {
                mainWindow.webContents.send("prev-play");
            },
        },
        {
            tooltip: playing ? "暂停" : "播放",
            icon: playing ? pauseIcon : playIcon,
            click() {
                mainWindow.webContents.send("toggle-play", {
                    value: !playing,
                });
            },
        },
        {
            tooltip: "下一曲",
            icon: nextIcon,
            click() {
                mainWindow.webContents.send("next-play");
            },
        },
    ]);
};

let mainWindow = null;

protocol.registerSchemesAsPrivileged([
    {
        scheme: "app",
        privileges: {
            secure: true,
            standard: true,
        },
    },
]);

async function createWindow() {
    global.mainWindow = mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        title: process.platform === "win32" ? "网易云音乐" : "",
        icon: previewIcon,
        titleBarStyle: "hiddenInset",
        frame: process.platform !== "win32",
        show: true,
        backgroundColor: "#2e2c29",
        hasShadow: process.platform !== "darwin",
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        },
    });

    // 设置appId才能使用Notification
    if (process.platform === "win32") {
        app.setAppUserModelId(pkg.appId);
        // 去除原生顶部菜单栏
        mainWindow.setMenu(null);
        // 如果是windows系统模拟托盘菜单
        global.tray = createTray(Tray);
        let trayBounds = global.tray.getBounds();
        global.trayWindow = createTrayWindow(BrowserWindow, trayBounds);
    }

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
    } else {
        createProtocol(ACHEME);
        // Load the index.html when not in development
        await mainWindow.loadURL(LOAD_URL);
    }

    mainWindow.on("close", (event) => {
        event.preventDefault();
        mainWindow.webContents.send("will-close");
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        // 设置任务栏操作和缩略图
        if (process.platform === "win32") {
            setThumbarButtons(mainWindow, false);
            mainWindow.setThumbnailClip({ x: 0, y: 0, width: 180, height: 50 });
        }
    });
    // 初始化进程之间事件监听
    initIpcEvent();
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (global.mainWindow === null || mainWindow === null) {
        await createWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            const extensions = await session.defaultSession.getAllExtensions();
            if (!extensions.includes("Vue.js devtools")) {
                const appData = app.getPath("appData");
                const res = await session.defaultSession.loadExtension(
                    // 根据本机实际情况修改
                    path.resolve(
                        appData,
                        "Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/5.3.4_0"
                    )
                );
                console.log(`${res.name}安装成功`);
            }
        } catch (e) {
            console.error("Vue Devtools failed to install:", e.toString());
        }
    }
    global.execPath = process.execPath;
    global.argv = process.argv;
    await createWindow();
    global.lyricWindow = createLyricWindow(BrowserWindow);
    global.miniWindow = createMiniWindow(BrowserWindow);
    global.wins = {};
    global.wins["lyricWindow"] = global.lyricWindow;
    global.wins["miniWindow"] = global.miniWindow;
    ipcMain.on("thumbar-buttons", (e, data) => {
        if (global.mainWindow === null || mainWindow === null) return;
        if (process.platform === "win32") {
            let { playing } = data;
            setThumbarButtons(mainWindow, playing);
        }
    });
});

app.on("quit", () => {
    if (global.downloadFile) {
        shell.openItem(global.downloadFile);
    }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", (data) => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}
