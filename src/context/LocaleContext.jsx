import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { translate } from "@/i18n/messages";

const STORAGE_KEY = "layout-starter-locale";
const LocaleContext = createContext(null);

function readLocale() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "fa";
  } catch {
    return "fa";
  }
}

export function LocaleProvider({ children }) {
  const [locale, updateLocale] = useState(readLocale);
  const isRtl = locale === "fa";
  const direction = isRtl ? "rtl" : "ltr";

  const setLocale = useCallback((nextLocale) => {
    if (nextLocale === "fa" || nextLocale === "en") updateLocale(nextLocale);
  }, []);

  const t = useCallback((key, params) => translate(locale, key, params), [locale]);
  const formatNumber = useCallback(
    (value, options) => new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", options).format(value),
    [locale],
  );

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.title = t("Starter layout");
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Language switching still works when browser storage is unavailable.
    }
  }, [locale, direction, t]);

  const value = useMemo(
    () => ({ locale, setLocale, direction, isRtl, t, formatNumber }),
    [locale, setLocale, direction, isRtl, t, formatNumber],
  );

  return (
    <LocaleContext.Provider value={value}>
      <DirectionProvider direction={direction}>{children}</DirectionProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
