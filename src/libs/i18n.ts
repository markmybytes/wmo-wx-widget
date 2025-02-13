import {getRequestConfig} from "next-intl/server";
import {cookies, headers} from "next/headers";

export default getRequestConfig(async () => {
  const locale =
    headers().get("x-wx-locale") || cookies().get("lang")?.value || "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    onError(error) {
      console.log(`IntlError (${error.code}): ${error.originalMessage}`);
    },
    getMessageFallback({namespace, key, error}) {
      return key;
    },
  };
});
