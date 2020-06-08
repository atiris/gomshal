export interface ComplexData {
  distance: number;
  azimuth: number;
  direction: string;
  speedMS: number;
  speedKmH: number;
}

/**
 * Geopointing library for basic calculations between geological coordinates
 */
export class Geopointing {
  static readonly toRadians = 0.017453292519943295; // degree to radians = degree * Math.PI / 180
  static readonly earthDiameter = 12756274; // Earth diameter in meters
  static readonly defaultDicrectionConversion: string[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  static complexData(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
    time?: number,
    directions: string[] = this.defaultDicrectionConversion
  ): ComplexData {
    const diffLongitude = this.toRadians * (toLongitude - fromLongitude);
    const fromLatitudeR = this.toRadians * fromLatitude;
    const toLatitudeR = this.toRadians * toLatitude;

    const distanceSquare = 0.5 - Math.cos(this.toRadians * (toLatitude - fromLatitude)) / 2 +
      Math.cos(fromLatitudeR) * Math.cos(toLatitudeR) * (1 - Math.cos(diffLongitude)) / 2;

    const distance = Math.round(this.earthDiameter * Math.asin(Math.sqrt(distanceSquare)));

    const y = Math.sin(diffLongitude) * Math.cos(toLatitudeR);
    const x = Math.cos(fromLatitudeR) * Math.sin(toLatitudeR) -
      Math.sin(fromLatitudeR) * Math.cos(toLatitudeR) * Math.cos(diffLongitude);

    const azimuth = Math.round((((Math.atan2(y, x)) / this.toRadians) + 360) % 360);

    const direction = this.azimuthToDirection(azimuth, directions);

    const speedMS = this.speed(distance, time);
    const speedKmH = this.speedKmH(distance, time);

    return { distance: distance, azimuth: azimuth, direction: direction, speedMS: speedMS, speedKmH: speedKmH };
  }

  /**
   * Calculate approximate distance between two points on Earth.
   * Return distance rounded to meters.
   * @param fromLatitude latitude coordinate for "from" position
   * @param fromLongitude longitude coordinate for "from" position
   * @param toLatitude latitude coordinate for "to" position
   * @param toLongitude longitude coordinate for "to" position
   */
  static distance(fromLatitude: number, fromLongitude: number, toLatitude: number, toLongitude: number): number {
    const diffLongitude = this.toRadians * (toLongitude - fromLongitude);
    const fromLatitudeR = this.toRadians * fromLatitude;
    const toLatitudeR = this.toRadians * toLatitude;

    const distanceSquare = 0.5 - Math.cos(this.toRadians * (toLatitude - fromLatitude)) / 2 +
      Math.cos(fromLatitudeR) * Math.cos(toLatitudeR) * (1 - Math.cos(diffLongitude)) / 2;

    return Math.round(this.earthDiameter * Math.asin(Math.sqrt(distanceSquare)));
  }

  /**
   * Initial azimuth from input to target coordinates.
   * Azimuth in degrees.
   * @param fromLatitude latitude coordinate for "from" position
   * @param fromLongitude longitude coordinate for "from" position
   * @param toLatitude latitude coordinate for "to" position
   * @param toLongitude longitude coordinate for "to" position
   */
  static azimuth(fromLatitude: number, fromLongitude: number, toLatitude: number, toLongitude: number): number {
    const diffLongitude = this.toRadians * (toLongitude - fromLongitude);
    const fromLatitudeR = this.toRadians * fromLatitude;
    const toLatitudeR = this.toRadians * toLatitude;

    const y = Math.sin(diffLongitude) * Math.cos(toLatitudeR);
    const x = Math.cos(fromLatitudeR) * Math.sin(toLatitudeR) -
      Math.sin(fromLatitudeR) * Math.cos(toLatitudeR) * Math.cos(diffLongitude);

    return Math.round((((Math.atan2(y, x)) / this.toRadians) + 360) % 360);
  }

  /**
   * Convert azimuth to string.
   * If conversion is not set, then the basic compass directions will be used.
   * @param azimuth Azimuth in degrees
   * @param directions Any direction conversion array starting from top and continuing clockwise
   */
  static azimuthToDirection(azimuth: number, directions: string[] = this.defaultDicrectionConversion): string {
    const angular = 360 / directions.length;
    return [...directions, directions[0]][Math.round((azimuth % 360) / angular)];
  }

  /**
   * Calculate speed in meters per second
   * @param distance distance in meters
   * @param time time in seconds
   */
  static speed(distance: number, time?: number): number {
    if (time) {
      return Math.round(distance / time);
    }
    return 0;
  }

  /**
   * Calculate speed in kilometers per hour
   * @param distance distance in meters
   * @param time time in seconds
   */
  static speedKmH(distance: number, time: number): number {
    if (time) {
      return Math.round(3.6 * distance / time);
    }
    return 0;
  }
}
