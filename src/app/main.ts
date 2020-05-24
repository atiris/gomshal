// electron backend
import { app, BrowserWindow, ipcMain } from 'electron';

import { BrowserVisibility, Gomshal, GomshalInputs, GomshalSettings } from './../lib';

let gomshal: Gomshal;
let win: BrowserWindow;

function createWindow(): void {
  win = new BrowserWindow({
    width: 900,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
  // win.webContents.openDevTools();
}

function gomshalConstructor(): void {
  const gomshalSettings: GomshalSettings = {
    browserVisibility: BrowserVisibility.Visible,
    showDevTools: true,
  };
  gomshal = new Gomshal(gomshalSettings);
  win.webContents.send('rendererAction', 'initialized');
}

function getSharedLocations(): void {
  const gomshalInputs: GomshalInputs = {};
  gomshal.getSharedLocation(gomshalInputs);
  win.webContents.send('rendererAction', 'shared-location');
}

ipcMain.on('gomshalConstructor', function () {
  gomshalConstructor();
});

// full version: function(event, data) { ... }
ipcMain.on('getSharedLocations', function () {
  getSharedLocations();
});

app.whenReady()
  .then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
});
