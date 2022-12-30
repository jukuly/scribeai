const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, screen, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const keySender = require('node-key-sender');

let mainWindow;
let popUpWindow;
let tray;

let signedIn = false;

function initializeApp() {
  if (!tray) {
    tray = new Tray(path.join(app.getAppPath(), 'public/smallLogoX32.ico'));
    tray.setToolTip('ScribeAI');
    tray.setTitle('ScribeAI');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show', click: () => signedIn ? createMainWindow() : createSignInWindow() },
      { label: 'Exit', click: () => app.quit() }
    ]));
  }
  signedIn ? createMainWindow() : createSignInWindow();
}

function createWindow(route) {
  BrowserWindow.getAllWindows().forEach(window => window.close());
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

  if (isDev) mainWindow.webContents.openDevTools();
}

function createSignInWindow() {
  createWindow('sign-in');
  globalShortcut.unregister('CommandOrControl+Shift+Space');
}

function createMainWindow() {
  createWindow('main');
  globalShortcut.register('CommandOrControl+Shift+Space', () => createPopUp());
}

function createPopUp() {
  if (popUpWindow) popUpWindow.close();
  popUpWindow = new BrowserWindow({
    x: screen.getCursorScreenPoint().x,
    y: screen.getCursorScreenPoint().y,
    height: 200,
    width: 200,
    useContentSize: true,
    movable: false,
    resizable: false,
    skipTaskbar: true,
    frame: false,
    focusable: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      sandbox: false,
      preload: path.join(app.getAppPath(), 'public/preload.js')
    }
  });
  popUpWindow.loadURL(isDev ? 'http://localhost:3000/pop-up' : `file://${path.join(__dirname, '../build/index.html#/pop-up')}`); 
  if (isDev) popUpWindow.webContents.openDevTools();
}

async function getSelectedText() {
  const text = clipboard.readText();
  clipboard.clear();
  if (process.platform === 'darwin') {
    await keySender.sendCombination(['command', 'c']);
  } else {
    await keySender.sendCombination(['control', 'c']);
  }
  
  const result = clipboard.readText();
  clipboard.writeText(text);
  return result;
}

app.on('ready', () => initializeApp());

app.on('activate', () => initializeApp());

app.on('window-all-closed', event => event.preventDefault());

ipcMain.handle('get-selected-text', async () => await getSelectedText());

ipcMain.handle('sign-in', () => {
  signedIn = true;
  mainWindow.close();
  createMainWindow();
});
ipcMain.handle('sign-out', () => {
  signedIn = false;
  mainWindow.close();
  createSignInWindow();
});
