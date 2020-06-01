import { BrowserContext, firefox, Page, Response } from 'playwright';

import { defaultConfiguration, GomshalConfiguration, SharedLocation, SharedLocations } from './interfaces';
import { GomshalError, GomshalWaitingFor } from './enums';

export class Gomshal {
  private browserContext: BrowserContext;
  private page: Page;

  private _callback: (data: SharedLocations) => void;

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

  private _state: GomshalWaitingFor;
  public get state(): GomshalWaitingFor {
    return this._state;
  }

  private _error: GomshalError;
  public get error(): GomshalError {
    return this._error;
  }

  private _locations: SharedLocation[];
  public get locations(): SharedLocation[] {
    return this._locations;
  }

  private _sharedLocations: SharedLocations;
  public get sharedLocations(): SharedLocations {
    return this._sharedLocations;
  }

  public constructor() {
    this._configuration = defaultConfiguration;
    this._state = GomshalWaitingFor.Initialize;
    this._error = GomshalError.NoError;
  }

  public async onSharedLocations(callback?: (data: SharedLocations) => void): Promise<void> {
    this._callback = callback;
  }

  private newSharedLocations(): void {
    if (this._callback !== undefined) {
      this._callback(this._sharedLocations);
    }
  }

  public async initialize(customConfiguration?: GomshalConfiguration): Promise<GomshalWaitingFor> {
    // update configuration if new configuration is set as input argument
    if (customConfiguration !== undefined) {
      this._configuration = { ...defaultConfiguration, ...customConfiguration };
    }
    // initialize browser
    if (this._state === GomshalWaitingFor.Initialize
      && this.browserContext === undefined
      && this.page === undefined) {
      await this.openBrowser();
      await this.openPage();
    }
    if (this._state === GomshalWaitingFor.Initialize) {
      await this.loadGoogleMapsPage();
      await this.evaluateGoogleMapsLoginState();
    }
    if (this._state === GomshalWaitingFor.LoginAndPassword) {
      await this.login();
    }
    if (this._state === GomshalWaitingFor.TwoFactorConfirmation) {
      await this.login();
    }
    if (this._state === GomshalWaitingFor.LocationData) {
      await this.subscribeForSharedLocationResponse();
    }

    return this._state;

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
  }

  public async createSharedLocations(): Promise<void> {
    this._sharedLocations = {
      ...{ state: this._state, timestamp: (new Date).toISOString() },
      ...(this._locations === undefined ? {} : { locations: this._locations }),
      ...(this._error === GomshalError.NoError ? {} : { error: this._error }),
    };
  }

  private async openBrowser(): Promise<boolean> {
    try {
      this.browserContext = await firefox.launchPersistentContext('./.userdata', {
        headless: !!this._configuration.headless,
      });
      return true;
    } catch {
      return false;
    }
  }

  private async openPage(): Promise<boolean> {
    try {
      const pages = this.browserContext.pages();
      if (pages.length > 0) {
        this.page = pages[0];
      } else {
        this.page = await this.browserContext.newPage();
      }
      return true;
    } catch {
      return false;
    }
  }

  private async loadGoogleMapsPage(): Promise<boolean> {
    try {
      await this.page.goto(this._configuration.googleMapsUrl, { waitUntil: 'domcontentloaded' });
      return true;
    } catch {
      return false;
    }
  }

  private async subscribeForSharedLocationResponse(): Promise<boolean> {
    try {
      this.page.on('response', (data) => { this.processResponseData(data); });
      return true;
    } catch {
      return false;
    }
  }

  private async processResponseData(response: Response): Promise<boolean> {
    try {
      const url = response.url();
      const urlMatchSubstring = url.indexOf(this._configuration.locationSharingUrlSubstring) >= 0;
      if (urlMatchSubstring) {
        await this.processSharedLocationBody(response);
      }
      return true;
    } catch {
      return false;
    }
  }

  private async processSharedLocationBody(response: Response): Promise<boolean> {
    try {
      const body = await response.body();
      const bodyString = body.toString(undefined, this._configuration.locationSharingResponseSkipStart)
        .replace(/[\n\r]+/g, '')
        .trim();
      this.processSharedLocationData(bodyString);
      return true;
    } catch {
      return false;
    }
  }

  private async processSharedLocationData(sharedLocationString: string): Promise<boolean> {
    try {
      // console.log(sharedLocationString);
      this._sharedLocations = {
        state: this._state,
        timestamp: (new Date).toISOString(),
        locations: [{
          id: (new Date).toISOString(),
        }],
      };
      this.newSharedLocations();
      return true;
    } catch {
      return false;
    }
  }

  private async detectLoginState(timeout = 10000): Promise<string> {
    const isLoggedIn = this.page.waitForSelector(this._configuration.isLoggedInSelector, { timeout: timeout })
      .then(() => { return 'isLoggedIn'; })
      .catch(() => 'noSelectorDetected');
    const isLoggedOut = this.page.waitForSelector(this._configuration.isLoggedOutSelector, { timeout: timeout })
      .then(() => { return 'isLoggedOut'; })
      .catch(() => 'noSelectorDetected');

    const firstDetected = await Promise.race([isLoggedIn, isLoggedOut]);
    return firstDetected;
  }

  private async evaluateGoogleMapsLoginState(): Promise<boolean> {
    try {
      const first: string = await this.detectLoginState();
      if (first === 'isLoggedIn') {
        this._state = GomshalWaitingFor.LocationData;
      } else if (first === 'isLoggedOut') {
        this._state = GomshalWaitingFor.LoginAndPassword;
      } else if (first === 'noSelectorDetected') {
        this._error = GomshalError.WrongGoogleMapsSite;
        this._state = GomshalWaitingFor.Initialize;
      }
      return true;
    } catch {
      return false;
    }
  }

  private async login(): Promise<boolean> {
    try {
      if (this._configuration.login === undefined || this._configuration.password === undefined) {
        this._error = GomshalError.MissingLoginOrPassword;
        this._state = GomshalWaitingFor.LoginAndPassword;
        return false;
      }

      await this.page.waitForSelector(this._configuration.loginSelector, { timeout: this._configuration.detectionTimeout });
      await this.setInput(this._configuration.loginSelector, this._configuration.login);
      await this.clickElement(this._configuration.loginNextButtonSelector);

      await this.page.waitForSelector(this._configuration.passwordSelector, { timeout: this._configuration.detectionTimeout });
      await this.setInput(this._configuration.passwordSelector, this._configuration.password);
      await this.clickElement(this._configuration.passwordNextButtonSelector);


      this._state = GomshalWaitingFor.TwoFactorConfirmation;
      this._state = GomshalWaitingFor.LocationData;
      return true;
    } catch {
      this._error = GomshalError.WrongAuthentication;
      this._state = GomshalWaitingFor.LoginAndPassword;
      return false;
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

  public async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browserContext) {
      await this.browserContext.close();
    }
  }
}
