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
    this._state = GomshalState.Closed;
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
    if (this._state === GomshalState.Closed) {
      this._state = await this.openBrowser();
    }
    if (this._state === GomshalState.GoogleMapsNotConnected) {
      this._state = await this.connectGoogleMaps();
    }
    if (this._state === GomshalState.LoginRequired) {
      this._state = await this.login();
    }

    /*
    // d.hG
    var Jxe = function (a, b, c) {
      c = void 0 === c ? 2 : c;
      a.ka || (a.ka = _.ry(a.Ma, {
        callback: b.callback(function () {
          a.ka = null;
          var d = a.T.get();
          a.Na(b);
          for (var f = new _.HK, g = 0; g < d.hG.length; g++) {
            var h = d.hG[g];
    */

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
    // this.page = await this.browserContext.newPage();
    const pages = this.browserContext.pages();
    if (pages.length > 0) {
      this.page = pages[0];
      // if (pages.length > 1) { pages[1].close(); }
    } else {
      this.page = await this.browserContext.newPage();
    }
    return GomshalState.GoogleMapsNotConnected;
  }

  private async connectGoogleMaps(): Promise<GomshalState> {
    await this.page.goto(this._configuration.googleMapsUrl, { waitUntil: 'networkidle' });
    // this.page.waitForEvent('response');
    this.page.on('response', (response: Response): void => {
      console.log(response);
      if (response.status() === 200) {
        this.newSharedLocations({ state: GomshalState.Ok, locations: [] });
      }
    });
    const loginElement = await this.page.$(this._configuration.loginSelector);
    if (loginElement) {
      return GomshalState.LoginRequired;
    } else {
      return GomshalState.LoggedIn;
    }
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

  private async login(): Promise<GomshalState> {
    await this.page.waitForSelector(this._configuration.loginSelector, { timeout: this._configuration.detectionTimeout });
    await this.setInput(this._configuration.loginSelector, this._configuration.login);
    await this.clickElement(this._configuration.loginNextButtonSelector);

    await this.page.waitForSelector(this._configuration.passwordSelector, { timeout: this._configuration.detectionTimeout });
    await this.setInput(this._configuration.passwordSelector, this._configuration.password);
    await this.clickElement(this._configuration.passwordNextButtonSelector);

    return GomshalState.LoggedIn;
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
