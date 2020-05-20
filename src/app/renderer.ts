// html fronend
const ipc = require('electron').ipcRenderer;

ipc.once('rendererAction', function(_event, data) {
  document.getElementById('log').innerHTML = data;
});

document.getElementById('gomshal-initialize')
  .addEventListener('click', () => {
    ipc.send('mainAction', { text: 'abc' });
  });

export = {};
