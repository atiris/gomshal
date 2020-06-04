export = {};

// html fronend
const ipc = require('electron').ipcRenderer;

// TODO: send conf structure from main.ts backend on request
const conf = {
  name: '',
  password: '',
  googleMapsUrl: '',
  locationSharingUrlSubstring: '',
  locationSharingResponseSkipStart: 0,
  isLoggedInSelector: '',
  isLoggedOutSelector: '',
  loginSelector: '',
  loginNextButtonSelector: '',
  passwordSelector: '',
  passwordNextButtonSelector: '',
  headless: true,
  hideAfterLogin: false,
  showDevTools: false,
  detectionTimeout: 10000,
  minimumCacheTime: 60000,
  parserPathTimestamp: '',
  parserPathPersons: '',
  parserPathMyData: '',
  parserPathPersonId: '',
  parserPathPersonPhotoUrl: '',
  parserPathPersonFullName: '',
  parserPathPersonShortName: '',
  parserPathPersonLocationData: '',
  parserPathLocationDataLongitude: '',
  parserPathLocationDataLatitude: '',
  parserPathLocationDataTimestamp: '',
  parserPathLocationDataAddress: '',
  parserPathLocationDataCountry: '',
};

function addLog(type: string, content?: string): void {
  const log = document.getElementById('log');
  let insertHTML = '';
  insertHTML += '<div class ="log-item">';
  insertHTML += '<div class ="log-type type-' + type + '">' + type + '</div>';
  if (content != null) {
    insertHTML += '<div class ="log-content content-' + type;
    if (content.startsWith('//')) {
      insertHTML += ' comment';
    }
    insertHTML += '">' + content + '</div>';
  }
  insertHTML += '</div>';
  log.innerHTML += insertHTML;
  log.scrollIntoView({ block: 'end', inline: 'end' });
}

ipc.on('rendererAction', function (_event: unknown, data: { type: string; text?: string; data?: unknown }) {
  addLog(data.type, data.text);
});

document.getElementById('gomshal-constructor')
  .addEventListener('click', () => {
    ipc.send('gomshalConstructor');
  });

document.getElementById('gomshal-configuration-empty')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-configuration-json') as HTMLInputElement).value = '{}';
  });

document.getElementById('gomshal-configuration-login-password')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-configuration-json') as HTMLInputElement).value = '{"name":"","password":""}';
  });

document.getElementById('gomshal-configuration-visible-devtools')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-configuration-json') as HTMLInputElement).value = '{"headless":false,"showDevTools":true}';
  });

document.getElementById('gomshal-configuration-all')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-configuration-json') as HTMLInputElement).value = JSON.stringify(conf);
  });

document.getElementById('gomshal-initialize')
  .addEventListener('click', () => {
    const textareaValue = (document.getElementById('gomshal-configuration-json') as HTMLInputElement).value;
    const gConfiguration = JSON.parse(textareaValue);
    ipc.send('gomshalInitialize', gConfiguration);
  });

document.getElementById('gomshal-configuration')
  .addEventListener('click', async () => {
    const conf = await ipc.invoke('gomshalConfiguration');
    (document.getElementById('gomshal-configuration-json') as HTMLInputElement).value = JSON.stringify(conf);
  });

document.getElementById('gomshal-shared-locations')
  .addEventListener('click', () => {
    ipc.send('gomshalSharedLocations');
  });

document.getElementById('gomshal-on-shared-locations-log')
  .addEventListener('click', () => {
    ipc.send('gomshalOnSharedLocationsLog');
  });

document.getElementById('gomshal-on-shared-locations-undefined')
  .addEventListener('click', () => {
    ipc.send('gomshalOnSharedLocationsUndefined');
  });

document.getElementById('gomshal-close')
  .addEventListener('click', () => {
    ipc.send('gomshalClose');
  });

