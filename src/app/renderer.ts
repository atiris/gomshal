import { GomshalData } from './../lib';

// html fronend
const ipc = require('electron').ipcRenderer;

ipc.once('rendererAction', function (_event, data: { type: string; data?: GomshalData }) {
  document.getElementById('log').innerHTML = data.type;
});

document.getElementById('gomshal-constructor')
  .addEventListener('click', () => {
    ipc.send('gomshalConstructor');
  });

document.getElementById('gomshal-get-shared-locations')
  .addEventListener('click', () => {
    const login = (document.getElementById('gomshal-login') as HTMLInputElement).value;
    const password = (document.getElementById('gomshal-login') as HTMLInputElement).value;
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
