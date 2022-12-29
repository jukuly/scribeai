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
      async getConfig() {
        const config = await ipcRenderer.invoke('get-config');
        return config;
      },
      async minimize() {
        const result = await ipcRenderer.invoke('minimize-main');
        return result;
      },
      async expand() {
        console.log('not implemented yet');
      }
  }
);