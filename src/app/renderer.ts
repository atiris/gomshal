// html fronend
const ipc = require('electron').ipcRenderer;

ipc.once('rendererAction', function(_event, data) {
  document.getElementById('log').innerHTML = data;
});

document.getElementById('gomshal-constructor')
  .addEventListener('click', () => {
    ipc.send('gomshalConstructor', { text: 'abc' });
  });

export = {};
