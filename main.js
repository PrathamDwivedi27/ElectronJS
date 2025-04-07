// main.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const videoQueue = require("./queue/videoQueue");
const redisConnection = require("./utils/redisClient");
const { Worker } = require("bullmq");



let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("renderer/index.html");
}

app.whenReady().then(() => {
  createWindow();
  startVideoWorker();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });

  if (result.canceled) return [];

  const selectedPath = result.filePaths[0];

  // Recursively scan for .mp4 / .dav
  const getAllVideoFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        results = results.concat(getAllVideoFiles(filePath));
      } else if (filePath.endsWith(".mp4") || filePath.endsWith(".dav")) {
        results.push(filePath);
      }
    });
    return results;
  };

  const videoFiles = getAllVideoFiles(selectedPath);

  // Add to BullMQ
  for (const videoPath of videoFiles) {
    await videoQueue.add("processVideo", {
      videoPath,
      fileName: path.basename(videoPath),
    });
  }

  return videoFiles;
});

// ✅ Background Worker (runs with Electron)
function startVideoWorker() {
  const worker = new Worker(
    "videoQueue",
    async (job) => {
      const { videoPath, fileName } = job.data;

      // Notify frontend when job is being processed
      if (mainWindow) {
        mainWindow.webContents.send("job-started", {
          fileName,
          videoPath,
        });
      }

      // Simulate processing delay
      await new Promise((res) => setTimeout(res, 1000));

      return {
        message: `✅ Processed: ${fileName}`,
      };
    },
    { connection: redisConnection }
  );

  worker.on("completed", (job, result) => {
    if (mainWindow) {
      mainWindow.webContents.send("job-completed", {
        fileName: job.data.fileName,
      });
    }
  });

  worker.on("failed", (job, err) => {
    if (mainWindow) {
      mainWindow.webContents.send("job-failed", {
        fileName: job.data.fileName,
        error: err.message,
      });
    }
  });
}

  
