import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {getLocale, getMessages} from "next-intl/server";
import {Inter} from "next/font/google";

import "../../public/globals.css";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "wmo-wx-widget",
  description:
    "A responsive, self-hosted weather widget that provide official weather information around the world.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale == "ar" ? "rtl" : "ltr"}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
