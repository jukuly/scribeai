const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, screen, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { sendCombination } = require('node-key-sender');

const firstInstance = app.requestSingleInstanceLock();

let mainWindow;
let popUpWindow;
let popUpLoading;
let tray;

function initializeApp() {
  if (!tray) {
    tray = new Tray(path.join(app.getAppPath(), 'public/smallLogoX32.ico'));
    tray.setToolTip('ScribeAI');
    tray.setTitle('ScribeAI');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show', click: () => mainWindow.show() },
      { label: 'Exit', click: () => app.exit() }
    ]));
  }
  createWindow();
  createPopUp();
  globalShortcut.register('CommandOrControl+Shift+Space', async () => {
    createPopUpLoading();
    const text = await getSelectedText(); 
    await popUpWindow.webContents.send('selected-text', text);
    if (popUpLoading) {
      popUpLoading.close();
      popUpLoading = null;
    }
    popUpWindow.show();
  });
}

function createWindow() {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      resizable: false,
      icon: path.join(app.getAppPath(), 'public/smallLogoX32.ico'),
      webPreferences: {
        sandbox: false,
        preload: path.join(app.getAppPath(), 'public/preload.js')
      }
    }).addListener('close', event => {
      mainWindow.hide();
      event.preventDefault();
    });
    mainWindow.removeMenu();
    mainWindow.loadURL(isDev ? `http://localhost:3000/main` : `file://${path.join(__dirname, `../build/index.html#/main`)}`);
  
    if (isDev) mainWindow.webContents.openDevTools();
  }
}

function createPopUp() {
  if (!popUpWindow) {
    popUpWindow = new BrowserWindow({
      x: screen.getCursorScreenPoint().x,
      y: screen.getCursorScreenPoint().y,
      height: 75,
      width: 175,
      movable: false,
      resizable: false,
      skipTaskbar: true,
      frame: false,
      alwaysOnTop: true,
      fullscreenable: false,
      hasShadow: false,
      show: false,
      transparent: true,
      backgroundColor: '#ffffff',
      webPreferences: {
        sandbox: false,
        preload: path.join(app.getAppPath(), 'public/preload.js')
      }
    }).addListener('show', () => popUpWindow.setPosition(screen.getCursorScreenPoint().x, screen.getCursorScreenPoint().y))
      .addListener('blur', () => popUpWindow.hide())
      .addListener('hide', () => {
        globalShortcut.register('CommandOrControl+Shift+Space', async () => {
          createPopUpLoading();
          const text = await getSelectedText(); 
          await popUpWindow.webContents.send('selected-text', text);
          if (popUpLoading) {
            popUpLoading.close();
            popUpLoading = null;
          }
          popUpWindow.show();
        });
      });
    popUpWindow.loadURL(isDev ? 'http://localhost:3000/pop-up' : `file://${path.join(__dirname, '../build/index.html#/pop-up')}`); 

    if (isDev) popUpWindow.webContents.openDevTools();
  }
}

function createPopUpLoading() {
  if (!popUpLoading) {
    popUpLoading = new BrowserWindow({
      x: screen.getCursorScreenPoint().x,
      y: screen.getCursorScreenPoint().y,
      height: 50,
      width: 50,
      movable: false,
      resizable: false,
      skipTaskbar: true,
      frame: false,
      alwaysOnTop: true,
      fullscreenable: false,
      hasShadow: false,
      transparent: true,
      focusable: false,
      webPreferences: {
        sandbox: false,
        preload: path.join(app.getAppPath(), 'public/preload.js')
      }
    });
    globalShortcut.unregister('CommandOrControl+Shift+Space');
    popUpLoading.loadURL(isDev ? 'http://localhost:3000/pop-up-loading' : `file://${path.join(__dirname, '../build/index.html#/pop-up-loading')}`); 
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

if (!firstInstance) {
  app.exit()
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