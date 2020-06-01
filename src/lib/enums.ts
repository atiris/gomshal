export enum GomshalWaitingFor {
  Initialize = 0,
  LoginAndPassword = 1,
  TwoFactorConfirmation = 2,
  LocationData = 3,
}

export enum GomshalError {
  NoError = 0,
  WrongGoogleMapsSite = 1,
  MissingLoginOrPassword = 2,
  WrongAuthentication = 3,
  NoTwoFactorConfirmation = 4,
  NoLocationDataDetected = 5,
  LocationDataParsingError = 6,
}
