# gomshal

Extracts Shared locations from Google Maps to json object (replacement for official missing api for shared location) as node.js library. As this is not an official api, it requires to log in to a google account with a username and password.

## Puppeteer

Since 2020 Google Maps require javascript to open. So we need full browser support for log in. For that reason Puppeteer is used.

Instalation: `npm i puppeteer --save --ignore-scripts=false`

## Notes

### Windows development

Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned` in powershell console (as Administrator).
