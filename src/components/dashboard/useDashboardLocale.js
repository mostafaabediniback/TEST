import { useMemo } from "react";
import { useLocale } from "@/context/LocaleContext";
import i18n from "@/i18n/config";

const formatNumber = (value, options) =>
  new Intl.NumberFormat("en-US", options).format(value);

/** Keep the new dashboard in English without changing the application's locale. */
export function useDashboardLocale() {
  const appLocale = useLocale();
  const t = useMemo(() => i18n.getFixedT("en"), []);
  return {
    ...appLocale,
    locale: "en",
    direction: "ltr",
    isRtl: false,
    t,
    formatNumber,
  };
}
