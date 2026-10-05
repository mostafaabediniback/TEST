import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

const languages = [
  { value: "fa", label: "فارسی", direction: "rtl" },
  { value: "en", label: "English", direction: "ltr" },
];

export function LanguageOptions({ className }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div role="group" aria-label={t("Language")} className={cn("grid grid-cols-2 gap-2", className)}>
      {languages.map((language) => (
        <Button
          key={language.value}
          type="button"
          variant={locale === language.value ? "default" : "outline"}
          onClick={() => setLocale(language.value)}
          aria-pressed={locale === language.value}
          className="justify-between gap-3"
        >
          <span lang={language.value} dir={language.direction}>{language.label}</span>
          <Check aria-hidden="true" className={cn("size-4", locale !== language.value && "invisible")} />
        </Button>
      ))}
    </div>
  );
}

export function LanguageSwitcher() {
  const { locale, direction, t } = useLocale();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" className="h-10 shrink-0 gap-2 px-3" aria-label={t("Change language")} title={t("Change language")} />
        }
      >
        <Languages aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline" lang={locale}>{locale === "fa" ? "فارسی" : "English"}</span>
      </PopoverTrigger>
      <PopoverContent align="end" dir={direction} className="w-64 max-w-[calc(100vw-2rem)] space-y-3 text-start">
        <PopoverTitle>{t("Language")}</PopoverTitle>
        <LanguageOptions />
      </PopoverContent>
    </Popover>
  );
}
