const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev'); 
const fs = require('fs');
require('@electron/remote/main').initialize();

const defaultConfig = {
  minimize: false
}

let config;
try {
  config = JSON.parse(fs.readFileSync(`${app.getPath('userData')}/config.json`, 'utf8'));
} catch (e) {
  fs.writeFileSync(`${app.getPath('userData')}/config.json`, JSON.stringify(defaultConfig));
  config = JSON.parse(fs.readFileSync(`${app.getPath('userData')}/config.json`, 'utf8'));
}

function createWindow() {
  let win;
  if (config.minimize) {
    //Will change: for the minimized version of the app
     win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        enableRemoteModule: true
      }
    });
  } else {
    win = new BrowserWindow({
      width: 800,
      height: 600,
      resizable: false,
      icon: 'build/smallLogoX32.ico',
      webPreferences: {
        enableRemoteModule: true
      }
    });
    win.removeMenu();
  }
  
  win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
}

function createPopUp() {
  const popUpWindow = new BrowserWindow({
    
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});