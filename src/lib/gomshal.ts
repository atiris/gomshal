import { BrowserContext, firefox, Page, Response } from 'playwright';

import { defaultConfiguration, GConfiguration, GEntity, GLocations, GPosition } from './interfaces';
import { GError, GStep } from './enums';

export class Gomshal {
  private browserContext: BrowserContext;
  private page: Page;

  private ownerPhotoUrl: string;
  private ownerFullName: string;
  private ownerShortName: string;

  private _locationsCallback: (locations: GLocations) => void;
  private _stepCallback: (newStep: GStep, previousStep: GStep) => void;
  private _errorCallback: (error: GError) => void;

  private _configuration: GConfiguration;
  public get configuration(): GConfiguration {
    return {
      ...this._configuration,
      ...{
        name: undefined,
        loginSet: this._configuration.name !== undefined,
        password: undefined,
        passwordSet: this._configuration.password !== undefined,
      },
    };
  }

  private _step: GStep;
  public get activeStep(): GStep {
    return this._step;
  }

  private _error: GError;
  public get error(): GError {
    return this._error;
  }

  private _entities: GEntity[];
  public get entities(): GEntity[] {
    return this._entities;
  }

  private _locations: GLocations;
  public get locations(): GLocations {
    return this._locations;
  }

  public constructor() {
    this._configuration = defaultConfiguration;
    this._step = GStep.Initialize;
    this._error = GError.NoError;
    this.ownerPhotoUrl = this._configuration.ownerPhotoUrl || '';
    this.ownerFullName = this._configuration.ownerFullName || '';
    this.ownerShortName = this._configuration.ownerShortName || '';
  }

  public onLocations(callback?: (locations: GLocations) => void): void {
    this._locationsCallback = callback;
  }

  private newLocations(locations: GLocations): void {
    this._locations = locations;
    if (this._locationsCallback !== undefined) {
      this._locationsCallback(this._locations);
    }
  }

  public onStep(callback?: (newStep: GStep, previousStep: GStep) => void): void {
    this._stepCallback = callback;
  }

  private newStep(step: GStep): void {
    const previousStep = this._step;
    if (previousStep === step) { return; }
    this._step = step;
    if (this._stepCallback !== undefined) {
      this._stepCallback(step, previousStep);
    }
  }

  public onError(callback?: (error: GError) => void): void {
    this._errorCallback = callback;
  }

  private updateState(step?: GStep, error?: GError): void {
    if (step != null) {
      this.newStep(step);
    }
    if (error != null) {
      this.newError(error);
    }
  }

  private newError(error: GError): void {
    const previousError = this._error;
    if (previousError === error) { return; }
    this._error = error;
    if (this._errorCallback !== undefined) {
      this._errorCallback(error);
    }
  }

  public async initialize(customConfiguration?: GConfiguration): Promise<GStep> {
    // update configuration if new configuration is set as input argument
    if (customConfiguration !== undefined) {
      this._configuration = { ...defaultConfiguration, ...customConfiguration };
    }
    // initialization steps
    if (this._step === GStep.Initialize) {
      if (this.browserContext === undefined && this.page === undefined) {
        await this.openBrowser();
        await this.openPage();
      }
      await this.loadGoogleMapsPage();
      await this.evaluateGoogleMapsLoginState();
    }
    if (this._step === GStep.LoginAndPassword) {
      await this.login();
    }
    if (this._step === GStep.TwoFactorConfirmation) {
      await this.login();
    }
    if (this._step === GStep.LocationData) {
      await this.subscribeForSharedLocationResponse();
    }

    return this._step;

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

  public async createLocations(): Promise<void> {
    this._locations = {
      ...{ state: this._step, timestamp: (new Date).toISOString() },
      ...(this._entities === undefined ? {} : { entities: this._entities }),
      ...(this._error === GError.NoError ? {} : { error: this._error }),
    };
  }

  private async openBrowser(): Promise<boolean> {
    try {
      this.browserContext = await firefox.launchPersistentContext('./.userdata', {
        headless: !!this._configuration.headless,
      });
      return true;
    } catch {
      this.updateState(GStep.Close, GError.CanNotLaunchBrowser);
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
      this.updateState(GStep.Close, GError.CanNotLaunchBrowser);
      return false;
    }
  }

  private async loadGoogleMapsPage(): Promise<boolean> {
    try {
      await this.page.goto(this._configuration.googleMapsUrl, { waitUntil: 'domcontentloaded' });
      return true;
    } catch {
      this.updateState(GStep.Close, GError.WrongGoogleMapsSite);
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

      const urlLocations = url.indexOf(this._configuration.locationSharingUrlSubstring) >= 0;
      if (urlLocations) {
        await this.processSharedLocationBody(response);
        return true;
      }

      const urlOwner = url.indexOf(this._configuration.ownerUrlSubstring) >= 0;
      if (urlOwner) {
        await this.processOwnerBody(response);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async processSharedLocationBody(response: Response): Promise<boolean> {
    try {
      const body = await response.body();
      const bodyString = body.toString(undefined, this._configuration.locationSharingResponseSkipStartFix)
        .replace(/[\n\r]+/g, '')
        .trim();
      this.processSharedLocationData(bodyString);
      return true;
    } catch {
      this.updateState(GStep.Close, GError.LocationDataParsingError);
      return false;
    }
  }

  private getJsonDataByPath<T>(json: JSON, path: string): T {
    if (path === '') {
      return undefined;
    }
    const result = path.split('.').reduce((object, key) => {
      return object && object[key];
    }, json);
    try {
      return result as T;
    } catch {
      return undefined;
    }
  }

  private async processSharedLocationData(sharedLocationString: string): Promise<boolean> {
    try {
      const data: GLocations = { entities: [] };

      data.state = this._step;
      const sharedLocationJson = JSON.parse(sharedLocationString);
      data.timestamp = this.getJsonDataByPath<string>(sharedLocationJson, this._configuration.parserPathTimestamp);
      data.state = this._step;

      const entities = this.getJsonDataByPath<[JSON]>(sharedLocationJson, '0');

      // go through the persons details and select a informations
      for (let entityIndex = 0; entityIndex < entities.length; entityIndex++) {
        const entity: GEntity = {};
        const person = entities[entityIndex];

        // personal info
        entity.id = this.getJsonDataByPath<string>(person, this._configuration.parserPathPersonId);
        entity.photoUrl = this.getJsonDataByPath<string>(person, this._configuration.parserPathPersonPhotoUrl);
        entity.fullName = this.getJsonDataByPath<string>(person, this._configuration.parserPathPersonFullName);
        entity.shortName = this.getJsonDataByPath<string>(person, this._configuration.parserPathPersonShortName);

        // location
        const locationData = this.getJsonDataByPath<JSON>(person, this._configuration.parserPathPersonLocationData);
        const position: GPosition = {};
        position.longitude = this.getJsonDataByPath<string>(locationData, this._configuration.parserPathLocationDataLongitude);
        position.latitude = this.getJsonDataByPath<string>(locationData, this._configuration.parserPathLocationDataLatitude);
        position.timestamp = this.getJsonDataByPath<number>(locationData, this._configuration.parserPathLocationDataTimestamp);
        position.address = this.getJsonDataByPath<string>(locationData, this._configuration.parserPathLocationDataAddress);
        position.country = this.getJsonDataByPath<string>(locationData, this._configuration.parserPathLocationDataCountry);

        entity.position = position;
        data.entities.push(entity);
      }

      // add owner data
      const ownerLocationData = this.getJsonDataByPath<JSON>(sharedLocationJson, this._configuration.parserPathOwnerData);
      if (Object.keys(ownerLocationData).length > 0) {
        const entity: GEntity = {};
        entity.photoUrl = this.ownerPhotoUrl;
        entity.fullName = this.ownerFullName;
        entity.shortName = this.ownerShortName;
        entity.position = {};
        entity.position.timestamp = this.getJsonDataByPath<number>(ownerLocationData, this._configuration.parserPathOwnerLocationTimestamp);
        entity.position.longitude = this.getJsonDataByPath<string>(ownerLocationData, this._configuration.parserPathOwnerLocationLongitude);
        entity.position.latitude = this.getJsonDataByPath<string>(ownerLocationData, this._configuration.parserPathOwnerLocationLatitude);
        entity.position.address = this.getJsonDataByPath<string>(ownerLocationData, this._configuration.parserPathOwnerLocationAddress);
        entity.position.country = this.getJsonDataByPath<string>(ownerLocationData, this._configuration.parserPathOwnerLocationCountry);
        data.entities.push(entity);
      }

      // add extended informations
      this.extendLocations(data);

      this.newLocations(data);

      return true;
    } catch {
      this.updateState(GStep.Close, GError.LocationDataParsingError);
      return false;
    }
  }

  // TODO: no extended data yet
  private extendLocations(data: GLocations): void {
    // const previousData: GLocations = (this._locations ? this._locations : data);
    // const extendedEntities: GEntity[] = previousData.entities;
    if (this._configuration.extended) {
      for (let entityIndex = 0; entityIndex < data.entities.length; entityIndex++) {
        const entity = data.entities[entityIndex];
        // TODO: store historical data in class and create new instance of glocations if needed
        entity.positionHistory.push(entity.position);
        entity.positionHistory = entity.positionHistory.filter(position => (position.timestamp > (Date.now() - 60000 * this._configuration.extendedLocationsHistoryForMinutes)));
      }

      // data.entities;
    }
  }

  private async processOwnerBody(response: Response): Promise<boolean> {
    try {
      const body = await response.body();
      const bodyString = body.toString(undefined, this._configuration.ownerResponseSkipStartFix)
        .replace(/[\n\r]+/g, '')
        .trim();
      this.processOwnerData(bodyString);
      return true;
    } catch {
      this.updateState(GStep.Close, GError.LocationDataParsingError);
      return false;
    }
  }

  private async processOwnerData(ownerString: string): Promise<boolean> {
    try {
      const ownerJson = JSON.parse(ownerString);

      if (!this.ownerPhotoUrl) {
        this.ownerPhotoUrl = this.getJsonDataByPath<string>(ownerJson, this._configuration.parserPathOwnerPhotoUrl);
        this.ownerPhotoUrl = this.fixUrlPrefix(this.ownerPhotoUrl);
      }
      if (!this.ownerFullName) {
        this.ownerFullName = this.getJsonDataByPath<string>(ownerJson, this._configuration.parserPathOwnerFullName);
      }
      if (!this.ownerShortName) {
        this.ownerShortName = this.getJsonDataByPath<string>(ownerJson, this._configuration.parserPathOwnerShortName);
      }

      return true;
    } catch {
      this.updateState(GStep.Close, GError.LocationDataParsingError);
      return false;
    }
  }

  private fixUrlPrefix(url: string): string {
    if (!url.startsWith('http')) {
      url = 'https:' + url;
    }
    return url;
  }
  private async detectLoginState(timeout = 10000): Promise<string> {
    const isLoggedIn = this.page.waitForSelector(this._configuration.logoutButtonSelector, { timeout: timeout })
      .then(() => { return 'isLoggedIn'; })
      .catch(() => 'noSelectorDetected');
    const isLoggedOut = this.page.waitForSelector(this._configuration.loginButtonSelector, { timeout: timeout })
      .then(() => { return 'isLoggedOut'; })
      .catch(() => 'noSelectorDetected');

    const firstDetected = await Promise.race([isLoggedIn, isLoggedOut]);
    return firstDetected;
  }

  private async evaluateGoogleMapsLoginState(): Promise<boolean> {
    try {
      const first: string = await this.detectLoginState();
      if (first === 'isLoggedIn') {
        this.updateState(GStep.LocationData);
      } else if (first === 'isLoggedOut') {
        this.updateState(GStep.LoginAndPassword);
      } else if (first === 'noSelectorDetected') {
        this.updateState(GStep.Close, GError.WrongGoogleMapsSite);
      }
      return true;
    } catch {
      return false;
    }
  }

  private async login(): Promise<boolean> {
    try {
      if (this._configuration.name === undefined || this._configuration.password === undefined) {
        this.updateState(GStep.LoginAndPassword, GError.MissingLoginOrPassword);
        return false;
      }

      await this.page.waitForSelector(this._configuration.loginButtonSelector, { timeout: this._configuration.detectionTimeout });
      await this.page.click(this._configuration.loginButtonSelector);

      // on login form we can see input selector for usename or button for "another username", first wins
      const elementType: string = await Promise.race([
        this.page.waitForSelector(this._configuration.googleAccountEmailInputSelector, { timeout: this._configuration.detectionTimeout }).then(() => 'input'),
        this.page.waitForSelector(this._configuration.googleAccountUseAnotherAccountButtonSelector, { timeout: this._configuration.detectionTimeout }).then(() => 'button'),
      ]);

      if (elementType === 'button') {
        await this.page.click(this._configuration.googleAccountUseAnotherAccountButtonSelector);
        await this.page.waitForSelector(this._configuration.googleAccountEmailInputSelector, { timeout: this._configuration.detectionTimeout });
      }

      await this.setInput(this._configuration.googleAccountEmailInputSelector, this._configuration.name);
      await this.page.click(this._configuration.googleAccountEmailNextButtonSelector);

      await this.page.waitForSelector(this._configuration.googleAccountPasswordInputSelector, { timeout: this._configuration.detectionTimeout });
      await this.setInput(this._configuration.googleAccountPasswordInputSelector, this._configuration.password);

      await this.page.click(this._configuration.googleAccountPasswordNextButtonSelector);
      await Promise.race([
        this.page.waitForSelector(this._configuration.logoutButtonSelector),
        this.page.waitForSelector(this._configuration.loginButtonSelector),
      ]);

      const pageUrl = this.page.url();
      if (pageUrl.indexOf(this._configuration.googleAccountTwoFactorWaitingUrlSubstring) >= 0) {
        this.updateState(undefined, GError.NoTwoFactorConfirmation);
        return true;
      }

      if (pageUrl.indexOf(this._configuration.googleMapsLoadedUrlSubstring) >= 0) {
        this.updateState(GStep.LocationData);
        return true;
      }

      this.updateState(undefined, GError.WrongAuthentication);
      return true;
    } catch {
      this.updateState(GStep.LoginAndPassword, GError.WrongAuthentication);
      return false;
    }
  }

  private async setInput(selector: string, value: string): Promise<void> {
    if (!value) { return; }
    await this.page.evaluate((data) => {
      const element = document.querySelector(data.selector);
      if (element && (element instanceof HTMLInputElement)) {
        (element as HTMLInputElement).value = data.value;
        // trigger change event
        const event = new Event('input', {
          'bubbles': true,
          'cancelable': true,
        });
        element.dispatchEvent(event);
        element.focus();
      }
    }, { selector: selector, value: value });
  }

  public async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browserContext) {
      await this.browserContext.close();
    }
    this.updateState(GStep.Initialize, GError.NoError);
  }
}
