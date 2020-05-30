import { BrowserVisibility, GomshalState } from './enums';

export const GOOGLE_MAPS_URL = 'https://accounts.google.com/ServiceLogin?service=local';
export const GOOGLE_MAPS_LOGIN_SELECTOR = 'input[type="email"]';
export const GOOGLE_MAPS_LOGIN_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
export const GOOGLE_MAPS_PASSWORD_SELECTOR = 'input[type="password"]';
export const GOOGLE_MAPS_PASSWORD_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
export const DETECTION_TIMEOUT = 10 * 1000;
export const MINIMUM_CACHE_TIME = 60 * 1000;

export interface GomshalInputs {
  readonly login?: string;
  readonly password?: string;
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
  loginNextButtonSelector?: string;
  passwordSelector?: string;
  passwordNextButtonSelector?: string;
  browserVisibility?: BrowserVisibility;
  showDevTools?: boolean;
  detectionTimeout?: number;
  minimumCacheTime?: number;
}

export const defaultSettings: GomshalSettings = {
  googleMapsUrl: GOOGLE_MAPS_URL,
  loginSelector: GOOGLE_MAPS_LOGIN_SELECTOR,
  loginNextButtonSelector: GOOGLE_MAPS_LOGIN_NEXT_BUTTON_SELECTOR,
  passwordSelector: GOOGLE_MAPS_PASSWORD_SELECTOR,
  passwordNextButtonSelector: GOOGLE_MAPS_PASSWORD_NEXT_BUTTON_SELECTOR,
  browserVisibility: BrowserVisibility.Hidden,
  showDevTools: false,
  detectionTimeout: DETECTION_TIMEOUT,
  minimumCacheTime: MINIMUM_CACHE_TIME,
};
