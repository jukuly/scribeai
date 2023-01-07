const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, screen, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const robot = require('robotjs');

const firstInstance = app.requestSingleInstanceLock();

let mainWindow;
let popUpWindow;
let tray;

async function initializeApp() {
  if (!tray) {
    tray = new Tray(path.join(__dirname, './assets/smallLogoX256.ico'));
    tray.setToolTip('ScribeAI');
    tray.setTitle('ScribeAI');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show', click: () => mainWindow.show() },
      { label: 'Exit', click: () => app.exit() }
    ]));
  }
  await createWindow();
  await createPopUp();
  globalShortcut.register('CommandOrControl+Shift+Space', () => shortcut());
}

async function shortcut() {
  if (!popUpWindow) await createPopUp();
  getSelectedText()
    .then(text => popUpWindow.webContents.send('selected-text', text)); 
  
  popUpWindow.showInactive();
}

async function createWindow() {
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
    await mainWindow.loadURL(isDev ? `http://localhost:3000` : `file://${path.join(__dirname, `./index.html`)}`);
    mainWindow.webContents.send('render', 'main');

    /*if (isDev)*/ mainWindow.webContents.openDevTools();
  }
}

async function createPopUp() {
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
    await popUpWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './index.html')}`); 
    popUpWindow.webContents.send('render', 'pop-up');

    /*if (isDev)*/ popUpWindow.webContents.openDevTools();
  }
}

async function getSelectedText() {
  const text = clipboard.readText();
  clipboard.clear();
  if (process.platform === 'darwin') {
    robot.keyTap('c', 'command');
  } else {
    robot.keyTap('c', 'control');
  }
  return new Promise((resolve, reject) => setTimeout(resolve, 100)).then(() => {
    const result = clipboard.readText();
    clipboard.writeText(text);
    return result;
  });
}

function writeText(text) {
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

app.on('ready', async () => await initializeApp());

app.on('activate', async () => await initializeApp());

app.on('window-all-closed', event => event.preventDefault());

ipcMain.handle('close-pop-up', () => popUpWindow.hide());

ipcMain.handle('set-pop-up-size', (event, [x, y]) => popUpWindow.setSize(x, y));

ipcMain.handle('write-text', (event, text) => writeText(text));

ipcMain.handle('open-in-browser', (event, url) => shell.openExternal(url));