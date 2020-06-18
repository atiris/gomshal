import { GError, GStep } from './enums';

// browser and page configuration
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/';
const GOOGLE_MAPS_LOADED_URL_SUBSTRING = 'google.com/maps/';
const GOOGLE_MAPS_OWNER_URL_SUBSTRING = '/locationhistory/preview/mas';
const GOOGLE_MAPS_LOCATION_SHARING_URL_SUBSTRING = '/maps/rpc/locationsharing/read';
const GOOGLE_MAPS_OWNER_RESPONSE_SKIP_START_FIX = 4;
const GOOGLE_MAPS_LOCATION_RESPONSE_SKIP_START_FIX = 4;
const GOOGLE_MAPS_LOGOUT_BUTTON_SELECTOR = 'a[href*="SignOut"]';
const GOOGLE_MAPS_LOGIN_BUTTON_SELECTOR = 'a[href*="ServiceLogin"]';

const GOOGLE_ACCOUNT_USE_ANOTHER_ACCOUNT_BUTTON_SELECTOR = 'li:nth-child(2) div[role="link"]';
const GOOGLE_ACCOUNT_EMAIL_INPUT_SELECTOR = 'input[type="email"]';
const GOOGLE_ACCOUNT_EMAIL_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
const GOOGLE_ACCOUNT_PASSWORD_INPUT_SELECTOR = 'input[type="password"]';
const GOOGLE_ACCOUNT_PASSWORD_NEXT_BUTTON_SELECTOR = 'div[role=button][id]';
const GOOGLE_ACCOUNT_TWO_FACTOR_WAITING_URL_SUBSTRING = 'accounts.google.com/signin/v2/challenge';

const DETECTION_TIMEOUT = 15 * 1000;
const DISTANCE_FOR_MOVEMENT_MIN_METERS = 50;

// extended data default values
const EXTENDED = true;
const EXTENDED_LOCATIONS_HISTORY_MIN_MINUTES = 24 * 60;
const EXTENDED_LOCATIONS_HISTORY_MIN_SEGMENTS = 10;
const EXTENDED_STOP_MIN_TIME_MINUTES = 5;

// data extract configuration
const PARSER_TIMESTAMP = '8';
const PARSER_PERSONS = '0';
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

/**
 * Reference point on the map with respect to the current movement.
 */
export interface GPoint {
  /**
   * Any identificator.
   */
  id?: string;
  /**
   * Longitude position of point (horizontal direction - west east).
   */
  longitude?: number;
  /**
   * Latitude position of point (vertical direction - north south).
   */
  latitude?: number;
  /**
   * Address or name of this location point.
   */
  address?: string;
  /**
   * Radius to assess whether the object is inside the specified point.
   */
  radius?: number;
  /**
   * Whether the object is within this point area.
   */
  inside?: boolean;
  /**
   * Distance in meters to this point.
   */
  distance?: number;
  /**
   * Speed to this point.
   * A positive speed means that the object is approaching a point, negative speed means moving away from point.
   */
  speed?: number;
  /**
   * Normalized speed to this point.
   * Averages the speed for the connected route.
   * A positive speed means that the object is approaching a point, negative speed means moving away from point.
   */
  normalizedSpeed?: number;
}

/**
 * Detected position.
 */
export interface GPosition {
  /**
   * Timestamp for this position.
   */
  timestamp?: number;
  /**
   * Longitude position of point (horizontal direction - west east).
   */
  longitude?: number;
  /**
   * Latitude position of point (vertical direction - north south).
   */
  latitude?: number;
  /**
   * Address or name of this position.
   */
  address?: string;
  /**
   * Country code if is returned by location data.
   */
  country?: string;
}

/**
 * Segment is a path or standing point.
 */
export interface GSegment {
  /**
   * First timestamp when this segment (standing point or movement) was recorded.
   */
  timestampFrom?: number;
  /**
   * Last timestam for this segment.
   */
  timestampTo?: number;
  /**
   * Duration of this segment.
   * The time that the monitored object remained in one place or the time that was needed to move.
   */
  duration?: string;
  /**
   * The speed that was achieved within the segment.
   * In the case of staying in place, the speed will be 0.
   */
  speed?: string;
  /**
   * The distance that was covered within the segment.
   * If it was a segment capturing the stay in place, the distance will be 0.
   */
  distance?: string;
  /**
   * Starting point for segment.
   */
  positionFrom?: GPosition;
  /**
   * Ending point for segment.
   */
  positionTo?: GPosition;
  /**
   * All detected positions during monitoring this segment.
   */
  path?: GPosition[];
  /**
   * All points where this segment is inside (in point radius).
   */
  inside?: GPoint[];
}

/**
 * Entity location data.
 */
export interface GEntity {
  /**
   * Any entity identificator.
   */
  id?: string;
  /**
   * Entity full name.
   */
  fullName?: string;
  /**
   * Entity short name.
   */
  shortName?: string;
  /**
   * URL to entity picture.
   */
  photoUrl?: string;
  /**
   * Last known position.
   */
  position?: GPosition;
  /**
   * Segments are standing points or movements where location of entity was recorded.
   * The segments are sorted from newest to oldest.
   * If you want to know last activity, you can get first segement from it.
   * It can be the point at which the entity occurred for some time, or the route it traveled.
   */
  segments?: GSegment[];
  /**
   * Current reference to predefined static points and to other watched entities.
   */
  references?: GPoint[];
}

export interface GLocations {
  entities?: GEntity[];
  timestamp?: string;
  state?: GStep;
  error?: GError;
}

/**
 * Configuration for browser, page, credentials, parser, extended data
 */
export interface GConfiguration {
  /**
   * Write only google account login name - email.
   */
  name?: string;
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
   * Substring to identify if google maps is loaded
   */
  googleMapsLoadedUrlSubstring?: string;
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
  logoutButtonSelector?: string;
  /**
   * CSS selector for identification if user is not logged in and can click on login button.
   */
  loginButtonSelector?: string;
  /**
   * CSS selector for "select another account" in Google account login process.
   */
  googleAccountUseAnotherAccountButtonSelector?: string;
  /**
   * CSS selector for Google account login input to enter email.
   */
  googleAccountEmailInputSelector?: string;
  /**
   * CSS selector for button to click if login email is set.
   */
  googleAccountEmailNextButtonSelector?: string;
  /**
   * CSS selector for Google account password input.
   */
  googleAccountPasswordInputSelector?: string;
  /**
   * CSS selector for button to click if Google account password is set.
   */
  googleAccountPasswordNextButtonSelector?: string;
  /**
   * URL substring to identify two factor authentication waiting
   */
  googleAccountTwoFactorWaitingUrlSubstring?: string;
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
   * Default detection timeout for any web request in milliseconds.
   */
  requestDetectionTimeout?: number;
  /**
   * Ignore any movement if changed position is closer than this number of meters.
   */
  distanceForMovementMinMeters?: number;
  /**
   * If gomshal should calculate and collect additional information, enter true.
   */
  extended?: boolean;
  /**
   * Minimum number of minutes that each user's location history should be stored.
   */
  extendedLocationsHistoryMinMinutes?: number;
  /**
   * Minimum number of segments that each user's location history should be stored.
   */
  extendedLocationsHistoryMinSegments?: number;
  /**
   * If this time is exceeded at one point, the object is already considered stopped.
   */
  extendedStopMinTimeMinutes?: number;
  /**
   * Path to timestamp in shared locations JSON response.
   */
  parserPathTimestamp?: string;
  /**
   * Path to persons data JSON in shared locations JSON response.
   */
  parserPathPersons?: string;
  /**
   * Path how to extract person id from persons JSON.
   */
  parserPathPersonId?: string;
  /**
   * Path how to extract url to person photo from persons JSON.
   */
  parserPathPersonPhotoUrl?: string;
  /**
   * Path how to extract person full name from persons JSON.
   */
  parserPathPersonFullName?: string;
  /**
   * Path how to extract person short name from persons JSON.
   */
  parserPathPersonShortName?: string;
  /**
   * Path how to extract location data from person JSON data.
   */
  parserPathPersonLocationData?: string;
  /**
   * Path to get owner photo URL (alternative response).
   */
  parserPathOwnerPhotoUrl?: string;
  /**
   * Path to get owner full name (alternative response).
   */
  parserPathOwnerFullName?: string;
  /**
   * Path to get owner short name (alternative response).
   */
  parserPathOwnerShortName?: string;
  /**
   * Path to get longitude (horizontal direction - west east) from location data JSON.
   * In this example for central Europe: 48.1234567,17.1234567
   * Longitude is second parameter 17.1234567
   */
  parserPathLocationDataLongitude?: string;
  /**
   * Path to get latitude (vertical direction - north south) from location data JSON.
   * In this example for central Europe: 48.1234567,17.1234567
   * Latitude is first parameter 48.1234567
   */
  parserPathLocationDataLatitude?: string;
  /**
   * Path to timestamp when this location is valid.
   */
  parserPathLocationDataTimestamp?: string;
  /**
   * Path to address string for location.
   */
  parserPathLocationDataAddress?: string;
  /**
   * Path to location country.
   * is less accurate than the country indicated in the address and may not be reported correctly near the border.
   */
  parserPathLocationDataCountry?: string;
  /**
   * Path to owner data JSON (for logged in google account user).
   */
  parserPathOwnerData?: string;
  /**
   * Path to owner's location timestamp from owner data JSON.
   */
  parserPathOwnerLocationTimestamp?: string;
  /**
   * Path to owner's location longitude from owner data JSON.
   */
  parserPathOwnerLocationLongitude?: string;
  /**
   * Path to owner's location latitude from owner data JSON.
   */
  parserPathOwnerLocationLatitude?: string;
  /**
   * Path to owner's location address from owner data JSON.
   */
  parserPathOwnerLocationAddress?: string;
  /**
   * Path to owner's location country from owner data JSON.
   */
  parserPathOwnerLocationCountry?: string;
}

export const defaultConfiguration: GConfiguration = {
  googleMapsUrl: GOOGLE_MAPS_URL,
  googleMapsLoadedUrlSubstring: GOOGLE_MAPS_LOADED_URL_SUBSTRING,
  ownerUrlSubstring: GOOGLE_MAPS_OWNER_URL_SUBSTRING,
  locationSharingUrlSubstring: GOOGLE_MAPS_LOCATION_SHARING_URL_SUBSTRING,
  ownerResponseSkipStartFix: GOOGLE_MAPS_OWNER_RESPONSE_SKIP_START_FIX,
  locationSharingResponseSkipStartFix: GOOGLE_MAPS_LOCATION_RESPONSE_SKIP_START_FIX,
  logoutButtonSelector: GOOGLE_MAPS_LOGOUT_BUTTON_SELECTOR,
  loginButtonSelector: GOOGLE_MAPS_LOGIN_BUTTON_SELECTOR,
  googleAccountUseAnotherAccountButtonSelector: GOOGLE_ACCOUNT_USE_ANOTHER_ACCOUNT_BUTTON_SELECTOR,
  googleAccountEmailInputSelector: GOOGLE_ACCOUNT_EMAIL_INPUT_SELECTOR,
  googleAccountEmailNextButtonSelector: GOOGLE_ACCOUNT_EMAIL_NEXT_BUTTON_SELECTOR,
  googleAccountPasswordInputSelector: GOOGLE_ACCOUNT_PASSWORD_INPUT_SELECTOR,
  googleAccountPasswordNextButtonSelector: GOOGLE_ACCOUNT_PASSWORD_NEXT_BUTTON_SELECTOR,
  googleAccountTwoFactorWaitingUrlSubstring: GOOGLE_ACCOUNT_TWO_FACTOR_WAITING_URL_SUBSTRING,
  headless: true,
  hideAfterLogin: false,
  showDevTools: false,
  requestDetectionTimeout: DETECTION_TIMEOUT,
  distanceForMovementMinMeters: DISTANCE_FOR_MOVEMENT_MIN_METERS,
  extended: EXTENDED,
  extendedLocationsHistoryMinMinutes: EXTENDED_LOCATIONS_HISTORY_MIN_MINUTES,
  extendedLocationsHistoryMinSegments: EXTENDED_LOCATIONS_HISTORY_MIN_SEGMENTS,
  extendedStopMinTimeMinutes: EXTENDED_STOP_MIN_TIME_MINUTES,
  parserPathTimestamp: PARSER_TIMESTAMP,
  parserPathPersons: PARSER_PERSONS,
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
