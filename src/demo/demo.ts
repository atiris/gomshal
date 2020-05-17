import { app, BrowserWindow } from 'electron';

function createWindow (): void {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

/*
import { Gomshal, GomshalSettings, Step } from './../lib/index';

const gomshal = new Gomshal();
const gomshalSettings: GomshalSettings = {
  'nextStep': Step.OpenBrowser,
}
gomshal.initialize(gomshalSettings);
*/
