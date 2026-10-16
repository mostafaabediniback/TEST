import { Anchor, ArrowLeft, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PortDetailHeader({
  port,
  tabs,
  activeTab,
  onTabChange,
}) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <div className="mx-auto max-w-[1600px] px-4">
        <div className="flex min-h-16 flex-wrap items-center gap-3 py-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to port">
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
