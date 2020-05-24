export enum GomshalState {
  Closed = 0,
  GoogleMapsNotConnected = 1,
  LoginRequired = 2,
  TwoFactorAuthenticationRequired = 3,
  UnknownAuthenticationTypeRequired = 4,
  LoggedIn = 5,
  LocationDownloadError = 6,
  LocationParsingError = 7,
  UnknownError = 8,
  Cached = 9,
  Ok = 10,
}

export enum BrowserVisibility {
  Hidden = 0,
  VisibleUntilLoggedIn = 1,
  Visible = 2,
}
