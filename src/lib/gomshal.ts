import { Browser, launch, Page } from 'puppeteer';

import { defaultSettings, GomshalData, GomshalInputs, GomshalLocation, GomshalSettings } from './interfaces';
import { GomshalState } from './enums';

export class Gomshal {
  private browser: Browser;
  private page: Page;
  private inputs: GomshalInputs;

  private _gomshalSettings: GomshalSettings;
  public get gomshalSettings(): GomshalSettings {
    return this._gomshalSettings;
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

  public constructor(settings: GomshalSettings) {
    this._gomshalSettings = { ...defaultSettings, ...settings };
    this._state = GomshalState.Closed;
  }

  public async getSharedLocations(inputs: GomshalInputs = {}): Promise<GomshalData> {
    this.inputs = inputs;
    if (this._state === GomshalState.Closed) {
      this._state = await this.openBrowser();
    }
    if (this._state === GomshalState.GoogleMapsNotConnected) {
      this._state = await this.connectGoogleMaps();
    }
    if (this._state === GomshalState.LoginRequired) {
      this._state = await this.login();
    }

    return { state: this._state, locations: this._locations };
  }

  private async openBrowser(): Promise<GomshalState> {
    this.browser = await launch({
      headless: !this.gomshalSettings.browserVisibility,
      devtools: this.gomshalSettings.showDevTools || false,
    });
    const pages = await this.browser.pages();
    if (pages.length > 0) {
      this.page = pages[0];
    } else {
      this.page = await this.browser.newPage();
    }
    return GomshalState.GoogleMapsNotConnected;
  }

  private async connectGoogleMaps(): Promise<GomshalState> {
    await this.page.goto(this.gomshalSettings.googleMapsUrl, { waitUntil: 'networkidle2' });
    // detect login window
    const loginElement = await this.page.$(this.gomshalSettings.loginSelector);
    if (loginElement) {
      return GomshalState.LoginRequired;
    } else {
      return GomshalState.LoggedIn;
    }
  }

  private async login(): Promise<GomshalState> {
    await this.page.waitForSelector(this.gomshalSettings.loginSelector, { visible: true });
    await this.page.evaluate((data) => {
      const element = document.querySelector(data.selector);
      console.log('setting value for: ' + data.selector, element);
      if (element) {
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
    }, { selector: this.gomshalSettings.loginSelector, value: this.inputs.login });

    return GomshalState.LoggedIn;
  }

  public async close(): Promise<void> {
    if (this.browser) {
      this.browser.close;
    }
  }
}
