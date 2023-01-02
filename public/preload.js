const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'api', {
      send(channel, data) {
        let validChannels = [];

        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      receive(channel, func) {
        let validChannels = ['selected-text', 'api-response'];
        if (validChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      },
      removeListener(channel, func) {
        let validChannels = ['selected-text', 'api-response'];
        if (validChannels.includes(channel)) {
          ipcRenderer.off(channel, (event, ...args) => func(...args));
        }
      },
      async closePopUp() {
        return await ipcRenderer.invoke('close-pop-up');
      },
      setPopUpSize(x, y) {
        return ipcRenderer.invoke('set-pop-up-size', [x, y]);
      },
      writeText(text) {
        return ipcRenderer.invoke('write-text', text);
      },
      complete(text) {
        return ipcRenderer.invoke('complete', text);
      },
      completeWContext(text, context) {
        return ipcRenderer.invoke('complete-w-context', [text, context]);
      },
      translate(text, language) {
        return ipcRenderer.invoke('translate', [text, language]);
      },
      rephrase(text) {
        return ipcRenderer.invoke('rephrase', text);
      }
  }
);