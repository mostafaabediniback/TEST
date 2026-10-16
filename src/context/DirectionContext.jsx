import { createContext, useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

const DirectionContext = createContext(null);

const RTL_LANGUAGES = ["ar", "fa", "he", "ur"];

export function DirectionProvider({ children }) {
  const { i18n } = useTranslation();

  const language = i18n.resolvedLanguage || i18n.language || "en";
  const languageCode = language.split("-")[0];

  const isRtl = RTL_LANGUAGES.includes(languageCode);
  const direction = isRtl ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = languageCode;
  }, [direction, languageCode]);

  const changeLanguage = async (nextLanguage) => {
    await i18n.changeLanguage(nextLanguage);
  };

  const value = useMemo(
    () => ({
      language: languageCode,
      direction,
      isRtl,
      changeLanguage,
    }),
    [languageCode, direction, isRtl]
  );

  return (
    <DirectionContext.Provider value={value}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection() {
  const context = useContext(DirectionContext);

  if (!context) {
    throw new Error(
      "useDirection must be used inside DirectionProvider"
    );
  }

  return context;
}
