import type { AppLocale } from "@/i18n/routing";
import { wmo } from "@/lib/wmo-cached";
import WidgetCustomiser from "@/components/customiser/WidgetCustomiser";

export const revalidate = 604800;

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const locale = (await props.params).locale as AppLocale;

  const cityOptions = (await wmo.countries(locale)).flatMap((country) =>
    country.cities.map((city) => ({
      value: city.id.toString(),
      label: `${country.name} - ${city.name}`,
    })),
  );

  return <WidgetCustomiser cityOptions={cityOptions} />;
}
