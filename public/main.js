const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, screen, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { sendCombination } = require('node-key-sender');

const firstInstance = app.requestSingleInstanceLock();

let mainWindow;
let popUpWindow;
let tray;

function initializeApp() {
  if (!tray) {
    tray = new Tray(path.join(__dirname, './assets/smallLogoX256.ico'));
    tray.setToolTip('ScribeAI');
    tray.setTitle('ScribeAI');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show', click: () => mainWindow.show() },
      { label: 'Exit', click: () => app.exit() }
    ]));
  }
  createWindow();
  createPopUp();
  globalShortcut.register('CommandOrControl+Shift+Space', () => shortcut());
}

async function shortcut() {
  if (!popUpWindow) createPopUp();
  getSelectedText()
    .then(text => popUpWindow.webContents.send('selected-text', text)); 
  
  popUpWindow.showInactive();
}

function createWindow() {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      width: 600,
      height: 450,
      resizable: false,
      icon: path.join(__dirname, './assets/smallLogoX256.ico'),
      webPreferences: {
        sandbox: false,
        preload: path.join(__dirname, 'preload.js')
      }
    }).addListener('close', event => {
      mainWindow.hide();
      event.preventDefault();
    });
    mainWindow.removeMenu();
    mainWindow.loadURL(isDev ? `http://localhost:3000/main` : `file://${path.join(__dirname, `../index.html#/main`)}`);
  
    if (isDev) mainWindow.webContents.openDevTools();
  }
}

function createPopUp() {
  if (!popUpWindow) {
    popUpWindow = new BrowserWindow({
      x: screen.getCursorScreenPoint().x,
      y: screen.getCursorScreenPoint().y,
      width: 0,
      height: 0,
      resizable: false,
      skipTaskbar: true,
      frame: false,
      alwaysOnTop: true,
      fullscreenable: false,
      show: false,
      transparent: true,
      webPreferences: {
        sandbox: false,
        preload: path.join(__dirname, 'preload.js')
      }
    }).addListener('show', () => popUpWindow.setPosition(screen.getCursorScreenPoint().x, screen.getCursorScreenPoint().y));
    popUpWindow.loadURL(isDev ? 'http://localhost:3000/pop-up' : `file://${path.join(__dirname, '../index.html#/pop-up')}`); 

    if (isDev) popUpWindow.webContents.openDevTools();
  }
}

async function getSelectedText() {
  const text = clipboard.readText();
  clipboard.clear();
  if (process.platform === 'darwin') {
    await sendCombination(['command', 'c']);
  } else {
    await sendCombination(['control', 'c']);
  }
  const result = clipboard.readText();
  clipboard.writeText(text);
  return result;
}

async function writeText(text) {
  clipboard.writeText(text);
}

if (!firstInstance) {
  app.exit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

app.on('ready', () => initializeApp());

app.on('activate', () => initializeApp());

app.on('window-all-closed', event => event.preventDefault());

ipcMain.handle('close-pop-up', () => popUpWindow.hide());

ipcMain.handle('set-pop-up-size', (event, [x, y]) => popUpWindow.setSize(x, y));

ipcMain.handle('write-text', (event, text) => writeText(text));

ipcMain.handle('open-in-browser', (event, url) => shell.openExternal(url));