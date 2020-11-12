export = {};

// html fronend
const ipc = require('electron').ipcRenderer;

// TODO: send conf structure from main.ts backend on request
const conf = {
  login: '',
  password: '',
  ownerPhotoUrl: '',
  ownerFullName: '',
  ownerShortName: '',
  googleMapsUrl: 'https://www.google.com/maps/',
  googleMapsLoadedUrlSubstring: 'google.com/maps/',
  ownerUrlSubstring: '/locationhistory/preview/mas',
  locationSharingUrlSubstring: '/maps/rpc/locationsharing/read',
  ownerResponseSkipStartFix: 4,
  locationSharingResponseSkipStartFix: 4,
  logoutButtonSelector: 'a[href*="SignOut"]',
  loginButtonSelector: 'a[href*="ServiceLogin"]',
  googleAccountUseAnotherAccountButtonSelector: 'li:nth-child(2) div[role="link"]',
  googleAccountEmailInputSelector: 'input[type="email"]',
  googleAccountEmailNextButtonSelector: 'div[role=button][id]',
  googleAccountPasswordInputSelector: 'input[type="password"]',
  googleAccountPasswordNextButtonSelector: 'div[role=button][id]',
  googleAccountTwoFactorWaitingUrlSubstring: 'accounts.google.com/signin/v2/challenge',
  headless: true,
  hideAfterLogin: false,
  showDevTools: false,
  detectionTimeout: 15000,
  distanceForMovementMinMeters: 50,
  extended: true,
  extendedLocationsHistoryMinMinutes: 1440,
  extendedLocationsHistoryMinSegments: 10,
  extendedStopMinTimeMinutes: 5,
  parserPathTimestamp: '8',
  parserPathPersons: '0',
  parserPathPersonId: '6.0',
  parserPathPersonFullName: '6.2',
  parserPathPersonShortName: '6.3',
  parserPathPersonPhotoUrl: '6.1',
  parserPathPersonLocationData: '1',
  parserPathOwnerFullName: '16.0',
  parserPathOwnerShortName: '',
  parserPathOwnerPhotoUrl: '16.1.6.0',
  parserPathLocationDataLongitude: '1.1',
  parserPathLocationDataLatitude: '1.2',
  parserPathLocationDataTimestamp: '2',
  parserPathLocationDataAddress: '4',
  parserPathLocationDataCountry: '6',
  parserPathOwnerData: '9',
  parserPathOwnerLocationTimestamp: '1.2',
  parserPathOwnerLocationLongitude: '1.1.1',
  parserPathOwnerLocationLatitude: '1.1.2',
  parserPathOwnerLocationAddress: '1.4',
  parserPathOwnerLocationCountry: '1.6',
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
    (document.getElementById('gomshal-configuration-json') as HTMLInputElement).value = '{"login":"","password":""}';
  });

document.getElementById('gomshal-configuration-test')
  .addEventListener('click', () => {
    (document.getElementById('gomshal-configuration-json') as HTMLInputElement).value = '{"login":"","password":"","headless":false,"showDevTools":true}';
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

