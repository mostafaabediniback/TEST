import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageOptions } from "@/components/layout/LanguageSwitcher";
import { useLocale } from "@/context/LocaleContext";

export function SettingsPanel() {
  const { t } = useLocale();

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 text-start">
      <Card>
        <CardHeader>
          <CardTitle>{t("Language")}</CardTitle>
          <CardDescription>{t("The layout direction follows your selected language.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageOptions className="max-w-sm" />
        </CardContent>
      </Card>
    </div>
  );
}
