# gomshal

<img align="left" src="assets/logo.png" height="50px">
Extracts Shared locations from Google Maps 🌍🔎👨‍👩‍👧‍👦 to JSON for Node.js.
There is not an official api for Shared locations by Google, so it requires _full username and password for Google_ account.

## Install

💾 npm: `npm install gomshal --save`

### Npm ignore scripts flag

❗️ Enabling npm scripts is necessary to install `playwright`. Using npm scripts, browsers are installed which can then be controlled automatically.

If you have set `npm config get ignore-scripts` to true, you will not be able to use npm run commands even you specify `--ignore-scripts=false`. This is because npm-run-all is used when running commands and this tool not forward npm ignore-scripts flag. You can disable ignore scripts with `npm config set ignore-scripts false`. If you want to only install after repository clone, you can call ignore script only temporary for that install with `npm install --ignore-scripts=false`.

## Usage

🔧 Typescript minimal usage sample (if credentials are already set)

```typescript
import { Gomshal } from 'gomshal';

const gomshal: Gomshal = new Gomshal();
gomshal.initialize();
gomshal.onLocations(console.log);
```

🔧 Typescript full example of usage with custom configuration and callback on new shared locations data detected

```typescript
import { Gomshal, GConfiguration, GState } from 'gomshal';

async startGomshal() {
  // create new instance
  const gomshal: Gomshal = new Gomshal();
  // you can change any configuration parameter if you need
  const customConfiguration: GConfiguration = {headless: false, showDevTools: true};
  // initialize with custom configuration
  let state: GState = await gomshal.initialize(customConfiguration);
  // if state is login and password required then do specific steps to get shared locations data
  if (state === GState.LoginAndPassword ) {
    // set login and password to configuration and initialize next step
    const credentialsConfiguration: GConfiguration = {
      ...customConfiguration,
      ...{login: 'google@gmail.com', password: 'secretpassword'}
    };
    state = await gomshal.initialize(credentialsConfiguration);
  }
  // if 2FA confirmation on phone is required
  if (state === GState.TwoFactorConfirmation ) {
    // ask the user for confirmation on the phone (simulated by timeout)
    await new Promise(resolve => setTimeout(resolve, 60000));
    // and try again initialize without any other configuration
    state = await gomshal.initialize();
  }
  // catch any other error if you need
  // if state is LocationData then get last location data
  const locationData = gomshal.locations;
  // or set callback when new shared locations data are detected and print it to console
  gomshal.onLocations((locationData) => {
    for (let personIndex = 0; personIndex < locationData.entities?.length; personIndex++) {
      const entity = locationData.entities[personIndex];
      if (entity.position?.address != null) {
        console.log(entity.fullName + ': ' + entity.position?.address);
      }
    }
  });
}
startGomshal();
```

## Demo

💻 There is an beautifull 🌈 [Electron](<https://www.electronjs.org/>) demo inside this monorepo. You can run it using this steps:

- clone this repository `git clone https://github.com/atiris/gomshal.git`,
- open it `cd gomshal` and run `npm install` (*ignore-scripts npm config must be set to false*)
- start `npm run demo`

<!-- TODO: Screenshot -->

## Development

💼 Clone this repository `git clone https://github.com/atiris/gomshal.git`, `cd gomshal` and run `npm install`.

### How does this library work

❓ Since 2020 Google require javascript to log in. So we need full browser support for using Google Maps (or get cookies in another way). For that reason I tried to use a [puppeteer](<https://pptr.dev/>). However, this library has trouble enabling login because Google can effectively identify browser control and declare such a browser unsuitable for login. Now I use [playwright](<https://playwright.dev/>) instead. This project has a similar focus, and so far allows for automated login without detection from Google.

❗️ Dependency instalation: `npm i playwright --save` has tens of megabytes and requires a full browser to run.

### Windows development

It may be necessary to run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned` in powershell console (as Administrator).

## Notes

### Publishing to npm

1. Build typescript library: `tsc -p tsconfig.lib.json`
2. Test before publish
   - create package: `npm pack`
   - move created package to npmtest directory: `mv gomshal-1.0.0.tgz npmtest\`
   - create package json in this directory and set some defaults
   - try install npm package from file: `npm i gomshal-1.0.0.tgz`
3. Login to npm: `npm login`
4. Initial library publishing `npm publish`
5. Fix
   - bugfix or patch: `npm version patch`
   - features: `npm version minor`  
   - breaking changes: `npm version major`  

### Background

📝 I was inspired by the [node-google-shared-locations](<https://github.com/Vaelek/node-google-shared-locations>) repository in which I am a contributor. I could no longer simply modify this library without significantly affecting the core library architecture, so I created a new one from the very beginning. Compared to the previous library, this library contains significant expansions, but it is also larger and more resource-intensive.

Created in Slovakia 🇸🇰
