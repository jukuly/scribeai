const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, screen, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { sendCombination } = require('node-key-sender');

const { Configuration, OpenAIApi } = require('openai');

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
  globalShortcut.register('CommandOrControl+Shift+Space', () => shortcut());
}

async function shortcut() {
  if (!popUpWindow) createPopUp();
  getSelectedText()
    .then(text => popUpWindow.webContents.send('selected-text', text)); 
  
  popUpWindow.show();
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
      width: 0,
      height: 0,
      resizable: false,
      skipTaskbar: true,
      frame: false,
      alwaysOnTop: true,
      focusable: false,
      fullscreenable: false,
      show: false,
      transparent: true,
      webPreferences: {
        sandbox: false,
        preload: path.join(app.getAppPath(), 'public/preload.js')
      }
    }).addListener('show', () => popUpWindow.setPosition(screen.getCursorScreenPoint().x, screen.getCursorScreenPoint().y));
    popUpWindow.loadURL(isDev ? 'http://localhost:3000/pop-up' : `file://${path.join(__dirname, '../build/index.html#/pop-up')}`); 

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

/////////////////////////////
//Communication with openAI//
/////////////////////////////

const configuration = new Configuration({
  apiKey: 'Your OpenAI API Key'
});
const openai = new OpenAIApi(configuration);

async function davinci(prompt, temperature) {
  const result = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    temperature: temperature,
    max_tokens: 128,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const { choices } = { ...result.data };
  popUpWindow.webContents.send('api-response', choices[0].text);
}

async function curie(prompt, temperature) {
  const result = await openai.createCompletion({
    model: 'text-curie-001',
    prompt: prompt,
    temperature: temperature,
    max_tokens: 128,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });
  const { choices } = { ...result.data };
  popUpWindow.webContents.send('api-response', choices[0].text);
}

async function babbage(prompt, temperature) {
  const result = await openai.createCompletion({
    model: 'text-babbage-001',
    prompt: prompt,
    temperature: temperature,
    max_tokens: 64,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: ['.']
  });
  const { choices } = { ...result.data };
  popUpWindow.webContents.send('api-response', choices[0].text);
}

ipcMain.handle('complete', (event, text) => {
  babbage('Finish this sentence.\n\n' + text, 0.4);
});

ipcMain.handle('complete-w-context', (event, [text, context]) => {
  babbage('Finish this sentence using this context: ' + context + '\n\n' + text, 0.4);
});

ipcMain.handle('translate', (event, [text, language]) => {
  if (text[text.length-1] !== '.') text += '.';
  curie('Translate this text to ' + language + '.\n\n' + text, 0);
});

ipcMain.handle('rephrase', (event, text) => {
  if (text[text.length-1] !== '.') text += '.';
  davinci('Rephrase this text.\n\n' + text, 1);
});