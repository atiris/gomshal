import { GError, GStep } from './enums';

// browser and page configuration
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/';
const GOOGLE_MAPS_OWNER_URL_SUBSTRING = '/locationhistory/preview/mas';
const GOOGLE_MAPS_LOCATION_SHARING_URL_SUBSTRING = '/maps/rpc/locationsharing/read';
const GOOGLE_MAPS_OWNER_RESPONSE_SKIP_START_FIX = 4;
const GOOGLE_MAPS_LOCATION_RESPONSE_SKIP_START_FIX = 4;
const GOOGLE_MAPS_IS_LOGGED_IN_SELECTOR = 'a[href*="SignOut"]';
const GOOGLE_MAPS_IS_LOGGED_OUT_SELECTOR = 'a[href*="ServiceLogin"]';
const GOOGLE_MAPS_LOGIN_SELECTOR = 'input[type="email"]';
const GOOGLE_MAPS_LOGIN_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
const GOOGLE_MAPS_PASSWORD_SELECTOR = 'input[type="password"]';
const GOOGLE_MAPS_PASSWORD_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
const DETECTION_TIMEOUT = 10 * 1000;

// TODO: extended informations
// state: moving, standing
// last stop time, position and location
// history with previous locations
// direction calculated from samples for last n minutes
// const EXTENDED = true;
// const EXTENDED_LOCATIONS_HISTORY_FOR_MINUTES = 0;
// const EXTENDED_STOPPED_IF_MORE_THAN_MINUTES = 5;
// const EXTENDED_STOPPED_HISTORY_FOR_MINUTES = 0;
// const EXTENDED_DIRECTION_CALC_MINIMUM_MINUTES = 0;
// const EXTENDED_SPEED_CALC_MINIMUM_MINUTES = 0;

// data extract configuration
const PARSER_TIMESTAMP = '8';
const PARSER_PERSONS = '0';
const PARSER_MY_DATA = '9';
const PARSER_PERSON_ID = '6.0';
const PARSER_PERSON_PHOTO_URL = '6.1';
const PARSER_PERSON_FULL_NAME = '6.2';
const PARSER_PERSON_SHORT_NAME = '6.3';
const PARSER_PERSON_LOCATION_DATA = '1';
const PARSER_OWNER_FULL_NAME = '16.0';
const PARSER_OWNER_SHORT_NAME = '';
const PARSER_OWNER_PHOTO_URL = '16.1.6.0';
const PARSER_LOCATION_DATA_LONGITUDE = '1.1';
const PARSER_LOCATION_DATA_LATITUDE = '1.2';
const PARSER_LOCATION_DATA_TIMESTAMP = '2';
const PARSER_LOCATION_DATA_ADDRESS = '4';
const PARSER_LOCATION_DATA_COUNTRY = '6';
const PARSER_OWNER_DATA = '9';
const PARSER_OWNER_LOCATION_TIMESTAMP = '1.2';
const PARSER_OWNER_LOCATION_LONGITUDE = '1.1.1';
const PARSER_OWNER_LOCATION_LATITUDE = '1.1.2';
const PARSER_OWNER_LOCATION_ADDRESS = '1.4';
const PARSER_OWNER_LOCATION_COUNTRY = '1.6';

export interface GPosition {
  timestamp?: string;
  longitude?: string;
  latitude?: string;
  address?: string;
  country?: string;
}

export interface GStop {
  duration?: string;
  position?: GPosition;
}

export interface GTransfer {
  duration?: string;
  speed?: string;
  distance?: string;
  from?: GPosition;
  to?: GPosition;
  path?: GPosition[];
}

export interface GEntity {
  id?: string;
  fullName?: string;
  shortName?: string;
  photoUrl?: string;
  position?: GPosition;
  positionHistory?: GPosition[];

}

export interface GLocations {
  state?: GStep;
  timestamp?: string;
  error?: GError;
  entities?: GEntity[];
}

// TODO: store history and calculate direction and speed
/**
 * Configuration for browser, page, credentials, parser, extended data
 */
export interface GConfiguration {
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
   * Account owner photo url is not automatically detected, please set it here
   */
  ownerPhotoUrl?: string;
  /**
   * Account owner full name is not automatically detected, please set it here
   */
  ownerFullName?: string;
  /**
   * Account owner short name is not automatically detected, please set it here
   */
  ownerShortName?: string;
  /**
   * URL to Google maps.
   */
  googleMapsUrl?: string;
  /**
   * Substring from URL containing data about account owner.
   */
  ownerUrlSubstring?: string;
  /**
   * Substring from URL containing shared location data. Only responses with this substring in URL will be further parsed.
   */
  locationSharingUrlSubstring?: string;
  /**
   * If the response from the server for owner data must be cleared of the initial characters to be valid JSON, enter here how many first characters from response do not include to JSON.parse.
   */
  ownerResponseSkipStartFix?: number;
  /**
   * If the response from the server for shared locations data must be cleared of the initial characters to be valid JSON, enter here how many first characters from response do not include to JSON.parse.
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
  parserPathTimestamp?: string;
  parserPathPersons?: string;
  parserPathMyData?: string;
  parserPathPersonId?: string;
  parserPathPersonPhotoUrl?: string;
  parserPathPersonFullName?: string;
  parserPathPersonShortName?: string;
  parserPathPersonLocationData?: string;
  parserPathOwnerPhotoUrl?: string;
  parserPathOwnerFullName?: string;
  parserPathOwnerShortName?: string;
  parserPathLocationDataLongitude?: string;
  parserPathLocationDataLatitude?: string;
  parserPathLocationDataTimestamp?: string;
  parserPathLocationDataAddress?: string;
  parserPathLocationDataCountry?: string;
  parserPathOwnerData?: string;
  parserPathOwnerLocationTimestamp?: string;
  parserPathOwnerLocationLongitude?: string;
  parserPathOwnerLocationLatitude?: string;
  parserPathOwnerLocationAddress?: string;
  parserPathOwnerLocationCountry?: string;
}

export const defaultConfiguration: GConfiguration = {
  googleMapsUrl: GOOGLE_MAPS_URL,
  ownerUrlSubstring: GOOGLE_MAPS_OWNER_URL_SUBSTRING,
  locationSharingUrlSubstring: GOOGLE_MAPS_LOCATION_SHARING_URL_SUBSTRING,
  ownerResponseSkipStartFix: GOOGLE_MAPS_OWNER_RESPONSE_SKIP_START_FIX,
  locationSharingResponseSkipStartFix: GOOGLE_MAPS_LOCATION_RESPONSE_SKIP_START_FIX,
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
  parserPathTimestamp: PARSER_TIMESTAMP,
  parserPathPersons: PARSER_PERSONS,
  parserPathMyData: PARSER_MY_DATA,
  parserPathPersonId: PARSER_PERSON_ID,
  parserPathPersonPhotoUrl: PARSER_PERSON_PHOTO_URL,
  parserPathPersonFullName: PARSER_PERSON_FULL_NAME,
  parserPathPersonShortName: PARSER_PERSON_SHORT_NAME,
  parserPathPersonLocationData: PARSER_PERSON_LOCATION_DATA,
  parserPathOwnerPhotoUrl: PARSER_OWNER_PHOTO_URL,
  parserPathOwnerFullName: PARSER_OWNER_FULL_NAME,
  parserPathOwnerShortName: PARSER_OWNER_SHORT_NAME,
  parserPathLocationDataLongitude: PARSER_LOCATION_DATA_LONGITUDE,
  parserPathLocationDataLatitude: PARSER_LOCATION_DATA_LATITUDE,
  parserPathLocationDataTimestamp: PARSER_LOCATION_DATA_TIMESTAMP,
  parserPathLocationDataAddress: PARSER_LOCATION_DATA_ADDRESS,
  parserPathLocationDataCountry: PARSER_LOCATION_DATA_COUNTRY,
  parserPathOwnerData: PARSER_OWNER_DATA,
  parserPathOwnerLocationTimestamp: PARSER_OWNER_LOCATION_TIMESTAMP,
  parserPathOwnerLocationLongitude: PARSER_OWNER_LOCATION_LONGITUDE,
  parserPathOwnerLocationLatitude: PARSER_OWNER_LOCATION_LATITUDE,
  parserPathOwnerLocationAddress: PARSER_OWNER_LOCATION_ADDRESS,
  parserPathOwnerLocationCountry: PARSER_OWNER_LOCATION_COUNTRY,
};
