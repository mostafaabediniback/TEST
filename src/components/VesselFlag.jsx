import isoCountries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

isoCountries.registerLocale(en);

export function VesselFlag({ country }) {
  const name = country?.trim();
  const code = name
    ? isoCountries.getAlpha2Code(name, "en")?.toLowerCase()
    : undefined;

  return (
    <span className="inline-flex items-center gap-2">
      {code && (
        <span
          className={`fi fi-${code} h-4 w-6 rounded-sm`}
          role="img"
          aria-label={`${name} flag`}
        />
      )}
      <span>{name || "—"}</span>
    </span>
  );
}
