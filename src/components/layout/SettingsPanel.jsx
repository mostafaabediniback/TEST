import { useId } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LanguageOptions } from "@/components/layout/LanguageSwitcher";
import { useCarFilters } from "@/context/CarFilterContext";
import { useLocale } from "@/context/LocaleContext";

function ToggleRow({ checked, onCheckedChange, label, disabled, descriptionId }) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4 rounded-md px-1 py-3">
      <label htmlFor={id} className={`text-sm ${disabled ? "text-muted-foreground" : "cursor-pointer text-foreground"}`}>
        {label}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-describedby={descriptionId} />
    </div>
  );
}

export function MapLayerControls() {
  const { showRaster, setShowRaster, showVector, setShowVector } = useCarFilters();
  const { t } = useLocale();
  const descriptionId = useId();
  const vectorAvailable = Boolean(import.meta.env.VITE_VECTOR_TILE_URL);

  return (
    <div>
      <ToggleRow checked={showRaster} onCheckedChange={setShowRaster} label={t("Base map")} />
      <ToggleRow
        checked={showVector}
        onCheckedChange={setShowVector}
        label={t("Vector details")}
        disabled={!vectorAvailable}
        descriptionId={!vectorAvailable ? descriptionId : undefined}
      />
      {!vectorAvailable ? (
        <p id={descriptionId} className="mt-1 text-xs leading-6 text-muted-foreground">{t("Vector details are currently unavailable.")}</p>
      ) : null}
    </div>
  );
}

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
      <Card>
        <CardHeader>
          <CardTitle>{t("Map layers")}</CardTitle>
          <CardDescription>{t("Choose which layers appear on the map.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <MapLayerControls />
        </CardContent>
      </Card>
    </div>
  );
}
