export class Geopointing {
  static readonly toRadians = 0.017453292519943295; // degree to radians = degree * Math.PI / 180
  static readonly earthDiameter = 12756274; // Earth diameter in meters

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
   * @param azimuth Azimuth in degrees
   * @param conversion Any conversion array starting from top and continuing clockwise
   */
  static azimuthToString(azimuth: number, conversion: string[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']): string {
    const angular = 360 / conversion.length;
    return [...conversion, ...conversion[0]][Math.round((azimuth % 360) / angular)];
  }
}
