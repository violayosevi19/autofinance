"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { Theme } from "@/context/AppContext";
import type { Locale } from "@/lib/i18n";

const THEME_ICONS: Record<Theme, string> = {
  light: "☀️",
  dark: "🌙",
  system: "💻",
};

const THEME_CYCLE: Theme[] = ["system", "light", "dark"];

export default function Navbar() {
  const pathname = usePathname();
  const { t, locale, setLocale, theme, setTheme } = useApp();

  const NAV = [
    { href: "/", label: t.nav.dashboard },
    { href: "/import", label: t.nav.import },
    { href: "/parser", label: t.nav.quickParse },
    { href: "/transactions", label: t.nav.transactions },
    { href: "/entry", label: t.nav.manual },
    { href: "/budget", label: t.nav.budget },
  ];

  function cycleTheme() {
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  }

  function toggleLocale() {
    setLocale(locale === "id" ? "en" : ("id" as Locale));
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <nav className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14 overflow-x-auto">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mr-3 shrink-0">
          AutoFinance
        </span>

        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                pathname === item.href
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button
            onClick={toggleLocale}
            title={t.settings.language}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {locale === "id" ? "ID" : "EN"}
          </button>
          <button
            onClick={cycleTheme}
            title={t.settings.theme}
            className="text-sm px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {THEME_ICONS[theme]}
          </button>
        </div>
      </nav>
    </header>
  );
}
