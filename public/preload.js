const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'api', {
      send(channel, data) {
        let validChannels = ['main'];

        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      receive(channel, func) {
        let validChannels = ['main'];
        if (validChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      },
      async closePopUp() {
        return await ipcRenderer.invoke('close-pop-up');
      },
      async getSelectedText() {
        return await ipcRenderer.invoke('get-selected-text');
      },
      async signIn() {
        return await ipcRenderer.invoke('sign-in');
      },
      async signOut() {
        return await ipcRenderer.invoke('sign-out');
      }
  }
);