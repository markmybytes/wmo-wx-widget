import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

/**
 * Set custom hearder for override i18n locale value.
 */
export default function intlMiddleware(req: NextRequest) {
  const headers = new Headers(req.headers);

  if (req.nextUrl.searchParams.get("locale") == "tc") {
    headers.set("x-wx-locale", "zh-Hant");
  } else if (req.nextUrl.searchParams.get("locale") == "zh") {
    headers.set("x-wx-locale", "zh-Hans");
  } else {
    headers.set("x-wx-locale", req.nextUrl.searchParams.get("locale") || "en");
  }

  return NextResponse.next({
    request: {
      headers: headers,
    },
  });
}

export const config = {
  matcher: "/forecast/:id*",
};
