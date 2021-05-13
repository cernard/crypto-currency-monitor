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
import { app, BrowserWindow, shell, ipcMain, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import fetch from 'electron-fetch';
// import { createStore, applyMiddleware } from 'redux';
// import {
//   forwardToRenderer,
//   triggerAlias,
//   replayActionMain,
//   createAliasedAction
// } from 'electron-redux';
import { Exchange, Ticker } from 'ccxt';
import _, { isEmpty } from 'lodash';
import { Currency, KData, Pair } from './Entities';
import {
  DataType as MonitoringMarket,
  BaseAndQuotes as Market,
  QuoteAndExchages,
} from './ConfigWindow/EditableTable';
import config from './config';
import MenuBuilder from './menu';
import SyncQueue from './SyncQueue';
import {} from './utils/ccxt_util';

const ccxt = require('ccxt');

const store = new Store();
// const reducers = require('../reducers');

// const reduxStore = createStore(reducers, 0, applyMiddleware(triggerAlias, forwardToRenderer));

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
      enableRemoteModule: true,
    },
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    type: 'toolbar',
    hasShadow: true,
    // backgroundColor: '',
    fullscreenable: false,
    maximizable: false,
    fullscreen: false,
  });
  configWindow = new BrowserWindow({
    show: true,
    width: config.winConfigWidth,
    height: config.winConfigHeight,
    icon: getAssetPath('coin-bitcoin.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    frame: true,
    transparent: false,
    resizable: true,
    alwaysOnTop: false,
    // type: 'toolbar',
    hasShadow: true,
    backgroundColor: '#00000000',
    fullscreenable: false,
    maximizable: true,
    fullscreen: false,
    parent: monitorWindow,
  });
  trendWindow = new BrowserWindow({
    show: false,
    width: config.winTrendWidth,
    height: config.winTrendHeight,
    icon: getAssetPath('coin-bitcoin.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
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

  monitorWindow.setSkipTaskbar(true);
  configWindow.setSkipTaskbar(true);
  trendWindow.setSkipTaskbar(true);

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
      // monitorWindow.webContents.openDevTools();
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
    } else {
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
    } else {
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
      configWindow?.hide();
      event.preventDefault();
    }
  });
  trendWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key.toLowerCase() === 'escape') {
      trendWindow?.hide();
      event.preventDefault();
    }
  });
  monitorWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key.toLowerCase() === 'escape') {
      app.quit();
      event.preventDefault();
    }
  });

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
  if (monitorWindow === null || configWindow === null || trendWindow === null)
    createWindow();
});

/**
 * Add IPC listeners
 */

ipcMain.on('showConfigWindow', () => {
  // configWindow.webContents.openDevTools();
  configWindow?.show();
  configWindow?.focus();
});

ipcMain.on('hideConfigWindow', () => {
  configWindow?.hide();
});

ipcMain.on('showTrendWindow', (_, pair: Pair) => {
  trendWindow?.webContents.send('updatePair', pair);
  const [x, y] = monitorWindow?.getPosition();
  // trendWindow.webContents.openDevTools();
  trendWindow?.setPosition(x, y - config.winTrendHeight - 10);
  trendWindow?.show();
  trendWindow?.focus();
});

ipcMain.on('hideTrendWindow', () => {
  trendWindow?.webContents.send('stopUpdate');
  trendWindow?.hide();
});

ipcMain.on('updateConfig', () => {
  monitorWindow?.webContents.send('wakeup');
});

ipcMain.on('quitApp', () => {
  app.quit();
});

if (!store.get('isPin') == null) {
  store.set('isPin', true);
}
ipcMain.on('togglePin', (e) => {
  const isPin = !store.get('isPin');
  store.set('isPin', isPin);
  monitorWindow?.setAlwaysOnTop(isPin);
  e.reply('updatePinState', isPin);
});

/**
 * Notify to all
 */
const notifyAll = () => {
  monitorWindow?.webContents.send('wakeup');
  trendWindow?.webContents.send('wakeup');
  configWindow?.webContents.send('wakeup');
};

/**
 * Timing tasks
 * Shared data between the different windows.
 */
const { PAIRS } = config;
const waitLock = false;
const taskQueue: SyncQueue = new SyncQueue();
const priceChangeIn24HQueue: SyncQueue = new SyncQueue();

interface MarketData {
  base: string;
  quote: string;
  exchange: string;
  currentPrice: number;
  purchasePrice: number;
  amount: number;
  changePercent?: number;
  kData?: any;
  symbol: string;
}

// symbol: Exchange instance
const exchangeInstanceMap: Map<string, Exchange | undefined> = new Map();
interface _Exchange {
  name: string;
  delay: number;
}
let reachableExchangesMap = store.get(
  config.REACHABLE_EXCHANGES
);
if (isEmpty(reachableExchangesMap)) reachableExchangesMap = {};

const updateMarketsData = (monitoringMarkets: MonitoringMarket[]) => {
  log.info('Update Markets Data');
  monitoringMarkets.forEach(async (monitoringMarket) => {
    const exchangeName = monitoringMarket.exchange;
    let symbol = `${monitoringMarket.base}/${monitoringMarket.quote}`;
    const markets: Market[] = store.get(config.MARKETS);
    if (isEmpty(markets)) {
      // const notification = new Notification({
      //   title: 'Market data not found!',
      //   body: 'Please load market data.',
      // });
      // TODO: clear interval
      return;
    }
    const market: Market = markets.filter(
      (m) => m.base === monitoringMarket.base
    )[0];
    if (isEmpty(market)) return;

    const quote: QuoteAndExchages = market.quotes.filter(
      (q) => q.quote === monitoringMarket.quote
    )[0];
    if (isEmpty(quote)) return;

    if (!isEmpty(quote.symbol)) symbol = quote.symbol;
    // if user not configure the exchange, find the exchange with lowest delay
    // Initial reachableExchangesMap
    if (Object.keys(reachableExchangesMap).length === 0) {
      const sortedExchanges = quote.exchanges.sort((a, b) => b.delay - a.delay);
      log.info(1);
      if (isEmpty(sortedExchanges)) return;
      log.info(2);
      sortedExchanges.forEach((exchange) => {
        log.info(3);
        let exchanges: _Exchange[] = [];
        if (Object.keys(reachableExchangesMap).includes(symbol)) {
          log.info(4);
          exchanges = reachableExchangesMap[symbol];
          exchanges.push({
            name: exchange.name,
            delay: exchange.delay,
          });
        } else {
          log.info(5);
          exchanges = [
            {
              name: exchange.name,
              delay: exchange.delay,
            },
          ];
        }
        reachableExchangesMap = {
          ...reachableExchangesMap,
          [symbol]: exchanges,
        };
      });
    }

    // TODO: reachableExchangesMap is undefined
    log.info('Symbol: ', symbol);
    log.info('ReachableExchange: ', reachableExchangesMap);
    const reachableExchanges: _Exchange[] = reachableExchangesMap[symbol];
    const newReachableExchanges: _Exchange[] = reachableExchanges.slice();

    let isBreak = false;

    // try to use cached instance, avoid request too much.
    let cachedExchangeInstance: Exchange = exchangeInstanceMap.get(symbol);
    // Handle user specified exchange
    if (isEmpty(cachedExchangeInstance)) {
      if (reachableExchanges.map((r) => r.name).includes(exchangeName)) {
        log.info(`Use user specified exchange: ${exchangeName}`);
        cachedExchangeInstance = new ccxt[exchangeName]();
        exchangeInstanceMap.set(symbol, cachedExchangeInstance);
      }
    }

    if (cachedExchangeInstance) {
      log.info(`Use cached exchange: ${cachedExchangeInstance.name}`);
      await Promise.all([cachedExchangeInstance.fetchTicker(symbol)])
        .then(([tickerData]) => {
          processData(monitoringMarket, tickerData);
          return true;
          // TODO: Process
        })
        .catch(async (err) => {
          log.error(err);
          log.info(`Exchange invalid: ${cachedExchangeInstance.name}`);
          for (const i in reachableExchanges) {
            if (isBreak) break;
            const exchangeInstance: Exchange = new ccxt[
              reachableExchanges[i].name
            ]();
            await Promise.all([exchangeInstance.fetchTicker(symbol)])
              .then(([tickerData]) => {
                isBreak = true;
                log.info(
                  `Cached exchange has change to ${exchangeInstance.name}`
                );
                // TODO: Process
                processData(monitoringMarket, tickerData);
                // add to cache
                exchangeInstanceMap.set(symbol, exchangeInstance);
                // update reachable exchanges
                reachableExchangesMap.set(
                  config.REACHABLE_EXCHANGES,
                  newReachableExchanges
                );
              })
              .catch((err) => {
                log.error(err);
                const invalidExchange = newReachableExchanges.shift();
                log.error('Invalid exchange: ', invalidExchange?.name);
              });
          }
        });
    } else {
      log.info(`No cached exchange instance.`);
      for (const i in reachableExchanges) {
        if (isBreak) break;
        log.info(`Try to change exchange to ${reachableExchanges[i].name}`);
        const exchangeInstance: Exchange = new ccxt[
          reachableExchanges[i].name
        ]();
        await Promise.all([exchangeInstance.fetchTicker(symbol)])
          .then(([tickerData]) => {
            isBreak = true;
            log.info(`Cached exchange has changed to ${exchangeInstance.name}`);
            // TODO: Process
            processData(monitoringMarket, tickerData);
            // add to cache
            exchangeInstanceMap.set(symbol, exchangeInstance);
            reachableExchangesMap.set(
              config.REACHABLE_EXCHANGES,
              newReachableExchanges
            );

            return true;
          })
          .catch((err) => {
            log.error(err);
            const invalidExchange = newReachableExchanges.shift();
            log.error('Invalid exchange: ', invalidExchange);
          });
      }
    }
    // const name = `${monitoringMarket.base}/${monitoringMarket.quote}`;
    // let marketsData: Map<string, MarketData> = store.get(config.MARKETS_DATA);
  });
};

function processData(monitoringMarket: MonitoringMarket, tickerData: Ticker) {
  let savedMarketDatas: MarketData[] = store.get(config.MARKETS_DATA);
  if (isEmpty(savedMarketDatas)) {
    savedMarketDatas = [];
  }
  const savedMarketData: MarketData = savedMarketDatas.filter(
    (marketData) => marketData.symbol === tickerData.symbol
  )[0];
  if (isEmpty(savedMarketData)) {
    savedMarketDatas.push({
      base: monitoringMarket.base,
      quote: monitoringMarket.quote,
      exchange: monitoringMarket.exchange,
      currentPrice: tickerData.average ? tickerData.average : tickerData.high,
      purchasePrice: monitoringMarket.pp,
      amount: monitoringMarket.amount,
      changePercent: tickerData.percentage,
      kData: [],
      symbol: tickerData.symbol,
    });
  } else {
    savedMarketData.base = monitoringMarket.base;
    savedMarketData.quote = monitoringMarket.quote;
    savedMarketData.exchange = monitoringMarket.exchange;
    savedMarketData.currentPrice = tickerData.average
      ? tickerData.average
      : tickerData.high;
    savedMarketData.purchasePrice = monitoringMarket.pp;
    savedMarketData.amount = monitoringMarket.amount;
    savedMarketData.changePercent = tickerData.percentage;
    savedMarketData.symbol = tickerData.symbol;
  }
  store.set(config.MARKETS_DATA, savedMarketDatas);
}

function start() {
  app.interval = setInterval(() => {
    const monitoringMarkets: MonitoringMarket[] = store.get(
      config.MONITORING_MARKETS
    );
    if (isEmpty(monitoringMarkets)) return;
    updateMarketsData(monitoringMarkets);
  }, 1000);
}

app.on('ready', () => {
  start();
});
// store.onDidChange(config.MONITORING_MARKETS, (monitoringMarkets: MonitoringMarket[] | unknown) => {

// })
