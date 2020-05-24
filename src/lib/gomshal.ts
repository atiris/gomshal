import { Browser, launch, Page } from 'puppeteer';

import { defaultSettings, GomshalData, GomshalInputs, GomshalLocation, GomshalSettings } from './interfaces';
import { GomshalState } from './enums';



export class Gomshal {
  private browser: Browser;
  private page: Page;

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

  public async getSharedLocation(inputs: GomshalInputs): Promise<GomshalData> {
    if (this._state === GomshalState.Closed) {
      this._state = await this.openBrowser(inputs);
    }
    if (this._state === GomshalState.GoogleMapsNotConnected) {
      this._state = await this.connectGoogleMaps(inputs);
    }


    return { state: this._state, locations: this._locations };
  }

  private async openBrowser(inputs: GomshalInputs): Promise<GomshalState> {
    this.browser = await launch({
      headless: !this.gomshalSettings.browserVisibility,
      devtools: this.gomshalSettings.showDevTools || false,
    });
    this.page = await this.browser.newPage();
    return GomshalState.GoogleMapsNotConnected;
  }

  private async connectGoogleMaps(inputs: GomshalInputs): Promise<GomshalState> {
    await this.page.goto(this.gomshalSettings.googleMapsUrl, { waitUntil: 'networkidle2' });
    // detect login window
    const loginElement = await this.page.$('[todo-element-identity]');
    if (loginElement) {
      return GomshalState.LoginRequired;
    } else {
      return GomshalState.LoggedIn;
    }
  }

  public async close(): Promise<void> {
    if (this.browser) {
      this.browser.close;
    }
  }
}
