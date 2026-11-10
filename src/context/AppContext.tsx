"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Locale, Translations } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

export type Theme = "light" | "dark" | "system";

interface AppContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "id";
  return (localStorage.getItem("af_locale") as Locale | null) ?? "id";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("af_theme") as Theme | null) ?? "system";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(theme);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };
    apply();

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("af_locale", l);
  }

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("af_theme", t);
  }

  return (
    <AppContext.Provider value={{ locale, setLocale, t: translations[locale], theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
