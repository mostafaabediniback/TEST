import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMapController } from "@/context/MapControllerContext";
import { usePortDetails } from "@/hooks/usePortDetails";
import { getMapSelectionNavigation } from "@/lib/map/mapSelection";
import { getPortCoordinates } from "@/lib/map/portMarkers";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import PortDetailHeader from "./components/PortDetailHeader";
import { tabPages, tabs } from "./tabs";
import PortOverview from "./tabs/PortOverview";

export default function PortDetails() {
  const navigate = useNavigate();
  const { setSelectedShip, setSelectedPort } = useMapController();
  const { id } = useParams();
  const { data, isPending, isError, error } = usePortDetails(id);
  const port = data?.body;

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const activeUrlTab = tabs.includes(tabFromUrl) ? tabFromUrl : "Overview";
  const [activeTab, setActiveTab] = useState(activeUrlTab);

  useEffect(() => {
    setActiveTab(activeUrlTab);
  }, [activeUrlTab]);

  function handleTabChange(tab) {
    if (!tabs.includes(tab)) return;

    setActiveTab(tab);
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        if (tab === "Overview") {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }

        return next;
      },
      { replace: true },
    );
  }

  const ActiveTabPage = tabPages[activeTab];
  const coordinates = getPortCoordinates(port);
  const mapTarget = getMapSelectionNavigation(
    "port",
    port?.id ?? id,
    coordinates,
  );

  function handleShowOnMap() {
    if (!mapTarget || !port) return;

    setSelectedShip(null);
    setSelectedPort({
      ...port,
      id: port.id ?? id,
      lon: coordinates[0],
      lat: coordinates[1],
    });
    navigate(mapTarget.to);
  }

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
      <PortDetailHeader
        port={port}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-[1600px] p-4 md:p-6">
          {activeTab === "Overview" ? (
            <PortOverview
              port={port}
              onShowOnMap={handleShowOnMap}
              canShowOnMap={Boolean(mapTarget)}
            />
          ) : ActiveTabPage ? (
            <ActiveTabPage port={port} portId={id} />
          ) : null}
        </div>
      </div>
    </main>
  );
}