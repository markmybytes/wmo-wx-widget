/** Weekday label ("Mon" / "Monday") for an ISO date string, in UTC. */
export function utcWeekday(iso: string, locale: string, width: "short" | "long" = "short"): string {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: width }).format(new Date(iso));
}

/** Day-of-month number (1–31) for an ISO date string, in UTC. */
export function utcDayNumber(iso: string): number {
  return new Date(iso).getUTCDate();
}
