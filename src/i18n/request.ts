import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const requested = await rootParams.locale();
    if (hasLocale(routing.locales, requested)) {
      locale = requested;
    }
  }
  if (!locale) {
    notFound();
  }

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
