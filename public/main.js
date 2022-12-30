const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let popUpWindow;
let tray;

function initializeApp() {
  if (!tray) {
    tray = new Tray(path.join(app.getAppPath(), 'public/smallLogoX32.ico'));
    tray.setToolTip('ScribeAI');
    tray.setTitle('ScribeAI');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show', click: () => createMainWindow() },
      { label: 'Exit', click: () => app.quit() }
    ]));
  }
  createSignInWindow();
}

function createWindow(route) {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      resizable: false,
      icon: path.join(app.getAppPath(), 'public/smallLogoX32.ico'),
      webPreferences: {
        sandbox: false,
        preload: path.join(app.getAppPath(), 'public/preload.js')
      }
    });
    mainWindow.removeMenu();
    mainWindow.loadURL(isDev ? `http://localhost:3000/${route}` : `file://${path.join(__dirname, `../build/index.html#/${route}`)}`);

    mainWindow.webContents.openDevTools();
  }
}

function createSignInWindow() {
  createWindow('sign-in');
}

function createMainWindow() {
  createWindow('main');
}

function createPopUp() {
  popUpWindow = new BrowserWindow({

  });
  popUpWindow.loadURL(isDev ? 'http://localhost:3000/pop-up' : `file://${path.join(__dirname, '../build/index.html#/pop-up')}`);
}

app.on('ready', () => initializeApp());

app.on('activate', () => initializeApp());

app.on('window-all-closed', event => event.preventDefault());
