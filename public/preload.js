const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'api', {
      send(channel, data) {
        let validChannels = [];

        if (validChannels.includes(channel)) {
          ipcRenderer.sendSync(channel, data);
        }
      },
      receive(channel, func) {
        let validChannels = ['selected-text'];
        if (validChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      },
      async closePopUp() {
        return await ipcRenderer.invoke('close-pop-up');
      },
      setPopUpSize(x, y) {
        return ipcRenderer.invoke('set-pop-up-size', [x, y]);
      }
  }
);