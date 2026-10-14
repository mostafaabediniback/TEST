import {
  ArrowLeft,
  MessageSquarePlus,
  Ship
} from "lucide-react";

export default function VesselDetailHeader({
  name,
  vesselType,
  imo,
  mmsi,
  activeTab,
  tabs,
  inFleet,
  onBack,
  onTabChange,
  onFleetToggle,
  onAddNote,
}) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <div className="mx-auto max-w-[1600px] px-4">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
            </button>

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Ship size={19} />
            </span>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-slate-900">
                {name}
              </h1>
              <p className="text-xs text-slate-500">
                {vesselType}
                {imo ? ` · IMO ${imo}` : ""}
                {mmsi ? ` · MMSI ${mmsi}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddNote}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
            >
              <MessageSquarePlus size={15} />
              <span className="hidden sm:inline">Add notes</span>
            </button>

            {/* <button
              type="button"
              aria-pressed={inFleet}
              onClick={onFleetToggle}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                inFleet
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "hover:bg-slate-50"
              }`}
            >
              <Heart size={15} fill={inFleet ? "currentColor" : "none"} />
              <span className="hidden sm:inline">
                {inFleet ? "In your fleet" : "Add to fleet"}
              </span>
            </button> */}
          </div>
        </div>

        <nav
          aria-label="Vessel details sections"
          className="flex gap-6 overflow-x-auto"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
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
  );
}