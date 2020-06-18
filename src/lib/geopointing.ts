import { GPoint, GPosition } from './interfaces';

export interface GeoData {
  /**
   * Distance in selected units.
   */
  distance: number;
  /**
   * Starting azimuth in degrees.
   */
  azimuth: number;
  /**
   * Starting direction.
   */
  direction: string;
  /**
   * Speed in km/h.
   */
  speed: number;
}

export const DEFAULT_DIRECTIONS: string[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export const SECOND = 1;
export const MINUTE = 0.0166666667;
export const HOUR = 0.000277777778;

export const METER = 1;
export const KILOMETER = 0.001;
export const YARD = 1.0936133;
export const MILE = 0.000621371192;

export const DEGREE = 1;
export const RADIAN = 0.0174532925;

export const METER_PER_SECOND = 1;
export const KILOMETER_PER_HOUR = 3.6;
export const MILE_PER_HOUR = 2.23693629;
export const FEET_PER_SECOND = 3.2808399;

/**
 * Geopointing library for basic calculations between geological coordinates
 */
export class Geopointing {
  static readonly toRadians = 0.017453292519943295; // degree to radians = degree * Math.PI / 180
  static readonly earthDiameter = 12756274; // Earth diameter in meters

  public static timeUnit: number = SECOND;
  public static distanceUnit: number = METER;
  public static angleUnit: number = DEGREE;
  public static speedUnit: number = KILOMETER_PER_HOUR;
  public static directions: string[] = DEFAULT_DIRECTIONS;

  static complexPointData(
    fromPosition: GPosition,
    toPoint: GPoint,
    time?: number,
  ): GeoData {
    return this.complexData(fromPosition.latitude, fromPosition.longitude, toPoint.latitude, toPoint.longitude, time);
  }

  static complexPositionData(
    fromPosition: GPosition,
    toPosition: GPosition,
    time?: number,
  ): GeoData {
    return this.complexData(fromPosition.latitude, fromPosition.longitude, toPosition.latitude, toPosition.longitude, time);
  }

  static complexData(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
    time?: number,
  ): GeoData {
    const diffLongitude = this.toRadians * (toLongitude - fromLongitude);
    const fromLatitudeR = this.toRadians * fromLatitude;
    const toLatitudeR = this.toRadians * toLatitude;

    const distanceSquare = 0.5 - Math.cos(this.toRadians * (toLatitude - fromLatitude)) / 2 +
      Math.cos(fromLatitudeR) * Math.cos(toLatitudeR) * (1 - Math.cos(diffLongitude)) / 2;

    const distance = this.distanceUnit * this.earthDiameter * Math.asin(Math.sqrt(distanceSquare));

    const y = Math.sin(diffLongitude) * Math.cos(toLatitudeR);
    const x = Math.cos(fromLatitudeR) * Math.sin(toLatitudeR) -
      Math.sin(fromLatitudeR) * Math.cos(toLatitudeR) * Math.cos(diffLongitude);

    const azimuth = this.angleUnit * (((Math.atan2(y, x)) / this.toRadians) + 360) % 360;

    const direction = this.azimuthToDirection(azimuth);

    const speed = this.speed(distance, time);

    return {
      distance: distance,
      azimuth: azimuth,
      direction: direction,
      speed: speed,
    };
  }

  /**
   * Calculate approximate distance between two points on Earth.
   * Return distance in specific distance unit.
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

    return this.distanceUnit * this.earthDiameter * Math.asin(Math.sqrt(distanceSquare));
  }

  /**
   * Initial azimuth from input to target coordinates.
   * Azimuth in specific angle unit.
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

    return this.angleUnit * (((Math.atan2(y, x)) / this.toRadians) + 360) % 360;
  }

  /**
   * Convert azimuth to string.
   * If conversion is not set, then the basic compass directions will be used.
   * @param azimuth Azimuth in angle units
   * @param directions Any direction conversion array starting from top and continuing clockwise
   */
  static azimuthToDirection(azimuth: number): string {
    if (this.directions.length < 1) {
      return '';
    }
    const angular = 360 / this.directions.length;
    return [...this.directions, this.directions[0]][Math.round(((azimuth / this.angleUnit) % 360) / angular)];
  }

  /**
   * Calculate speed for distance and time and return speed in speed units.
   * Distance is in defined distance units. Time in time units.
   * @param distance Distance in distance unit.
   * @param time Time in time unit.
   */
  static speed(distance: number, time: number): number {
    if (distance && time) {
      return this.speedUnit * (distance / this.distanceUnit) / (time / this.timeUnit);
    }
    return 0;
  }
}
