import { GomshalError, GomshalWaitingFor } from './enums';

// browser and page configuration
export const GOOGLE_MAPS_URL = 'https://www.google.com/maps/';
export const GOOGLE_MAPS_LOCATION_SHARING_URL_SUBSTRING = '/maps/rpc/locationsharing/read';
export const GOOGLE_MAPS_RESPONSE_SKIP_START_FIX = 4;
export const GOOGLE_MAPS_IS_LOGGED_IN_SELECTOR = 'a[href*="SignOut"]';
export const GOOGLE_MAPS_IS_LOGGED_OUT_SELECTOR = 'a[href*="ServiceLogin"]';
export const GOOGLE_MAPS_LOGIN_SELECTOR = 'input[type="email"]';
export const GOOGLE_MAPS_LOGIN_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
export const GOOGLE_MAPS_PASSWORD_SELECTOR = 'input[type="password"]';
export const GOOGLE_MAPS_PASSWORD_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
export const DETECTION_TIMEOUT = 10 * 1000;
export const MINIMUM_CACHE_TIME = 60 * 1000;

// TODO: extended informations
// state: moving, standing
// last stop time, position and location
// history with previous locations
// direction calculated from samples for last n minutes
export const EXTENDED = true;
export const EXTENDED_LOCATIONS_HISTORY_FOR_MINUTES = 0;
export const EXTENDED_STOPPED_IF_MORE_THAN_MINUTES = 5;
export const EXTENDED_STOPPED_HISTORY_FOR_MINUTES = 0;
export const EXTENDED_DIRECTION_CALC_MINIMUM_MINUTES = 0;
export const EXTENDED_SPEED_CALC_MINIMUM_MINUTES = 0;

// data extract configuration
export const PARSER_TIMESTAMP = '8';
export const PARSER_PERSONS = '0';
export const PARSER_MY_DATA = '9';
export const PARSER_PERSON_ID = '6.0';
export const PARSER_PERSON_PHOTO_URL = '6.1';
export const PARSER_PERSON_FULL_NAME = '6.2';
export const PARSER_PERSON_SHORT_NAME = '6.3';
export const PARSER_PERSON_LOCATION_DATA = '1';
export const PARSER_LOCATION_DATA_LONGITUDE = '1.1';
export const PARSER_LOCATION_DATA_LATITUDE = '1.2';
export const PARSER_LOCATION_DATA_TIMESTAMP = '2';
export const PARSER_LOCATION_DATA_ADDRESS = '4';
export const PARSER_LOCATION_DATA_COUNTRY = '6';

export interface SharedLocation {
  id?: string;
  timestamp?: string;
  fullName?: string;
  shortName?: string;
  longitude?: string;
  latitude?: string;
  photoUrl?: string;
  address?: string;
  country?: string;
}

export interface SharedLocations {
  state?: GomshalWaitingFor;
  timestamp?: string;
  error?: GomshalError;
  locations?: Array<SharedLocation>;
}

// TODO: store history and calculate direction and speed
/**
 * Configuration for browser, page, credentials, parser, extended data
 */
export interface GomshalConfiguration {
  /**
   * Write only google account login.
   */
  login?: string;
  /**
   * Write only google account password.
   */
  password?: string;
  /**
   * Information if login is already set.
   */
  loginSet?: boolean;
  /**
   * Information if password is already set.
   */
  passwordSet?: boolean;
  /**
   * URL to Google maps.
   */
  googleMapsUrl?: string;
  /**
   * Substring from URL containing shared location data. Only responses with this substring in URL will be further parsed.
   */
  locationSharingUrlSubstring?: string;
  /**
   * If the response from the server must be cleared of the initial characters to be valid JSON, enter here how many first characters from response do not include to JSON.parse.
   */
  locationSharingResponseSkipStartFix?: number;
  /**
   * CSS selector for identification if user is logged in on Google maps web page.
   */
  isLoggedInSelector?: string;
  /**
   * CSS selector for identification if user is not logged in and can click on login button.
   */
  isLoggedOutSelector?: string;
  /**
   * CSS selector for Google account login input to enter email.
   */
  loginSelector?: string;
  /**
   * CSS selector for button to click if login email is set.
   */
  loginNextButtonSelector?: string;
  /**
   * CSS selector for Google account password input.
   */
  passwordSelector?: string;
  /**
   * CSS selector for button to click if Google account password is set.
   */
  passwordNextButtonSelector?: string;
  /**
   * If true, the browser will not be displayed. Using false to show browser with Google Maps page is helpful for debugging or logging in for the first time when login credentials are required.
   */
  headless?: boolean;
  /**
   * TODO: hide after login is not supported now
   */
  hideAfterLogin?: boolean;
  /**
   * Open Browser with dev tools visibled.
   */
  showDevTools?: boolean;
  /**
   * Default detection timeout for any web request.
   */
  detectionTimeout?: number;
  minimumCacheTime?: number;
  parserPathTimestamp?: string;
  parserPathPersons?: string;
  parserPathMyData?: string;
  parserPathPersonId?: string;
  parserPathPersonPhotoUrl?: string;
  parserPathPersonFullName?: string;
  parserPathPersonShortName?: string;
  parserPathPersonLocationData?: string;
  parserPathLocationDataLongitude?: string;
  parserPathLocationDataLatitude?: string;
  parserPathLocationDataTimestamp?: string;
  parserPathLocationDataAddress?: string;
  parserPathLocationDataCountry?: string;
}

export const defaultConfiguration: GomshalConfiguration = {
  googleMapsUrl: GOOGLE_MAPS_URL,
  locationSharingUrlSubstring: GOOGLE_MAPS_LOCATION_SHARING_URL_SUBSTRING,
  locationSharingResponseSkipStartFix: GOOGLE_MAPS_RESPONSE_SKIP_START_FIX,
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
  parserPathTimestamp: PARSER_TIMESTAMP,
  parserPathPersons: PARSER_PERSONS,
  parserPathMyData: PARSER_MY_DATA,
  parserPathPersonId: PARSER_PERSON_ID,
  parserPathPersonPhotoUrl: PARSER_PERSON_PHOTO_URL,
  parserPathPersonFullName: PARSER_PERSON_FULL_NAME,
  parserPathPersonShortName: PARSER_PERSON_SHORT_NAME,
  parserPathPersonLocationData: PARSER_PERSON_LOCATION_DATA,
  parserPathLocationDataLongitude: PARSER_LOCATION_DATA_LONGITUDE,
  parserPathLocationDataLatitude: PARSER_LOCATION_DATA_LATITUDE,
  parserPathLocationDataTimestamp: PARSER_LOCATION_DATA_TIMESTAMP,
  parserPathLocationDataAddress: PARSER_LOCATION_DATA_ADDRESS,
  parserPathLocationDataCountry: PARSER_LOCATION_DATA_COUNTRY,
};
