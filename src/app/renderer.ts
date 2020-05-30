import { GomshalData } from './../lib';

// html fronend
const ipc = require('electron').ipcRenderer;

ipc.once('rendererAction', function (_event, data: { type: string; data?: GomshalData }) {
  document.getElementById('log').innerHTML = data.type;
});

document.getElementById('gomshal-settings-empty')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-settings-json') as HTMLInputElement).value = '{ }';
  });

document.getElementById('gomshal-settings-all')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-settings-json') as HTMLInputElement).value = '{ "googleMapsUrl": "", "loginSelector": "", "loginNextButtonSelector": "", "passwordSelector": "", "passwordNextButtonSelector": "", "browserVisibility": 0, "showDevTools": false, "detectionTimeout": 0, "minimumCacheTime": 0 }';
  });

document.getElementById('gomshal-settings-visible-devtools')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-settings-json') as HTMLInputElement).value = '{ "browserVisibility": 2, "showDevTools": True }';
  });

document.getElementById('gomshal-settings')
  .addEventListener('click', () => {
    const jst = (document.getElementById('gomshal-setting-json') as HTMLInputElement).value;
    const gs = JSON.parse(jst);
    ipc.send('gomshalSettings', gs);
  });

document.getElementById('gomshal-constructor')
  .addEventListener('click', () => {
    ipc.send('gomshalConstructor');
  });

document.getElementById('gomshal-inputs-empty')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-inputs-json') as HTMLInputElement).value = '{ }';
  });

document.getElementById('gomshal-inputs-login-password')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-inputs-json') as HTMLInputElement).value = '{ "login": "", "password": "" }';
  });

document.getElementById('gomshal-settings')
  .addEventListener('click', () => {
    const jst = (document.getElementById('gomshal-setting-json') as HTMLInputElement).value;
    const gs = JSON.parse(jst);
    ipc.send('gomshalSettings', gs);
  });


document.getElementById('gomshal-get-shared-locations')
  .addEventListener('click', () => {
    const login = (document.getElementById('gomshal-login') as HTMLInputElement).value;
    const password = (document.getElementById('gomshal-password') as HTMLInputElement).value;
    ipc.send('gomshalGetSharedLocations', {
      login: login,
      password: password,
      // twoFactorAuthenticated: true,
    });
  });

document.getElementById('gomshal-close')
  .addEventListener('click', () => {
    ipc.send('gomshalClose');
  });

document.getElementById('stealth-test')
  .addEventListener('click', () => {
    ipc.send('stealthTest');
  });

export = {};
