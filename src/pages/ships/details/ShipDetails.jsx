import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { usePageBack, usePageScroll } from "@/hooks/usePageReturn";
import { useShipPreview } from "@/hooks/useShipPreview";
import {
  getDetailsReturnTarget,
  getShipCoordinates,
} from "@/lib/shipNavigation";
import { useLocale } from "@/context/LocaleContext";
import { useMapController } from "@/context/MapControllerContext";
import { getMapSelectionNavigation } from "@/lib/map/mapSelection";

import VesselDetailHeader from "./components/VesselDetailHeader";
import VesselOverview from "./tabs/VesselOverview";
import { tabs, tabPages } from "./tabs";

function getCompanies(companyData) {
  if (Array.isArray(companyData)) return companyData;
  return companyData?.items ?? companyData?.companies ?? [];
}

function getPhotoBlob(photo) {
  if (typeof Blob === "undefined") return null;

  if (photo instanceof Blob) return photo;
  if (photo?.data instanceof Blob) return photo.data;
  if (photo?.binary instanceof Blob) return photo.binary;

  return null;
}

export default function ShipDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { t } = useLocale();
  const { setSelectedShip, setSelectedPort } = useMapController();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const activeUrlTab = tabs.includes(tabFromUrl) ? tabFromUrl : "Overview";
  const [activeTab, setActiveTab] = useState(activeUrlTab);

  const seed =
    String(location.state?.ship?.id) === id ? location.state.ship : { id };

  const preview = useShipPreview(seed);
  const ship = { ...seed, ...preview.ship };
  const position = preview.position ?? {};
  const voyage = preview.voyage ?? {};
  const port = preview.port ?? {};
  const summary = preview.summary ?? {};
  const companies = getCompanies(preview.companies);

  const coordinates = getShipCoordinates(position) ?? getShipCoordinates(ship);

  const mapTarget = getMapSelectionNavigation(
    "ship",
    ship.id ?? id,
    coordinates,
  );

  const photo = preview.photo;
  const photoBlob = getPhotoBlob(photo);

  const directImageUrl =
    typeof photo === "string"
      ? photo
      : photo?.url ?? photo?.photo_url ?? photo?.image_url ?? null;

  const [photoObjectUrl, setPhotoObjectUrl] = useState("");

  useEffect(() => {
    setActiveTab(activeUrlTab);
  }, [activeUrlTab]);

  useEffect(() => {
    if (!photoBlob) {
      setPhotoObjectUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(photoBlob);
    setPhotoObjectUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoBlob]);

  const imageUrl = directImageUrl || photoObjectUrl;
  const ActiveTabPage = tabPages[activeTab];

  const returnTo = getDetailsReturnTarget(location.search, location.state);

  const handleBack = usePageBack(returnTo);
  const scrollRef = usePageScroll("ship-details");

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
      { replace: true, state: location.state },
    );
  }

  function handleShowOnMap() {
    if (!mapTarget) return;

    setSelectedPort(null);
    setSelectedShip({
      ...ship,
      id: ship.id ?? id,
      lon: coordinates[0],
      lat: coordinates[1],
      position,
    });
    navigate(mapTarget.to);
  }

  function handleAddNote() {
    handleTabChange("Overview");
    window.dispatchEvent(new CustomEvent("open-vessel-note"));
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-800">
      <VesselDetailHeader
        name={ship.name || t("unnamedShip")}
        vesselType={`${ship.vessel_type || "Vessel"}${
          ship.vessel_subtype ? ` / ${ship.vessel_subtype}` : ""
        }`}
        imo={ship.imo}
        mmsi={ship.mmsi}
        activeTab={activeTab}
        tabs={tabs}
        onBack={handleBack}
        onTabChange={handleTabChange}
        onAddNote={handleAddNote}
      />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
              onShowOnMap={handleShowOnMap}
              canShowOnMap={Boolean(mapTarget)}
            />
          ) : ActiveTabPage ? (
            <ActiveTabPage
              ship={ship}
              position={position}
              voyage={voyage}
              port={port}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
