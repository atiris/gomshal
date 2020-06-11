/**
 * Indicates a step that can be performed next.
 */
export enum GStep {
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
