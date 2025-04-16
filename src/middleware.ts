import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

/**
 * Set custom hearder for override i18n locale value.
 */
export default function intlMiddleware(req: NextRequest) {
  const headers = new Headers(req.headers);

  if (req.nextUrl.searchParams.get("lang") == "tc") {
    headers.set("x-wx-lang", "zh-Hant");
  } else if (req.nextUrl.searchParams.get("lang") == "zh") {
    headers.set("x-wx-lang", "zh-Hans");
  } else {
    headers.set("x-wx-lang", req.nextUrl.searchParams.get("lang") || "en");
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
