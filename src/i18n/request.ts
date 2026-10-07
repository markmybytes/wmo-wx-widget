import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  const requested =
    (await headers()).get("x-wx-lang") ||
    (await cookies()).get("lang")?.value ||
    "en";
  // `kr` is the legacy code kept for backwards compatibility with existing cookies.
  const locale = requested == "kr" ? "ko" : requested;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    onError(error) {
      console.log(`IntlError (${error.code}): ${error.originalMessage}`);
    },
    getMessageFallback({ key }) {
      return key;
    },
  };
});
