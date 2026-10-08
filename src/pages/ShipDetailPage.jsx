import ShipRow from "@/components/ships/ShipRow";
import { useNavigate } from "react-router-dom";

const MOCK_DATA = {
  ship: {
    name: "Ocean Explorer",
    vessel_type: "Cargo",
    flag: "Panama",
    imo: "9876543",
    mmsi: "352001234",
    lat: 37.7749,
    lon: -122.4194,
  },
  position: {
    lat: 37.7749,
    lon: -122.4194,
    speed: 12.4,
    course: 235,
  },
  summary: {
    description:
      "A cargo vessel currently operating on a scheduled commercial voyage.",
  },
  voyage: {
    destination: "Los Angeles",
    departure: "Yokohama",
    eta: "2026-10-12",
    status: "Underway",
  },
  companies: [{ id: 1, name: "Example Shipping Co." }],
  port: {
    name: "Port of Los Angeles",
    country: "United States",
    unlocode: "USLAX",
  },
};

export default function ShipDetailPage() {
  const navigate = useNavigate();

  const { ship, position, summary, voyage, companies, port } = MOCK_DATA;

  const latitude = Number(position.lat ?? ship.lat);
  const longitude = Number(position.lon ?? ship.lon);

  return (
    <main className=" bg-slate-50 text-slate-800">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Back to map
          </button>
          <span className="text-sm text-slate-500">Ship details</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="relative flex h-64 items-center justify-center bg-slate-200 md:h-80">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#dbeafe_25%,transparent_25%),linear-gradient(225deg,#dbeafe_25%,transparent_25%),linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(315deg,#e2e8f0_25%,#f1f5f9_25%)] bg-[length:40px_40px] opacity-70" />
              <div className="relative rounded-md bg-slate-900/90 px-3 py-2 text-center text-white shadow-lg">
                <p className="font-mono text-xs">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </p>
                <p className="mt-1 text-[10px] text-white/70">
                  Current ship position
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
              <div>
                <h1 className="font-semibold text-slate-900">{ship.name}</h1>
                <p className="text-xs text-emerald-700">Sample data</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {voyage.status}
              </span>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Summary
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              {summary.description}
            </p>
          </section>

          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Voyage
            </h2>
            <ShipRow label="Destination" value={voyage.destination} />
            <ShipRow label="Departure" value={voyage.departure} />
            <ShipRow label="ETA" value={voyage.eta} />
            <ShipRow label="Status" value={voyage.status} />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="flex h-56 items-center justify-center bg-slate-200 text-sm text-slate-500">
              No ship photo available
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {ship.name}
              </h2>
              <p className="mt-1 text-sm text-emerald-700">Sample data</p>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Ship information
            </h2>
            <ShipRow label="Type" value={ship.vessel_type} />
            <ShipRow label="Flag" value={ship.flag} />
            <ShipRow label="IMO" value={ship.imo} />
            <ShipRow label="MMSI" value={ship.mmsi} />
          </section>

          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Current position
            </h2>
            <ShipRow label="Latitude" value={latitude.toFixed(5)} />
            <ShipRow label="Longitude" value={longitude.toFixed(5)} />
            <ShipRow label="Speed" value={`${position.speed} knots`} />
            <ShipRow label="Course" value={position.course} />
          </section>

          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Companies
            </h2>
            <ul className="space-y-2">
              {companies.map((company) => (
                <li key={company.id} className="text-sm text-slate-700">
                  {company.name}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Port</h2>
            <ShipRow label="Name" value={port.name} />
            <ShipRow label="Country" value={port.country} />
            <ShipRow label="UN/LOCODE" value={port.unlocode} />
          </section>
        </aside>
      </div>
    </main>
  );
}
