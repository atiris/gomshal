# gomshal

Extracts Shared locations from Google Maps to json object (replacement for official missing api for shared location) as node.js library. As this is not an official api, it requires to log in to a google account with a username and password.

## Development

Clone `git clone https://github.com/atiris/gomshal.git`, `cd gomshal` and run `npm install --ignore-scripts=false`.

### Windows

Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned` in powershell console (as Administrator).

### Puppeteer

Since 2020 Google Maps require javascript to open. So we need full browser support for log in. For that reason Puppeteer is used.

Instalation: `npm i puppeteer --save --ignore-scripts=false`

## Notes

Based on [node-google-shared-locations](<https://github.com/Vaelek/node-google-shared-locations>) repository.
