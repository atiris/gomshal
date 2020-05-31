export = {};

// html fronend
const ipc = require('electron').ipcRenderer;

const conf = {
  login: '',
  password: '',
  googleMapsUrl: '',
  loggedInSelector: '',
  loggedOutSelector: '',
  loginSelector: '',
  loginNextButtonSelector: '',
  passwordSelector: '',
  passwordNextButtonSelector: '',
  headless: true,
  hideAfterLogin: false,
  showDevTools: false,
  detectionTimeout: 0,
  minimumCacheTime: 0,
};

function addLog(text: string): void {
  const log = document.getElementById('log');
  log.innerHTML += text;
  log.scrollIntoView({ block: 'end', inline: 'end' });
}

ipc.on('rendererAction', function (_event: unknown, data: { type: string; text?: string; data?: unknown }) {
  addLog('<br>' + data.type + (data.text ? ': ' + data.text : ''));
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

document.getElementById('gomshal-close')
  .addEventListener('click', () => {
    ipc.send('gomshalClose');
  });

