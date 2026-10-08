import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ar from "./locales/ar.json";
import fa from "./locales/fa.json";

const savedLanguage =
  typeof window !== "undefined"
    ? window.localStorage.getItem("language")
    : null;

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    ar: {
      translation: ar,
    },
    fa: {
      translation: fa,
    },
  },

  lng: savedLanguage || "fa",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
