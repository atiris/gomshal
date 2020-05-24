// electron backend
import { app, BrowserWindow, ipcMain } from 'electron';

import { BrowserVisibility, Gomshal, GomshalInputs, GomshalSettings } from './../lib';

function createWindow(): void {
  const win = new BrowserWindow({
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

function getSharedLocations(): void {
  const gomshalSettings: GomshalSettings = {
    browserVisibility: BrowserVisibility.Visible,
  };
  const gomshal = new Gomshal(gomshalSettings);
  const gomshalInputs: GomshalInputs = { };
  gomshal.getSharedLocation(gomshalInputs);
}

ipcMain.on('mainAction', function (_event, data) {
  _event.sender.send('rendererAction', 'xyz ' + data.text);
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
