"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const LOCALES = [
  { locale: "ar", name: "لعربية" },
  { locale: "en", name: "English" },
  { locale: "zh-Hant", name: "繁體中文" },
  { locale: "zh-Hans", name: "简体中文" },
  { locale: "fr", name: "Français" },
  { locale: "de", name: "Deutsch" },
  { locale: "it", name: "Italiano" },
  { locale: "ko", name: "한국어" },
  { locale: "pl", name: "Polski" },
  { locale: "pt", name: "Português" },
  { locale: "ru", name: "Русский" },
  { locale: "es", name: "Español" },
];

const LINKS = [
  { href: "/", label: "home", icon: "material-symbols:home-outline" },
  { href: "/tool", label: "tool", icon: "material-symbols:tune" },
  {
    href: "/forecast/1",
    label: "widgetDemo",
    icon: "material-symbols:visibility-outline",
  },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const usrLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleMouseDown(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isDropdownOpen]);

  return (
    <nav className="sticky top-0 z-40 border-b border-outline bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-x-8">
          <span className="flex items-center gap-x-2 text-base font-semibold tracking-tight text-foreground">
            <img src="/icon.svg" alt="" width="22" height="22" />
            wmo-wx-widget
          </span>

          <div className="flex items-center gap-x-1">
            {LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-x-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-fill font-medium text-foreground"
                      : "text-muted hover:bg-fill hover:text-foreground"
                  }`}
                >
                  <Icon icon={link.icon} width="18" height="18" />
                  <span className="hidden sm:inline">{t(link.label)}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
            aria-label={LOCALES.find((v) => v.locale === usrLocale)?.name}
            className="flex items-center gap-x-1 rounded-lg p-2 text-muted transition-colors hover:bg-fill hover:text-foreground"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Icon icon="material-symbols:translate" width="20" height="20" />
          </button>

          {isDropdownOpen && (
            <div
              role="menu"
              className="absolute end-0 z-50 mt-2 w-40 rounded-xl border border-outline bg-surface py-1.5 shadow-lg"
            >
              {LOCALES.map((v) => (
                <button
                  key={v.locale}
                  role="menuitem"
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-muted hover:bg-fill hover:text-foreground"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    document.cookie = `lang=${v.locale}; path=/; max-age=31536000; samesite=lax`;
                    router.refresh();
                  }}
                >
                  {v.name}
                  {v.locale === usrLocale && (
                    <Icon
                      icon="material-symbols:check"
                      className="text-brand"
                      width="16"
                      height="16"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
