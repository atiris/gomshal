// electron backend
import { app, BrowserWindow, ipcMain } from 'electron';

import { Gomshal, GomshalConfiguration, GomshalWaitingFor } from './../lib';

let gomshal: Gomshal;
let win: BrowserWindow;

function createWindow(): void {
  win = new BrowserWindow({
    width: 900,
    height: 650,
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

async function gomshalInitialize(gConfiguration: GomshalConfiguration): Promise<void> {
  if (gomshal) {
    const state: GomshalWaitingFor = await gomshal.initialize(gConfiguration);
    if (Object.keys(gConfiguration).length > 0) {
      win.webContents.send('rendererAction', { type: 'initialize', text: 'const conf: GomshalConfiguration = {...};' });
      win.webContents.send('rendererAction', { type: 'initialize', text: 'const state: GomshalState = gomshal.initialize(conf);' });
    } else {
      win.webContents.send('rendererAction', { type: 'initialize', text: 'const state = gomshal.initialize();' });
    }
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

    win.webContents.send('rendererAction', { type: 'sharedLocations', text: 'lastLocations === ' + lastLocationsText + ';', lastLocations: lastLocations });
  } else {
    win.webContents.send('rendererAction', { type: 'sharedLocations', text: '// no gomshal instance, please call new Gomshal()' });
  }
}

async function gomshalOnSharedLocationsLog(): Promise<void> {
  if (gomshal) {
    win.webContents.send('rendererAction', { type: 'onSharedLocations', text: 'gomshal.onSharedLocations(console.log);' });

    gomshal.onSharedLocations((data) => {
      console.log(data);
      win.webContents.send('rendererAction', { type: 'log', text: 'timestamp: ' + data.timestamp + ' state: ' + data.state + (data.error ? ' error: ' + data.error : '') + ' locations.lenght: ' + data.locations?.length, lastLocations: data });
    });
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
    await gomshal.close();
    gomshal = null;
    win.webContents.send('rendererAction', { type: 'close', text: 'await gomshal.close();' });
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
