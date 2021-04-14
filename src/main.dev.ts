/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import config from './config';
import { IpcMainEvent } from 'electron/main';

const fs = require('fs')
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let monitorWindow: BrowserWindow | null = null;
let configWindow: BrowserWindow | null = null;
let trendWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  monitorWindow = new BrowserWindow({
    show: false,
    width: config.winMonitorWidth,
    height: config.winMonitorHeight,
    icon: getAssetPath('coin-bitcoin.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    type: 'toolbar',
    hasShadow: true,
    backgroundColor: '#00000000',
    fullscreenable: false,
    maximizable: false,
    fullscreen: false
  });
  configWindow = new BrowserWindow({
    show: false,
    width: config.winConfigWidth,
    height: config.winConfigHeight,
    icon: getAssetPath('coin-bitcoin.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    // type: 'toolbar',
    hasShadow: true,
    backgroundColor: '#00000000',
    fullscreenable: false,
    maximizable: false,
    fullscreen: false,
    parent: monitorWindow
  });
  trendWindow = new BrowserWindow({
    show: false,
    width: config.winTrendWidth,
    height: config.winTrendHeight,
    icon: getAssetPath('coin-bitcoin.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    // type: 'toolbar',
    hasShadow: true,
    backgroundColor: '#00000000',
    fullscreenable: false,
    maximizable: false,
    fullscreen: false,
    // parent: monitorWindow
  });


  monitorWindow.loadURL(`file://${__dirname}/MonitorWindow/index.html`);
  configWindow.loadURL(`file://${__dirname}/ConfigWindow/index.html`);
  trendWindow.loadURL(`file://${__dirname}/TrendWindow/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  monitorWindow.webContents.on('did-finish-load', () => {
    if (!monitorWindow) {
      throw new Error('"monitorWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      monitorWindow.minimize();
    } else {
      monitorWindow.show();
      monitorWindow.focus();
    }
  });
  configWindow.webContents.on('did-finish-load', () => {
    if (!configWindow) {
      throw new Error('"monitorWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      configWindow.minimize();
    }
    else {
    //   configWindow.show();
    //   configWindow.focus();
    }
  });
  trendWindow.webContents.on('did-finish-load', () => {
    if (!configWindow) {
      throw new Error('"monitorWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      trendWindow?.minimize();
    }
    else {
      // trendWindow?.show();
      // trendWindow?.focus();
    }
  });

  monitorWindow.on('closed', () => {
    monitorWindow = null;
  });
  configWindow.on('closed', () => {
    configWindow = null;
  });
  trendWindow.on('closed', () => {
    trendWindow = null;
  });

  configWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key.toLowerCase() === 'escape') {
      configWindow?.hide()
      event.preventDefault()
    }
  });
  trendWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key.toLowerCase() === 'escape') {
      trendWindow?.hide()
      event.preventDefault()
    }
  })

  const menuBuilder1 = new MenuBuilder(monitorWindow);
  menuBuilder1.buildMenu();
  const menuBuilder2 = new MenuBuilder(configWindow);
  menuBuilder2.buildMenu();
  const menuBuilder3 = new MenuBuilder(trendWindow);
  menuBuilder3.buildMenu();

  // Open urls in the user's browser
  monitorWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
  configWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
  trendWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (monitorWindow === null || configWindow === null || trendWindow === null) createWindow();
});

ipcMain.on('showConfigWindow', () => {
  configWindow?.show()
  configWindow?.focus()
});

ipcMain.on('hideConfigWindow', () => {
  configWindow?.hide()
});

ipcMain.on('showTrendWindow', (event: IpcMainEvent, args: any) => {
  trendWindow?.webContents.send('updatePair', args);
  const [x, y] = monitorWindow?.getPosition();
  trendWindow?.setPosition(x, y - config.winTrendHeight - 10);
  trendWindow?.show()
  trendWindow?.focus()
});

ipcMain.on('hideTrendWindow', () => {
  trendWindow?.webContents.send('stopUpdate');
  trendWindow?.hide()
});

ipcMain.on('loadConfig', (event) => {
  const configPath = path.join(__dirname,"../config.json");
  fs.readFile(configPath,"utf8", (err: any, data: any) => {
    if (err) {
      fs.writeFile(configPath, JSON.stringify(config), "utf8", (err) => {
        dialog.showMessageBox({
          type:'error',
          title: "Error",
          message: `Can't write config data to disk. ${err}`,
          //点击后返回数组下�?
          buttons:['Ok']
        })
      });
      event.reply('reciveConfig', JSON.stringify(config))
    } else {
      event.reply('reciveConfig', data)
    }
  });
});

ipcMain.on('saveConfig', (event, args) => {
  const configPath = path.join(__dirname,"../config.json");
  fs.writeFile(configPath, JSON.stringify(args), "utf8", (err) => {
    if (err) {
      dialog.showMessageBox({
        type:'error',
        title: "Error",
        message: `Can't write config data to disk. ${err}`,
        //点击后返回数组下�?
        buttons:['Ok']
      })
    }
  });
  monitorWindow?.webContents.send('reciveConfig', JSON.stringify(args));
  configWindow?.webContents.send('reciveConfig', JSON.stringify(args));
});
