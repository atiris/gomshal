// electron backend
import { app, BrowserWindow, ipcMain } from 'electron';

import { GConfiguration, GError, GLocations, Gomshal, GState } from './../lib';

let gomshal: Gomshal;
let win: BrowserWindow;

function createWindow(): void {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
  // win.webContents.openDevTools();
}

function gomshalConstructor(): void {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'constructor', text: '// gomshal instance already exists, call close first' });
  } else {
    gomshal = new Gomshal();
    win.webContents.send('rendererAction', { type: 'constructor', text: 'gomshal = new Gomshal();' });
  }
}

async function gomshalInitialize(gConfiguration: GConfiguration): Promise<void> {
  if (gomshal) {
    if (Object.keys(gConfiguration).length > 0) {
      win.webContents.send('rendererAction', { type: 'initialize', text: 'conf: GConfiguration = {...};' });
      win.webContents.send('rendererAction', { type: 'initialize', text: 'step: GState = gomshal.initialize(conf);' });
    } else {
      win.webContents.send('rendererAction', { type: 'initialize', text: 'step: GState = gomshal.initialize();' });
    }

    await gomshal.initialize(gConfiguration);
  } else {
    win.webContents.send('rendererAction', { type: 'initialize', text: '// no gomshal instance, please call new Gomshal()' });
  }
}

function gomshalConfiguration(): GConfiguration {
  if (gomshal) {
    return gomshal.configuration;
  } else {
    const temporary: Gomshal = new Gomshal();
    const conf: GConfiguration = temporary.configuration;
    temporary.close();
    return conf;
  }
}

async function gomshalSharedLocations(): Promise<void> {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'locations', text: 'locations: GLocations = gomshal.locations;' });

    const lastLocations = gomshal.locations;
    const lastLocationsText = JSON.stringify(lastLocations);

    win.webContents.send('rendererAction', { type: 'log', text: lastLocationsText });
  } else {
    win.webContents.send('rendererAction', { type: 'locations', text: '// no gomshal instance, please call new Gomshal()' });
  }
}

function locationsToLog(data: GLocations): void {
  let log = '//';
  log += ' timestamp: ' + data.timestamp;
  log += ' | state: ' + GState[data.state];
  log += ' | error: ' + GError[data.error];
  win.webContents.send('rendererAction', { type: 'newLocations', text: log.trim() });

  for (let personIndex = 0; personIndex < data.entities?.length; personIndex++) {
    log = '// ';
    const entity = data.entities[personIndex];
    if (entity.position?.address != null) {
      log += ' ' + entity.fullName + ': ' + entity.position?.address;
    }
    win.webContents.send('rendererAction', { type: 'data', text: log.trim() });
  }

}

async function gomshalOnSharedLocationsLog(): Promise<void> {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'onLocations', text: 'gomshal.onLocations(console.log);' });
    gomshal.onLocations(locationsToLog);
  } else {
    win.webContents.send('rendererAction', { type: 'onLocations', text: '// no gomshal instance, please call new Gomshal()' });
  }
}

async function gomshalOnSharedLocationsUndefined(): Promise<void> {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'onLocations', text: 'gomshal.onLocations();' });
    gomshal.onLocations();
    win.webContents.send('rendererAction', { type: 'onLocations', text: '// callback function on new locations removed' });
  } else {
    win.webContents.send('rendererAction', { type: 'onLocations', text: '// no gomshal instance, please call new Gomshal()' });
  }
}

async function gomshalClose(): Promise<void> {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'close', text: 'await gomshal.close();' });
    await gomshal.close();
    gomshal = null;
    win.webContents.send('rendererAction', { type: 'closed', text: '// browser and page is closed, gomshal instance is set to null' });
  } else {
    win.webContents.send('rendererAction', { type: 'close', text: '// gomshal instance not initialized' });
  }
}

ipcMain.on('gomshalInitialize', function (_event, gConfiguration: GConfiguration
) {
  gomshalInitialize(gConfiguration);
});

ipcMain.on('gomshalConstructor', function () {
  gomshalConstructor();
});

ipcMain.handle('gomshalConfiguration', async function () {
  const configuration = gomshalConfiguration();
  return configuration;
});

ipcMain.on('gomshalSharedLocations', function () {
  gomshalSharedLocations();
});

ipcMain.on('gomshalOnSharedLocationsLog', function () {
  gomshalOnSharedLocationsLog();
});

ipcMain.on('gomshalOnSharedLocationsUndefined', function () {
  gomshalOnSharedLocationsUndefined();
});

ipcMain.on('gomshalClose', function () {
  gomshalClose();
});

app.whenReady()
  .then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
});
