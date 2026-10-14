import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useShipPreview } from "@/hooks/useShipPreview";
import {
  getDetailsReturnTarget,
  getShipCoordinates,
} from "@/lib/shipNavigation";
import { useLocale } from "@/context/LocaleContext";

import DetailHeader from "@/components/detail/DetailHeader";
import VesselOverview from "@/components/detail/VesselOverview";
import VesselSecondaryTab from "@/components/detail/VesselSecondaryTab";

const tabs = [
  "Overview",
  "Port call log",
  "Vessel characteristics",
  "Ownership",
  "Performance insights",
  "Compliance",
  "In the news",
];

function getCompanies(companyData) {
  if (Array.isArray(companyData)) return companyData;
  return companyData?.items ?? companyData?.companies ?? [];
}

export default function ShipDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { t } = useLocale();

  const seed =
    String(location.state?.ship?.id) === id ? location.state.ship : { id };

  const preview = useShipPreview(seed);
  const ship = { ...seed, ...preview.ship };
  const position = preview.position ?? {};
  const voyage = preview.voyage ?? {};
  const port = preview.port ?? {};
  const summary = preview.summary ?? {};
  const companies = getCompanies(preview.companies);

  const coordinates =
    getShipCoordinates(position) ?? getShipCoordinates(ship);

  const imageUrl =
    preview.photo?.url ??
    preview.photo?.photo_url ??
    preview.photo?.image_url;

  const [activeTab, setActiveTab] = useState("Overview");
  const [inFleet, setInFleet] = useState(false);

  const returnTo = getDetailsReturnTarget(location.search, location.state);

  function handleBack() {
    if (
      location.state?.returnTo === returnTo &&
      window.history.state?.idx > 0
    ) {
      navigate(-1);
    } else {
      navigate(returnTo, {
        replace: true,
        state: { tableState: location.state?.tableState },
      });
    }
  }

  function handleAddNote() {
    setActiveTab("Overview");

    // NotesCard contains its own editor. This event opens it.
    window.dispatchEvent(new CustomEvent("open-vessel-note"));
  }

return (
  <main className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-800">
    <DetailHeader
      name={ship.name || t("unnamedShip")}
      vesselType={ship.vessel_type || "Vessel"}
      imo={ship.imo}
      mmsi={ship.mmsi}
      activeTab={activeTab}
      tabs={tabs}
      inFleet={inFleet}
      onBack={handleBack}
      onTabChange={setActiveTab}
      onFleetToggle={() => setInFleet((value) => !value)}
      onAddNote={handleAddNote}
    />

    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {(preview.isLoading || preview.isError) && (
        <div role="status" className="mx-auto max-w-[1600px] px-4 pt-4">
          <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {preview.isLoading ? t("loadingShips") : t("partialShipData")}
          </p>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] p-4 md:p-6">
        {activeTab === "Overview" ? (
          <VesselOverview
            id={id}
            ship={ship}
            position={position}
            voyage={voyage}
            port={port}
            summary={summary}
            companies={companies}
            coordinates={coordinates}
            imageUrl={imageUrl}
          />
        ) : (
          <VesselSecondaryTab
            activeTab={activeTab}
            ship={ship}
            position={position}
            voyage={voyage}
            port={port}
          />
        )}
      </div>
    </div>
  </main>
);
}