import { BrowserVisibility, GomshalState } from './enums';

export const GOOGLE_MAPS_URL = 'https://accounts.google.com/ServiceLogin?service=local';
export const GOOGLE_MAPS_LOGIN_SELECTOR = 'input[type="email"]';
export const GOOGLE_MAPS_PASSWORD_SELECTOR = 'input[type="password"]';
export const MINIMUM_CACHE_TIME = 60 * 1000;

export interface GomshalInputs {
  readonly login?: string;
  readonly password?: string;
  readonly twoFactorAuthenticated?: boolean;
}

export interface GomshalLocation {
  id?: string;
  name?: string;
  location?: string;
}

export interface GomshalData {
  state: GomshalState;
  locations?: Array<GomshalLocation>;
}

export interface GomshalSettings {
  googleMapsUrl?: string;
  loginSelector?: string;
  passwordSelector?: string;
  browserVisibility?: BrowserVisibility;
  showDevTools?: boolean;
  minimumCacheTime?: number;
}

export const defaultSettings: GomshalSettings = {
  googleMapsUrl: GOOGLE_MAPS_URL,
  loginSelector: GOOGLE_MAPS_LOGIN_SELECTOR,
  passwordSelector: GOOGLE_MAPS_PASSWORD_SELECTOR,
  browserVisibility: BrowserVisibility.Hidden,
  showDevTools: false,
  minimumCacheTime: MINIMUM_CACHE_TIME,
};
