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

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;
  const visible = filtered.slice(0, 50);

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  function select(option: CityOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative sm:max-w-md">
      <Icon
        icon="material-symbols:search"
        className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-faint"
        width="18"
        height="18"
      />

      <input
        id="city"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="city-listbox"
        aria-labelledby={labelId}
        autoComplete="off"
        className="wctl-input ps-9 pe-9"
        placeholder={t("cityPlaceholder")}
        value={query !== "" ? query : (selected?.label ?? "")}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && open && visible[activeIndex]) {
            e.preventDefault();
            select(visible[activeIndex]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      {selected && (
        <button
          type="button"
          aria-label={t("clear")}
          className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-faint hover:bg-fill hover:text-muted"
          onClick={() => {
            onChange("");
            setQuery("");
          }}
        >
          <Icon icon="material-symbols:close" width="16" height="16" />
        </button>
      )}

      {open && (
        <ul
          id="city-listbox"
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-outline bg-surface py-1.5 shadow-lg"
        >
          {visible.length === 0 && (
            <li className="px-3 py-2 text-sm text-faint">{t("cityNoResults")}</li>
          )}
          {visible.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm ${
                  i === activeIndex ? "bg-brand-wash text-foreground" : "text-muted"
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => select(o)}
              >
                {o.label}
                {o.value === value && (
                  <Icon
                    icon="material-symbols:check"
                    className="text-brand-solid"
                    width="16"
                    height="16"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
