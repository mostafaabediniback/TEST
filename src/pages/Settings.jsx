import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { useLocale } from "@/context/LocaleContext";

export default function Settings() {
  const { t } = useLocale();
  return (
    <section className="h-full overflow-y-auto bg-muted/30 p-4 sm:p-6" aria-labelledby="settings-title">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 id="settings-title" className="text-xl font-semibold">{t("Settings")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Choose your language and preferences.")}</p>
        </div>
        <SettingsPanel />
      </div>
    </section>
  );
}
