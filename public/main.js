const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev'); 
const fs = require('fs');

const defaultConfig = {
  minimize: true
}

let config;
try {
  config = JSON.parse(fs.readFileSync(`${app.getPath('userData')}/config.json`, 'utf8'));
} catch (e) {
  fs.writeFileSync(`${app.getPath('userData')}/config.json`, JSON.stringify(defaultConfig));
  config = JSON.parse(fs.readFileSync(`${app.getPath('userData')}/config.json`, 'utf8'));
}

let mainWindow;
let popUpWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    icon: 'public/smallLogoX32.ico',
    webPreferences: {
      sandbox: false,
      preload: path.join(app.getAppPath(), 'public/preload.js')
    }
  });
  mainWindow.removeMenu();
  mainWindow.webContents.openDevTools();
  mainWindow.loadURL(isDev ? 'http://localhost:3000/main' : `file://${path.join(__dirname, '../build/index.html#/main')}`);
}

function createMinimizedWindow() {
  BrowserWindow.getAllWindows().forEach(window => window.close());
  mainWindow = new BrowserWindow({
    fullScreen: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    hasShadow: false,
    minimizable: false,
    movable: false,
    resizable: false,
    icon: 'public/smallLogoX32.ico',
    webPreferences: {
      sandbox: false,
      preload: path.join(app.getAppPath(), 'public/preload.js')
    }
  });
  mainWindow.removeMenu();
  mainWindow.webContents.openDevTools();
  mainWindow.loadURL(isDev ? 'http://localhost:3000/minimized' : `file://${path.join(__dirname, '../build/index.html#/minimized')}`);
  return true;
}

function createPopUp() {
  popUpWindow = new BrowserWindow({

  });
  popUpWindow.loadURL(isDev ? 'http://localhost:3000/pop-up' : `file://${path.join(__dirname, '../build/index.html#/pop-up')}`);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !config.minimize) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('get-config', () => config);
ipcMain.handle('minimize-main', () => createMinimizedWindow());