// electron backend
import { app, BrowserWindow, ipcMain } from 'electron';

import { Gomshal, GomshalConfiguration, GomshalWaitingFor, SharedLocations } from './../lib';

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
  win.webContents.openDevTools();
}

function gomshalConstructor(): void {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'constructor', text: '// gomshal instance already exists, call close first' });
  } else {
    gomshal = new Gomshal();
    win.webContents.send('rendererAction', { type: 'constructor', text: 'gomshal = new Gomshal();' });
  }
}

async function gomshalInitialize(gConfiguration: GomshalConfiguration): Promise<void> {
  if (gomshal) {
    if (Object.keys(gConfiguration).length > 0) {
      win.webContents.send('rendererAction', { type: 'initialize', text: 'const conf: GomshalConfiguration = {...};' });
      win.webContents.send('rendererAction', { type: 'initialize', text: 'const state: GomshalState = gomshal.initialize(conf);' });
    } else {
      win.webContents.send('rendererAction', { type: 'initialize', text: 'const state = gomshal.initialize();' });
    }

    const state: GomshalWaitingFor = await gomshal.initialize(gConfiguration);

    win.webContents.send('rendererAction', { type: 'state', text: 'state === ' + GomshalWaitingFor[state] + ';' });
  } else {
    win.webContents.send('rendererAction', { type: 'initialize', text: '// no gomshal instance, please call new Gomshal()' });
  }
}

function gomshalConfiguration(): GomshalConfiguration {
  if (gomshal) {
    return gomshal.configuration;
  } else {
    const temporary: Gomshal = new Gomshal();
    const conf: GomshalConfiguration = temporary.configuration;
    temporary.close();
    return conf;
  }
}

async function gomshalSharedLocations(): Promise<void> {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'sharedLocations', text: 'lastLocations: SharedLocations = gomshal.sharedLocations;' });

    const lastLocations = gomshal.sharedLocations;
    const lastLocationsText = JSON.stringify(lastLocations);

    win.webContents.send('rendererAction', { type: 'lastLocations', text: lastLocationsText });
  } else {
    win.webContents.send('rendererAction', { type: 'sharedLocations', text: '// no gomshal instance, please call new Gomshal()' });
  }
}

function sharedLocationsToLog(data: SharedLocations): void {
  let log = '';
  log += ' timestamp: ' + data.timestamp;
  log += ' state: ' + GomshalWaitingFor[data.state];

  for (let personIndex = 0; personIndex < data.locations?.length; personIndex++) {
    const person = data.locations[personIndex];
    if (person.address != null) {
      log += ' | ' + person.fullName + ': ' + person.address;
    }
  }

  win.webContents.send('rendererAction', { type: 'log', text: log.trim() });
}

async function gomshalOnSharedLocationsLog(): Promise<void> {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'onSharedLocations', text: 'gomshal.onSharedLocations(console.log);' });

    gomshal.onSharedLocations(sharedLocationsToLog);
  } else {
    win.webContents.send('rendererAction', { type: 'onSharedLocations', text: '// no gomshal instance, please call new Gomshal()' });
  }
}

async function gomshalOnSharedLocationsUndefined(): Promise<void> {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'onSharedLocations', text: 'gomshal.onSharedLocations();' });
    gomshal.onSharedLocations();
  } else {
    win.webContents.send('rendererAction', { type: 'onSharedLocations', text: '// no gomshal instance, please call new Gomshal()' });
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

ipcMain.on('gomshalInitialize', function (_event, gConfiguration: GomshalConfiguration
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
