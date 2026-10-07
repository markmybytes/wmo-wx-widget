import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Set custom header to override the i18n locale value.
 */
export default function proxy(req: NextRequest) {
  const headers = new Headers(req.headers);

  const lang = req.nextUrl.searchParams.get("lang");
  // `tc`/`zh` are WMO codes remapped to their internal locale.
  const locale =
    lang == "tc" ? "zh-Hant" : lang == "zh" ? "zh-Hans" : lang || "en";

  headers.set("x-wx-lang", locale);

  return NextResponse.next({
    request: {
      headers: headers,
    },
  });
}

export const config = {
  matcher: "/forecast/:id*",
};
