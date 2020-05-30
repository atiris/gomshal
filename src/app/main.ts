// electron backend
import { app, BrowserWindow, ipcMain } from 'electron';

import { BrowserVisibility, Gomshal, GomshalInputs, GomshalSettings } from './../lib';

let gomshal: Gomshal;
let win: BrowserWindow;

function createWindow(): void {
  win = new BrowserWindow({
    width: 900,
    height: 750,
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
  win.webContents.send('rendererAction', { type: 'initialized' });
}

async function gomshalGetSharedLocations(inputs: GomshalInputs): Promise<void> {
  const gomshalData = await gomshal.getSharedLocations(inputs);
  console.log(gomshalData);

  win.webContents.send('rendererAction', { type: 'shared-location', gomshalData: gomshalData });
}

async function gomshalClose(): Promise<void> {
  await gomshal.close();
  gomshal = null;
  win.webContents.send('rendererAction', { type: 'closed' });
}

async function stealthTest(): Promise<void> {
  await gomshal.stealthTest();
  win.webContents.send('rendererAction', { type: 'stealth-test' });
}

ipcMain.on('gomshalConstructor', function () {
  gomshalConstructor();
});

ipcMain.on('gomshalGetSharedLocations', function (event, inputs) {
  console.log(event);
  gomshalGetSharedLocations(inputs);
});

ipcMain.on('gomshalClose', function () {
  gomshalClose();
});

ipcMain.on('stealthTest', function () {
  stealthTest();
});

app.whenReady()
  .then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
});
