import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Anchor,
  ArrowLeft,
  MapPin,
  RotateCw,
  Ship,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePortDetails } from "@/hooks/usePortDetails";
import {
  ExpectedArrivalsPage,
  InPortPage,
  InTheNewsPage,
  PortCongestionPage,
  StatisticsPage,
} from "./port/tabs/PortTabPages";
import { ArrivalsDeparturesPage } from "./port/tabs/ArrivalsDeparturesPage";

const tabs = [
  "Overview",
  "In port",
  "Expected arrivals",
  "Arrivals and departures",
  "Port congestion",
  "Statistics",
  "In the news",
];

const tabPages = {
  "In port": InPortPage,
  "Expected arrivals": ExpectedArrivalsPage,
  "Arrivals and departures": ArrivalsDeparturesPage,
  "Port congestion": PortCongestionPage,
  Statistics: StatisticsPage,
  "In the news": InTheNewsPage,
};
function PortCard({ title, children, className = "" }) {
  return (
    <section className={`rounded-lg border bg-white p-4 ${className}`}>
      <h2 className="mb-3 border-b pb-2 text-sm font-semibold text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function LockedContent() {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-md bg-slate-50 px-4 py-6 text-center">
      <p className="text-sm text-slate-500">Locked content</p>
      <p className="mt-2 font-medium text-slate-700">
        Upgrade your account to unlock this
      </p>
      <Button size="sm" className="mt-3">
        <Sparkles className="me-2 size-4" />
        Upgrade
      </Button>
    </div>
  );
}

function PortMap({ port }) {
  const hasCoordinates =
    port.lat != null &&
    port.lon != null &&
    Number.isFinite(Number(port.lat)) &&
    Number.isFinite(Number(port.lon));

  if (!hasCoordinates) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md bg-slate-100 text-sm text-slate-500">
        Port location unavailable
      </div>
    );
  }

  const lat = Number(port.lat);
  const lon = Number(port.lon);
  const zoom = 12;

  // OpenStreetMap embed centered on the port coordinates.
  const delta = 0.08;
  const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="relative h-72 overflow-hidden rounded-md bg-slate-100">
      <iframe
        title={`Map showing ${port.name ?? "port"}`}
        src={mapUrl}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`}
        target="_blank"
        rel="noreferrer"
        className="absolute right-2 top-2 rounded bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow hover:bg-slate-50"
      >
        View on live map
      </a> */}
    </div>
  );
}

function BusinessesCard({ companies }) {
  const [showAll, setShowAll] = useState(false);
  const businesses = Array.isArray(companies)
    ? companies
    : (companies?.items ?? companies?.companies ?? []);

  return (
    <PortCard title="Businesses at port">
      {businesses.length ? (
        <>
          <ul className="divide-y divide-slate-100">
            {businesses
              .slice(0, showAll ? businesses.length : 5)
              .map((business, index) => (
                <li
                  key={business.id ?? index}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-700">
                    <Anchor size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-blue-700">
                      {business.name ?? "Unnamed business"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {business.type ?? business.service ?? "Maritime services"}
                    </p>
                  </div>
                </li>
              ))}
          </ul>

          {businesses.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="mt-3 text-xs font-semibold text-blue-700 hover:underline"
            >
              {showAll ? "SHOW LESS" : "VIEW FULL LIST"}
            </button>
          )}
        </>
      ) : (
        <p className="py-6 text-center text-sm text-slate-500">
          No business information available for this port.
        </p>
      )}
    </PortCard>
  );
}

function PortOverview({ port }) {
  const alternativeNames = port.alternativeNames ?? [];
  const companies =
    port.businesses ?? port.companies ?? port.relations?.businesses ?? [];

  const country = port.country?.name ?? "Unknown country";
  const code = port.country?.code;
  const unlocode = port.unlocode ?? "—";

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <PortCard title="Live map preview">
          <PortMap port={port} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Port coordinates: {port.lat ?? "—"}, {port.lon ?? "—"}
            </p>
            {/* <Button size="sm" variant="outline">
              Free receiver application
            </Button> */}
          </div>
        </PortCard>

        <PortCard title="Wind forecast">
          <LockedContent />
        </PortCard>
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

        <div className="grid gap-5 lg:grid-cols-2">
          <PortCard title="Port activity">
            <div className="flex min-h-36 flex-col items-center justify-center rounded-md bg-slate-50 px-4 text-center">
              <p className="text-sm text-slate-600">Ops!</p>
              <p className="mt-1 text-sm text-slate-500">
                This content failed to load.
              </p>
              <Button size="sm" className="mt-3">
                <RotateCw className="me-2 size-4" />
                Reload section
              </Button>
            </div>
          </PortCard>

          <PortCard title="Terminals in port">
            <LockedContent />
          </PortCard>
        </div>

        <BusinessesCard companies={companies} />

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

export default function PortDetails() {
  const { id } = useParams();
  const { data, isPending, isError, error } = usePortDetails(id);
  const port = data?.body;
  const [activeTab, setActiveTab] = useState("Overview");

  if (isPending) {
    return (
      <main className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-[1600px] animate-pulse space-y-5">
          <div className="h-16 rounded-lg bg-white" />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-96 rounded-lg bg-white" />
            <div className="h-96 rounded-lg bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !port) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 p-6">
        <Button asChild variant="outline">
          <Link to="/port">
            <ArrowLeft className="me-2 size-4" />
            Back to ports
          </Link>
        </Button>
        <Card className="p-6">
          <p className="text-sm text-destructive">
            {error?.message ?? "Could not load port details."}
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto max-w-[1600px] px-4">
          <div className="flex min-h-16 flex-wrap items-center gap-3 py-3">
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Back to port"
            >
              <Link to="/port">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Anchor size={19} />
            </span>

            <h1 className="text-lg font-semibold text-slate-900">
              {port.name ?? "Unnamed port"}
            </h1>

            {port.type && <Badge variant="outline">Type {port.type}</Badge>}

            <span className="flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={14} />
              {port.country?.name ?? "Unknown country"}
              {port.country?.code ? ` [${port.country.code}]` : ""}
            </span>

            <span className="text-sm text-slate-500">
              UN/LOCODE:{" "}
              <strong className="text-slate-700">{port.unlocode ?? "—"}</strong>
            </span>
          </div>

          <nav
            aria-label="Port details sections"
            className="flex gap-6 overflow-x-auto"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-current={activeTab === tab ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm ${
                  activeTab === tab
                    ? "border-blue-700 font-medium text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-[1600px] p-4 md:p-6">
          {activeTab === "Overview" ? (
            <PortOverview port={port} />
          ) : (
            (() => {
              const ActiveTabPage = tabPages[activeTab];
              return ActiveTabPage ? (
                <ActiveTabPage port={port} portId={id} />
              ) : null;
            })()
          )}
        </div>
      </div>
    </main>
  );
}
