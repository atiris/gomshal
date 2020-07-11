/**
 * Indicates a step that is currently being performed or should be executed next.
 * Once opened, the library is in the initialize state, which means that initialization is still in progress. subsequently, if a login is required, the library remains in the LoginAndPassword state. When a two-factor authentication is requested until it is performed, the library will be in the TwoFactorConfirmation state. The LocationData state will be active if the library loads the page correctly and detects location data.
 */
export enum GState {
  Initialize = 0,
  LoginAndPassword = 1,
  TwoFactorConfirmation = 2,
  LocationData = 3,
  Close = 4,
}

/**
 * Error codes for initialization and location detecting.
 */
export enum GError {
  NoError = 0,
  CanNotLaunchBrowser = 1,
  WrongGoogleMapsSite = 2,
  MissingLoginOrPassword = 3,
  WrongAuthentication = 4,
  NoTwoFactorConfirmation = 5,
  NoLocationDataDetected = 6,
  LocationDataParsingError = 7,
}
