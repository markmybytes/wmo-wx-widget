"use client";

import "bootstrap-icons/font/bootstrap-icons.css";

import Cookies from "js-cookie";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {useTranslations} from "use-intl";

function LocaleButtons() {
  const router = useRouter();

  return [
    {locale: "ar", name: "لعربية"},
    {locale: "en", name: "English"},
    {locale: "zh-Hant", name: "繁體中文"},
    {locale: "zh-Hans", name: "简体中文"},
    {locale: "fr", name: "Français"},
    {locale: "de", name: "Deutsch"},
    {locale: "it", name: "Italiano"},
    {locale: "kr", name: "한국어"},
    {locale: "pl", name: "Polski"},
    {locale: "pt", name: "Português"},
    {locale: "ru", name: "Русский"},
    {locale: "es", name: "Español"},
  ].map((v, _) => {
    return (
      <button
        key={v.locale}
        data-code={v.locale}
        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          if (!event.currentTarget.dataset.code) return;

          Cookies.set("lang", event.currentTarget.dataset.code);
          router.refresh();
        }}
      >
        {v.name}
      </button>
    );
  });
}

export default function Navbar() {
  const t = useTranslations("nav");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("mousedown", (event: MouseEvent) => {
      if (
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    });
  });

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-semibold">wmo-wx-widget</span>
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            <span className="block sm:hidden">
              <i className="bi bi-house"></i>
            </span>
            <span className="hidden sm:block">{t("home")}</span>
          </Link>
          <Link href="/tool" className="text-gray-700 hover:text-gray-900">
            <span className="block sm:hidden">
              <i className="bi bi-ui-radios"></i>
            </span>
            <span className="hidden sm:block">{t("tool")}</span>
          </Link>
          <Link
            href="/forecast/1"
            className="text-gray-700 hover:text-gray-900"
          >
            <span className="block sm:hidden">
              <i className="bi bi-eyedropper"></i>
            </span>
            <span className="hidden sm:block">{t("widgetDemo")}</span>
          </Link>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <i className="bi bi-translate"></i>
          </button>
          {isDropdownOpen && (
            <div
              className="absolute right-0 z-10 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg"
              ref={dropDownRef}
            >
              <LocaleButtons></LocaleButtons>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
