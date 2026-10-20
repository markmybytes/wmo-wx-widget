/** Client-safe weather units. Zero deps: safe in client bundles. */

export enum TempUnit {
  C = "°C",
  F = "°F",
}

export enum WindUnit {
  ms = "m/s",
  kmh = "km/h",
  mph = "mph",
  kn = "kn",
}

/** Converts a m/s wind reading to the requested display unit, rounded to 1 dp. Null passes through. */
export function windByUnit(ms: number | null | undefined, unit: WindUnit): number | null {
  if (ms === null || ms === undefined) {
    return null;
  }

  switch (unit) {
    case WindUnit.kmh:
      return Math.round(ms * 3.6 * 10) / 10;
    case WindUnit.mph:
      return Math.round(ms * 2.23694 * 10) / 10;
    case WindUnit.kn:
      return Math.round(ms * 1.94384 * 10) / 10;
    case WindUnit.ms:
      return Math.round(ms * 10) / 10;
  }
}
