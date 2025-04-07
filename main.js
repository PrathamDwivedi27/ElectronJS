// main.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("renderer/index.html");
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
  
    if (result.canceled || result.filePaths.length === 0) return [];
  
    const selectedPath = result.filePaths[0];
  
    const videoFiles = [];
  
    // Recursive function to walk directories
    function walkDir(currentPath) {
      const files = fs.readdirSync(currentPath);
      for (const file of files) {
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath); // recurse into subfolder
        } else if (file.endsWith(".mp4") || file.endsWith(".dav")) {
          videoFiles.push(file);
        }
      }
    }
  
    walkDir(selectedPath); // start the scan
  
    return videoFiles;
  });
  
