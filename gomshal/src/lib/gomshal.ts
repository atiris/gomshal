import { Browser, Page, launch } from 'puppeteer';

export enum Step {
  OpenBrowser = 0,
  LoadGoogleMaps = 1,
  LogIn = 2,
  SecondAuthentication = 3,
  ReadLocationData = 4,
  LogOut = 5,
  CloseBrowser = 6,
}

export enum State {
  Ok = 0,
  Warning = 1,
  Error = 2,
}

export interface GomshalSettings {
  readonly nextStep: Step;
  readonly login?: string;
  readonly password?: string;
}

export interface GomshalStatus {
  readonly lastStep: Step;
  readonly stepState: State;
}

export class Gomshal {

  private readonly GOOGLE_MAPS_URL = 'https://accounts.google.com/ServiceLogin?service=local';
  private browser: Browser;

  public async initialize(data: GomshalSettings): Promise<GomshalStatus> {
    const fnc = [this.initializeBrowser][data.nextStep];
    if (fnc) {
      return fnc(data);
    }
    return { lastStep: data.nextStep, stepState: State.Error };
  }

  private async initializeBrowser(data: GomshalSettings): Promise<GomshalStatus> {
    this.browser = await launch({headless: false});
    const page: Page = await this.browser.newPage();
    const pageResponse = await page.goto(this.GOOGLE_MAPS_URL, { waitUntil: 'networkidle2' });

    return { lastStep: data.nextStep, stepState: (pageResponse.ok ? State.Ok : State.Error) };
  }

  public async close(): Promise<void> {
    if (this.browser) { this.browser.close; }
  }
}
