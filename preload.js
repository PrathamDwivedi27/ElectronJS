const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("Electron", {
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  onJobStarted: (callback) => ipcRenderer.on("job-started", (_, data) => callback(data)),
  onJobCompleted: (callback) => ipcRenderer.on("job-completed", (_, data) => callback(data)),
  onJobFailed: (callback) => ipcRenderer.on("job-failed", (_, data) => callback(data)),
});
