import type { getTranslations } from "next-intl/server";

type T = Awaited<ReturnType<typeof getTranslations<"weather">>>;
type Key = Parameters<T["has"]>[0];

/**
 * Localization for station wxdesc strings, which are free text from the
 * contributing weather service ("Partly Cloudy, Thunderstorms", the NWS's
 * "Light Rain Fog/Mist"). Best effort:
 * - repairs mechanical damage without touching the wording (stray leading
 *   spaces " Fog", missing-space concatenations "PartlyCloudy")
 * - splits on commas and renders every segment the taxonomy translation
 *   table knows, accepted in Title Case, ALL-CAPS, or lowercase
 * - unmatched segments stay exactly as the reporting station wrote them;
 *   translations are never invented, and no locale-specific list
 *   punctuation replaces the ", " join
 */
export function translateWxdesc(t: T, raw: string): string {
  return raw
    .split(",")
    .map((segment) => {
      const s = segment.replace(/([a-z])([A-Z])/g, "$1 $2").trim();
      if (!s) return "";
      const cap = s.toLowerCase().replace(/(^|[\s/])\p{L}/gu, (c) => c.toUpperCase());
      // taxonomy keys keep small words lowercased ("Thunderstorm in Vicinity")
      const lowered = cap.replace(/ (In|Of|With|On|At)(?= )/g, (w) => w.toLowerCase());
      const key = t.has(cap as Key)
        ? (cap as Key)
        : t.has(lowered as Key)
          ? (lowered as Key)
          : null;
      return key ? t(key) : s;
    })
    .filter(Boolean)
    .join(", ");
}
