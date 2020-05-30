# gomshal

 Extracts Shared locations from Google Maps to json object *(replacement for official missing api for shared location)* as node.js library. As this is not an official api, it requires to log in to a google account with a **username and password**. 👨‍👩‍👧‍👦 🔎 🌍

## Install

🔽 Download using npm: `npm install gomshal --save`

### Npm ignore scripts flag

❗️ Enabling npm scripts is necessary to install `playwright`. Using npm scripts, browsers are installed which can then be controlled automatically.

If you have set `npm config get ignore-scripts` to true, you will not be able to use npm run commands even you specify `--ignore-scripts=false`. This is because npm-run-all is used when running commands and this tool not forward npm ignore-scripts flag. You can disable ignore scripts with `npm config set ignore-scripts false`. If you want to only install after repository clone, you can call ignore script only temporary for that install with `npm install --ignore-scripts=false`.

## Usage

👅 Typescript

```typescript
import { Gomshal } from 'gomshal';

```

## Demo

👀 There is an [Electron](<https://www.electronjs.org/>) demo inside this monorepo. You can run it using this steps:

- clone this repository `git clone https://github.com/atiris/gomshal.git`,
- open it `cd gomshal` and run `npm install`
- start `npm run demo`

## Development

🔽 Clone this repository `git clone https://github.com/atiris/gomshal.git`, `cd gomshal` and run `npm install`.

### How does this library work

❓ Since 2020 Google require javascript to log in. So we need full browser support for using Google Maps. For that reason I tried to use a [puppeteer](<https://pptr.dev/>). However, this library has trouble enabling login because Google can effectively identify browser control and declare such a browser unsuitable for login. I use [playwright](<https://playwright.dev/>) instead. This project has a similar focus, and so far allows for automated login.

Dependency instalation: `npm i playwright --save`

### Windows

It may be necessary to run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned` in powershell console (as Administrator).

## Publishing

### Npm

Build: `tsc` and then run for:
Initial library publishing `npm publish`
Bugfix or patch: `npm version patch`
New features: `npm version minor`
Breaking changes: `npm version major`

## Notes

Based on [node-google-shared-locations](<https://github.com/Vaelek/node-google-shared-locations>) repository. Which I could no longer simply modify without significant modifications in the library architecture.
