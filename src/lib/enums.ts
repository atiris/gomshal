export enum GomshalState {
  Closed = 0,
  Ok = 1,
  GoogleMapsNotConnected = 1,
  LoginRequired = 2,
  TwoFactorAuthenticationRequired = 3,
  UnknownAuthenticationTypeRequired = 4,
  LoggedIn = 5,
  LocationDownloadError = 6,
  LocationParsingError = 7,
  UnknownError = 8,
}
