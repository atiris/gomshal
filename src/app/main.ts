// electron backend
import { app, BrowserWindow, ipcMain } from 'electron';

import { Gomshal, Step } from './../lib';

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
  win.webContents.openDevTools();
}

function gomshalInitialize(): void {
  const g = new Gomshal();
  g.initialize({ nextStep: Step.OpenBrowser });
}

ipcMain.on('mainAction', function (_event, data) {
  _event.sender.send('rendererAction', 'xyz ' + data.text);
  gomshalInitialize();
});

app.whenReady()
  .then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
});
