import type { AppLocale } from "@/i18n/routing";
import { getCachedCountries } from "@/lib/wmo-cached";
import WidgetCustomiser from "@/components/customiser/WidgetCustomiser";

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const locale = (await props.params).locale as AppLocale;

  const cityOptions = (await getCachedCountries(locale)).flatMap((country) =>
    country.cities.map((city) => ({
      value: city.id.toString(),
      label: `${country.name} - ${city.name}`,
    })),
  );

  return <WidgetCustomiser cityOptions={cityOptions} />;
}
