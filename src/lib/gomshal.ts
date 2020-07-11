import { BrowserContext, firefox, Page, Response } from 'playwright';

import { defaultConfiguration, GConfiguration, GEntity, GLocations, GPoint, GPosition } from './interfaces';
import { GError, GState } from './enums';
import { Geopointing } from './geopointing';

export class Gomshal {
  private browserContext: BrowserContext;
  private page: Page;

  private ownerPhotoUrl: string;
  private ownerFullName: string;
  private ownerShortName: string;

  private _locationsCallback: (locations: GLocations) => void;

  /**
   * Configuration store for library.
   */
  private _configuration: GConfiguration;
  /**
   * Configuration store for library without sensitive informations.
   * If the login is filled in, the value of loginSet will be true.
   * If the password is filled in, the value of passwordSet will be true.
   */
  public get configuration(): GConfiguration {
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

  /**
   * Reference points to which all distances are calculated.
   */
  private _references: GPoint[];
  public get references(): GPoint[] {
    return this._references;
  }

  /**
   * Last detected locations data.
   */
  private _locations: GLocations;
  public get locations(): GLocations {
    return this._locations;
  }

  public get entities(): GEntity[] {
    return this._locations.entities;
  }

  public get timestamp(): string {
    return this._locations.timestamp;
  }

  public get state(): GState {
    return this._locations.state;
  }

  public get error(): GError {
    return this._locations.error;
  }

  public constructor() {
    this._locations = this.createLocations();
    this.setDefaultConfiguration();
  }

  private setDefaultConfiguration(): void {
    this._configuration = defaultConfiguration;
    this.ownerPhotoUrl = this._configuration.ownerPhotoUrl || '';
    this.ownerFullName = this._configuration.ownerFullName || '';
    this.ownerShortName = this._configuration.ownerShortName || '';
  }

  public onLocations(callback?: (locations: GLocations) => void): void {
    this._locationsCallback = callback;
  }

  private setLocations(locations: GLocations): void {
    this._locations = locations;
    if (this._locationsCallback !== undefined) {
      this._locationsCallback(locations);
    }
  }

  private updateState(state?: GState, error?: GError): void {
    const location = this.locations;
    if (state != null && this._locations.state !== state) {
      location.state = state;
    }
    if (error != null && this._locations.error !== error) {
      location.error = error;
    }
    this.setLocations(location);
  }

  /**
   * Set or update reference points.
   * @param references Static points against which to evaluate the distances of individual assessed objects.
   */
  public setReferencePoints(references: GPoint[]): void {
    this._references = references;
  }

  /**
   * Create new location data.
   * @param entities Initial entity list
   * @param state Gomshal state
   * @param error Actual error
   */
  public createLocations(
    entities?: GEntity[],
    state?: GState,
    error?: GError
  ): GLocations {
    return {
      timestamp: (new Date).toISOString(),
      ...(entities === undefined ? { entities: [] } : { entities: entities }),
      ...(state === undefined ? { state: GState.Initialize } : { state: state }),
      ...(error === undefined ? { error: GError.NoError } : { error: error }),
    };
  }

  /**
   * Create new location from previous locations.
   * @param entities Initial entity list
   * @param state Gomshal state
   * @param error Actual error
   */
  public updateLocations(
    locations: GLocations,
    entities?: GEntity[],
    state?: GState,
    error?: GError
  ): GLocations {
    return {
      timestamp: (new Date).toISOString(),
      ...(entities === undefined ? { entities: locations.entities } : { entities: entities }),
      ...(state === undefined ? { state: locations.state } : { state: state }),
      ...(error === undefined ? { error: locations.error } : { error: error }),
    };
  }

  /**
   * Initialize procedure processes the current library step based on the supplied configuration and attempts to set the browser to return information about the shared location. It is always used when it is necessary to initialize the library from a suspended state when it does not return location information.
   * @param customConfiguration The configuration that will be used when processing the current step (according to state). Configuration can customize browser initialization, visibility, login and password and returning data.
   */
  public async initialize(customConfiguration?: GConfiguration): Promise<GState> {
    // update configuration if new configuration is set as input argument
    if (customConfiguration !== undefined) {
      this._configuration = { ...defaultConfiguration, ...customConfiguration };
    }
    // initialization from actual state to final LocationData state
    if (this._locations.state === GState.Initialize) {
      await this.initializeBrowserAndPage();
    }
    if (this._locations.state === GState.LoginAndPassword) {
      await this.login();
    }
    if (this._locations.state === GState.TwoFactorConfirmation) {
      await this.login();
    }
    if (this._locations.state === GState.LocationData) {
      await this.subscribeForSharedLocationResponse();
    }

    return this._locations.state;
  }

  private async initializeBrowserAndPage(): Promise<void> {
    if (this.browserContext === undefined) {
      await this.openBrowser();
    }
    if (this.page === undefined) {
      await this.openPage();
    }
    await this.loadGoogleMapsPage();
    await this.evaluateGoogleMapsLoginState();
  }

  private async openBrowser(): Promise<boolean> {
    try {
      this.browserContext = await firefox.launchPersistentContext('./.userdata', {
        headless: !!this._configuration.headless,
      });
      return true;
    } catch {
      this.updateState(GState.Close, GError.CanNotLaunchBrowser);
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
      this.updateState(GState.Close, GError.CanNotLaunchBrowser);
      return false;
    }
  }

  private async loadGoogleMapsPage(): Promise<boolean> {
    try {
      await this.page.goto(this._configuration.googleMapsUrl, { waitUntil: 'domcontentloaded' });
      return true;
    } catch {
      this.updateState(GState.Close, GError.WrongGoogleMapsSite);
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
        this.processSharedLocationBody(response);
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

  private async processSharedLocationBody(response: Response): Promise<GLocations> {
    try {

      const body = await response.body();
      const bodyString = body.toString(undefined, this._configuration.locationSharingResponseSkipStartFix)
        .replace(/[\n\r]+/g, '')
        .trim();
      return this.processSharedLocationData(bodyString);
    } catch {
      this.updateState(GState.Close, GError.LocationDataParsingError);
      return null;
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

  private processSharedLocationData(sharedLocationString: string): GLocations {
    const oldLocations: GLocations = this._locations;
    let newLocations: GLocations = this.updateLocations(oldLocations);

    try {
      newLocations.state = this._locations.state;
      const sharedLocationJson = JSON.parse(sharedLocationString);
      newLocations.timestamp = this.getJsonDataByPath<string>(sharedLocationJson, this._configuration.parserPathTimestamp);
      newLocations.state = this._locations.state;

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
        position.longitude = this.getJsonDataByPath<number>(locationData, this._configuration.parserPathLocationDataLongitude);
        position.latitude = this.getJsonDataByPath<number>(locationData, this._configuration.parserPathLocationDataLatitude);
        position.timestamp = this.getJsonDataByPath<number>(locationData, this._configuration.parserPathLocationDataTimestamp);
        position.address = this.getJsonDataByPath<string>(locationData, this._configuration.parserPathLocationDataAddress);
        position.country = this.getJsonDataByPath<string>(locationData, this._configuration.parserPathLocationDataCountry);

        entity.position = position;
        newLocations.entities.push(entity);
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
        entity.position.longitude = this.getJsonDataByPath<number>(ownerLocationData, this._configuration.parserPathOwnerLocationLongitude);
        entity.position.latitude = this.getJsonDataByPath<number>(ownerLocationData, this._configuration.parserPathOwnerLocationLatitude);
        entity.position.address = this.getJsonDataByPath<string>(ownerLocationData, this._configuration.parserPathOwnerLocationAddress);
        entity.position.country = this.getJsonDataByPath<string>(ownerLocationData, this._configuration.parserPathOwnerLocationCountry);
        newLocations.entities.push(entity);
      }

      // add extended informations
      newLocations = this.extendLocations(oldLocations, newLocations);
      this.setLocations(newLocations);
      return newLocations;
    } catch {
      this.updateState(GState.Close, GError.LocationDataParsingError);
      return oldLocations;
    }
  }

  private extendLocations(oldLocations: GLocations, newLocations: GLocations): GLocations {
    if (this._configuration.extended) {
      const entities = newLocations.entities;
      if (entities.length > 0) {
        for (let entityIndex = 0; entityIndex < newLocations.entities.length; entityIndex++) {
          const entity = newLocations.entities[entityIndex];
          const previousEntity = oldLocations.entities.find(e => e.id === entity.id);
          if (entity && previousEntity) {
            if (entity.position.timestamp !== previousEntity.position.timestamp) {
              const lastSegment = previousEntity.segments && previousEntity.segments[0];

              if (lastSegment) {
                const complexData = Geopointing.complexPositionData(entity.position, lastSegment.positionTo, entity.position.timestamp - lastSegment.timestampTo);
                if (complexData.distance > this.configuration.distanceForMovementMinMeters) {
                  lastSegment.positionTo = entity.position;
                  lastSegment.timestampTo = entity.position.timestamp;
                  // TODO: calculate path detail and update
                  lastSegment.path.push(entity.position);
                } else {
                  lastSegment.timestampTo = entity.position.timestamp;
                  // TODO: calculate duration
                }
              }
            } else {
              entity.segments = previousEntity.segments;
            }
          }
        }
      }
    }
    return newLocations;
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
      this.updateState(GState.Close, GError.LocationDataParsingError);
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
      this.updateState(GState.Close, GError.LocationDataParsingError);
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
        this.updateState(GState.LocationData);
      } else if (first === 'isLoggedOut') {
        this.updateState(GState.LoginAndPassword);
      } else if (first === 'noSelectorDetected') {
        this.updateState(GState.Close, GError.WrongGoogleMapsSite);
      }
      return true;
    } catch {
      return false;
    }
  }

  private async login(): Promise<boolean> {
    try {
      if (this._configuration.login === undefined || this._configuration.password === undefined) {
        this.updateState(GState.LoginAndPassword, GError.MissingLoginOrPassword);
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

      await this.setInput(this._configuration.googleAccountEmailInputSelector, this._configuration.login);
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
        this.updateState(GState.LocationData);
        return true;
      }

      this.updateState(undefined, GError.WrongAuthentication);
      return true;
    } catch {
      this.updateState(GState.LoginAndPassword, GError.WrongAuthentication);
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
    this.updateState(GState.Initialize, GError.NoError);
  }
}
