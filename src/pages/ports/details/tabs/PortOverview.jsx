import BusinessesCard from "../components/BusinessesCard";
import PortCard from "../components/PortCard";
import PortMap from "../components/PortMap";

export default function PortOverview({
  port = {},
  onShowOnMap,
  mapTo,
  canShowOnMap = false,
}) {
  const alternativeNames = Array.isArray(port.alternativeNames)
    ? port.alternativeNames
    : [];

  const companies =
    port.businesses ?? port.companies ?? port.relations?.businesses ?? [];

  const country = port.country?.name ?? "Unknown country";
  const code = port.country?.code;
  const unlocode = port.unlocode ?? "—";

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <PortCard title="Live map preview">
          <PortMap
            port={port}
            onShowOnMap={onShowOnMap}
            mapTo={mapTo}
            canShowOnMap={canShowOnMap}
          />

          <div className="mt-3">
            <p className="text-xs text-slate-500">
              Port coordinates: {port.lat ?? "—"}, {port.lon ?? "—"}
            </p>
          </div>
        </PortCard>

        <BusinessesCard companies={companies} />
      </div>

      <div className="space-y-5">
        <PortCard title="Summary">
          <h3 className="font-medium text-slate-900">Where is the port?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            <strong>{port.name ?? "This port"}</strong> is located in{" "}
            <strong>{country}</strong>
            {code ? ` (${code})` : ""}. The official UN/LOCODE is{" "}
            <strong>{unlocode}</strong>
            {alternativeNames.length > 0
              ? `. It is also known as ${alternativeNames.join(", ")}.`
              : "."}
          </p>
        </PortCard>
        <PortCard title="Port information">
          <dl className="divide-y divide-slate-100">
            {[
              ["Port ID", port.id],
              ["UN/LOCODE", port.unlocode],
              ["Country", code ? `${country} (${code})` : country],
              ["Type", port.type],
              ["Size", port.size],
              ["Timezone", port.timezone],
              ["Latitude", port.lat],
              ["Longitude", port.lon],
              ["Alternative names", alternativeNames.join(", ")],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(120px,0.8fr)_minmax(0,1.2fr)] gap-3 py-2.5 text-sm"
              >
                <dt className="text-slate-500">{label}</dt>
                <dd className="break-words font-medium text-slate-800">
                  {value == null || value === "" ? "—" : value}
                </dd>
              </div>
            ))}
          </dl>
        </PortCard>
      </div>
    </div>
  );
}
