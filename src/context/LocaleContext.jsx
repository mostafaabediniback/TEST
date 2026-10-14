import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import i18n from "@/i18n/config";

const LocaleContext = createContext(null);

const SUPPORTED_LOCALES = ["fa", "en", "ar"];

function readLocale() {
  if (typeof window === "undefined") {
    return "fa";
  }

  try {
    const savedLocale = window.localStorage.getItem("language");

    return SUPPORTED_LOCALES.includes(savedLocale) ? savedLocale : "fa";
  } catch {
    return "fa";
  }
}

export function LocaleProvider({ children }) {
  const [locale, updateLocale] = useState(readLocale);
  const { t } = useTranslation();

  const isRtl = locale === "fa" || locale === "ar";
  const direction = isRtl ? "rtl" : "ltr";

  const setLocale = useCallback(async (nextLocale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) {
      return;
    }

    await i18n.changeLanguage(nextLocale);
    updateLocale(nextLocale);

    try {
      window.localStorage.setItem("language", nextLocale);
    } catch {
      // Language switching still works if storage is unavailable.
    }
  }, []);

  const formatNumber = useCallback(
    (value, options) => {
      const numberLocale =
        locale === "fa" ? "fa-IR" : locale === "ar" ? "ar" : "en-US";

      return new Intl.NumberFormat(numberLocale, options).format(value);
    },
    [locale],
  );

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.title = t("welcome");
  }, [locale, direction, t]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      direction,
      isRtl,
      t,
      formatNumber,
    }),
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

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
