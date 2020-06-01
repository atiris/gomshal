import { BrowserContext, firefox, Page, Response } from 'playwright';

import { defaultConfiguration, GomshalConfiguration, GomshalData, GomshalLocation } from './interfaces';
import { GomshalState } from './enums';

export class Gomshal {
  private browserContext: BrowserContext;
  private page: Page;

  private _callback: (data: GomshalData) => void;

  private _configuration: GomshalConfiguration;
  public get configuration(): GomshalConfiguration {
    return {
      ...this._configuration,
      ...{
        login: undefined,
        loginSet: this._configuration.login !== undefined,
        password: undefined,
        passwordSet: this._configuration.password !== undefined,
      },
    };
  }

  private _state: GomshalState;
  public get state(): GomshalState {
    return this._state;
  }

  private _locations: GomshalLocation[];
  public get locations(): GomshalLocation[] {
    return this._locations;
  }

  private _data: GomshalData;
  public get data(): GomshalData {
    return this._data;
  }

  public constructor() {
    this._configuration = defaultConfiguration;
    this._state = GomshalState.BrowserClosed;
  }

  public async onSharedLocations(callback: (data: GomshalData) => void): Promise<void> {
    this._callback = callback;
  }

  private newSharedLocations(data: GomshalData): void {
    if (this._callback) { this._callback(data); }
  }

  public async initialize(customConfiguration?: GomshalConfiguration): Promise<GomshalState> {
    // update configuration if new configuration is set as input argument
    if (customConfiguration !== undefined) {
      this._configuration = { ...defaultConfiguration, ...customConfiguration };
    }
    // initialize browser
    if (this._state === GomshalState.BrowserClosed) {
      this._state = await this.openBrowser();
    }
    if (this._state === GomshalState.GoogleMapsLoadingError) {
      this._state = await this.loadGoogleMaps();
    }
    if (this._state === GomshalState.LoginEvaluation) {
      this._state = await this.loginEvaluation();
    }
    if (this._state === GomshalState.LoginRequired) {
      this._state = await this.login();
    }

    // if injection is needed, this piece of code contains the part where
    // the shared position is processed. The data are in the parameter `d.hG`
    // var Jxe = function (a, b, c) {
    //   c = void 0 === c ? 2 : c;
    //   a.ka || (a.ka = _.ry(a.Ma, {
    //     callback: b.callback(function () {
    //       a.ka = null;
    //       var d = a.T.get();
    //       a.Na(b);
    //       for (var f = new _.HK, g = 0; g < d.hG.length; g++) {
    //         var h = d.hG[g];

    return this._state;
  }

  public async sharedLocations(): Promise<GomshalData> {
    if (this._state !== GomshalState.Ok) {
      return undefined;
    } else {
      // TODO: get last shared locations
      return { state: this._state, locations: this._locations };
    }
  }

  private async openBrowser(): Promise<GomshalState> {
    this.browserContext = await firefox.launchPersistentContext('./.userdata', {
      headless: !!this._configuration.headless,
    });
    const pages = this.browserContext.pages();
    if (pages.length > 0) {
      this.page = pages[0];
    } else {
      this.page = await this.browserContext.newPage();
    }
    return GomshalState.GoogleMapsLoadingError;
  }

  private async loadGoogleMaps(): Promise<GomshalState> {
    await this.page.goto(this._configuration.googleMapsUrl, { waitUntil: 'domcontentloaded' });
    this.page.on('response', async (response: Response): Promise<void> => {
      if (response.url().indexOf(this._configuration.locationSharingUrlSubstring) >= 0) {
        const body = await response.body();
        const bodyString = body.toString(undefined, this._configuration.locationSharingSkipResponseCharsStart)
          .replace(/[\n\r]+/g, '');
        console.log(bodyString);
        this.newSharedLocations({ state: GomshalState.Ok, locations: [] });
      }
    });

    return GomshalState.LoginEvaluation;
  }

  private async loginEvaluation(): Promise<GomshalState> {
    const lIn = this.page.waitForSelector(this._configuration.isLoggedInSelector)
      .then(() => { return 'isLoggedIn'; })
      .catch(() => 'loggedInDetectionError');
    const lOut = this.page.waitForSelector(this._configuration.isLoggedOutSelector)
      .then(() => { return 'isLoggedOut'; })
      .catch(() => 'loggedOutDetectionError');
    const time = new Promise((resolve) => { setTimeout(resolve, 10000, 'timeout'); });

    const first = await Promise.race([time, lIn, lOut]);
    if (first === 'isLoggedIn') {
      return GomshalState.Ok;
    } else if (first === 'isLoggedOut') {
      return GomshalState.LoginRequired;
    } else if (first === 'timeout') {
      return this._state;
    } else {
      return GomshalState.AuthenticationError;
    }
  }

  private async login(): Promise<GomshalState> {
    try {
      await this.page.waitForSelector(this._configuration.loginSelector, { timeout: this._configuration.detectionTimeout });
      await this.setInput(this._configuration.loginSelector, this._configuration.login);
      await this.clickElement(this._configuration.loginNextButtonSelector);

      await this.page.waitForSelector(this._configuration.passwordSelector, { timeout: this._configuration.detectionTimeout });
      await this.setInput(this._configuration.passwordSelector, this._configuration.password);
      await this.clickElement(this._configuration.passwordNextButtonSelector);
    } catch {
      return this._state;
    }
    return GomshalState.LoginEvaluation;
  }

  private async setInput(selector: string, value: string): Promise<void> {
    if (!value) { return; }
    await this.page.evaluate((data) => {
      const element = document.querySelector(data.selector);
      console.log('setting value for: ' + data.selector, element);
      if (element && (element instanceof HTMLInputElement)) {
        (element as HTMLInputElement).value = data.value;
        // trigger change event
        const event = new Event('input', {
          'bubbles': true,
          'cancelable': true,
        });
        element.dispatchEvent(event);
        element.focus();
        // element.select();
      }
    }, { selector: selector, value: value });
  }

  private async clickElement(selector: string): Promise<void> {
    await this.page.evaluate((data) => {
      const element = document.querySelector(data.selector) as HTMLElement;
      if (element) {
        element.click();
      }
    }, { selector: selector });
  }

  public async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browserContext) {
      await this.browserContext.close();
    }
  }
}
