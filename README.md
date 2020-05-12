# gomshal

Extracts Shared locations from Google Maps to json object (replacement for official missing api for shared location) as node.js library. As this is not an official api, it requires to log in to a google account with a username and password.

## Usage

`npm install gomshal --save`

## Development

Clone `git clone https://github.com/atiris/gomshal.git`, `cd gomshal` and run `npm install`.

### Git

To remember github credentials type `git config credential.helper store`.

### Npm ignore scripts flag

If you have set `npm config get ignore-scripts` to true, you will not be able to use npm run commands even you specify `--ignore-scripts=false`. This is because npm-run-all is used when running commands and this tool not forward npm ignore-scripts flag. You can disable ignore scripts with `npm config set ignore-scripts false`. If you want to only install after repository clone, you can call ignore script only temporary for that install with `npm install --ignore-scripts=false`.

### Windows

Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned` in powershell console (as Administrator).

### Puppeteer

Since 2020 Google Maps require javascript to open. So we need full browser support for log in. For that reason Puppeteer is used.

Instalation: `npm i puppeteer --save`

## Publishing

### Npm

Build: `tsc` and then run for:
Initial library publishing `npm publish`
Bugfix or patch: `npm version patch`
New features: `npm version minor`
Breaking changes: `npm version major`

## Notes

Based on [node-google-shared-locations](<https://github.com/Vaelek/node-google-shared-locations>) repository.
