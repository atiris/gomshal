import { GomshalState } from './enums';

export const GOOGLE_MAPS_URL = 'https://www.google.com/maps/';
export const GOOGLE_MAPS_LOCATION_SHARING_URL_SUBSTRING = '/maps/rpc/locationsharing/read';
export const GOOGLE_MAPS_SKIP_RESPONSE_CHARS_START = 4;
export const GOOGLE_MAPS_IS_LOGGED_IN_SELECTOR = 'a[href*="SignOut"]';
export const GOOGLE_MAPS_IS_LOGGED_OUT_SELECTOR = 'a[href*="ServiceLogin"]';
export const GOOGLE_MAPS_LOGIN_SELECTOR = 'input[type="email"]';
export const GOOGLE_MAPS_LOGIN_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
export const GOOGLE_MAPS_PASSWORD_SELECTOR = 'input[type="password"]';
export const GOOGLE_MAPS_PASSWORD_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
export const DETECTION_TIMEOUT = 10 * 1000;
export const MINIMUM_CACHE_TIME = 60 * 1000;

export interface GomshalLocation {
  id?: string;
  name?: string;
  location?: string;
}

export interface GomshalData {
  state: GomshalState;
  locations?: Array<GomshalLocation>;
}

export interface GomshalConfiguration {
  login?: string;
  password?: string;
  loginSet?: boolean;
  passwordSet?: boolean;
  googleMapsUrl?: string;
  locationSharingUrlSubstring?: string;
  locationSharingSkipResponseCharsStart?: number;
  isLoggedInSelector?: string;
  isLoggedOutSelector?: string;
  loginSelector?: string;
  loginNextButtonSelector?: string;
  passwordSelector?: string;
  passwordNextButtonSelector?: string;
  headless: boolean;
  hideAfterLogin: boolean;
  showDevTools?: boolean;
  detectionTimeout?: number;
  minimumCacheTime?: number;
}

export const defaultConfiguration: GomshalConfiguration = {
  googleMapsUrl: GOOGLE_MAPS_URL,
  locationSharingUrlSubstring: GOOGLE_MAPS_LOCATION_SHARING_URL_SUBSTRING,
  locationSharingSkipResponseCharsStart: GOOGLE_MAPS_SKIP_RESPONSE_CHARS_START,
  isLoggedInSelector: GOOGLE_MAPS_IS_LOGGED_IN_SELECTOR,
  isLoggedOutSelector: GOOGLE_MAPS_IS_LOGGED_OUT_SELECTOR,
  loginSelector: GOOGLE_MAPS_LOGIN_SELECTOR,
  loginNextButtonSelector: GOOGLE_MAPS_LOGIN_NEXT_BUTTON_SELECTOR,
  passwordSelector: GOOGLE_MAPS_PASSWORD_SELECTOR,
  passwordNextButtonSelector: GOOGLE_MAPS_PASSWORD_NEXT_BUTTON_SELECTOR,
  headless: true,
  hideAfterLogin: false,
  showDevTools: false,
  detectionTimeout: DETECTION_TIMEOUT,
  minimumCacheTime: MINIMUM_CACHE_TIME,
};
