import { BrowserContext, firefox, Page } from 'playwright';

import { defaultSettings, GomshalData, GomshalInputs, GomshalLocation, GomshalSettings } from './interfaces';
import { BrowserVisibility, GomshalState } from './enums';

export class Gomshal {
  private browserContext: BrowserContext;
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

  public async stealthTest(): Promise<void> {
    const brco = await firefox.launchPersistentContext('./.userdata', {
      headless: false,
    });
    const pg = await brco.newPage();
    await pg.goto('https://bot.sannysoft.com');
    setTimeout(async () => {
      await pg.goto('https://maps.google.com');
      brco.close();
    }, 60000);
  }

  private async openBrowser(): Promise<GomshalState> {
    this.browserContext = await firefox.launchPersistentContext('./.userdata', {
      headless: this.gomshalSettings.browserVisibility === BrowserVisibility.Hidden,
    });
    this.page = await this.browserContext.newPage();
    const pages = this.browserContext.pages();
    if (pages.length > 0) {
      this.page = pages[0];
      if (pages.length > 1) { pages[1].close(); }
    } else {
      this.page = await this.browserContext.newPage();
    }
    return GomshalState.GoogleMapsNotConnected;
  }

  private async connectGoogleMaps(): Promise<GomshalState> {
    await this.page.goto(this.gomshalSettings.googleMapsUrl, { waitUntil: 'networkidle' });
    const loginElement = await this.page.$(this.gomshalSettings.loginSelector);
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
    await this.page.waitForSelector(this.gomshalSettings.loginSelector, { timeout: this.gomshalSettings.detectionTimeout });
    await this.setInput(this.gomshalSettings.loginSelector, this.inputs.login);
    await this.clickElement(this.gomshalSettings.loginNextButtonSelector);

    await this.page.waitForSelector(this.gomshalSettings.passwordSelector, { timeout: this.gomshalSettings.detectionTimeout });
    await this.setInput(this.gomshalSettings.passwordSelector, this.inputs.password);
    await this.clickElement(this.gomshalSettings.passwordNextButtonSelector);

    // wait for element id div#profileIdentifier
    // if there is one, then 2fa is required

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
