"use client";

import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export type CityOption = { value: string; label: string };

export default function CityPicker({
  labelId,
  options,
  value,
  onChange,
}: {
  labelId: string;
  options: CityOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("common");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;
  const visible = filtered.slice(0, 50);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && listRef.current && visible.length > 0) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open, visible.length]);

  function handleSelect(option: CityOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="relative flex items-center">
        <Icon
          icon="material-symbols:search"
          className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-faint"
          width="18"
          height="18"
        />

        <input
          ref={inputRef}
          id="city"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="city-listbox"
          aria-labelledby={labelId}
          autoComplete="off"
          className="wctl-input h-9 ps-9 pe-9 text-xs"
          placeholder={t("cityPlaceholder")}
          value={query !== "" ? query : (selected?.label ?? "")}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && visible.length > 0) {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && open && visible[activeIndex]) {
              e.preventDefault();
              handleSelect(visible[activeIndex]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />

        {selected || query ? (
          <button
            type="button"
            aria-label={t("clear")}
            className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-faint hover:bg-fill hover:text-muted"
            onClick={() => {
              onChange("");
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <Icon icon="material-symbols:close" width="16" height="16" />
          </button>
        ) : (
          <Icon
            icon="material-symbols:keyboard-arrow-down"
            className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-faint"
            width="18"
            height="18"
          />
        )}
      </div>

      {open && (
        <ul
          ref={listRef}
          id="city-listbox"
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-outline bg-surface py-1.5 shadow-xl"
        >
          {visible.length === 0 ? (
            <li className="px-3 py-2 text-sm text-faint">{t("cityNoResults")}</li>
          ) : (
            visible.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-start text-sm transition-colors ${
                      isActive ? "bg-brand-wash font-medium text-foreground" : "text-muted"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(option)}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <Icon
                        icon="material-symbols:check"
                        className="text-brand-solid"
                        width="16"
                        height="16"
                      />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
