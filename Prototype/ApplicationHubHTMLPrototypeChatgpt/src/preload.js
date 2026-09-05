const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('hub', { launchApp: target => ipcRenderer.invoke('launch-app', target) });
