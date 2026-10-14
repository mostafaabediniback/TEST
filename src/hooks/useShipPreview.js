import { useQuery } from "@tanstack/react-query";
import {
  getPortById,
  getShipById,
  getShipCompanies,
  getShipPhoto,
  getShipPosition,
  getShipSummary,
  getShipVoyage,
} from "@/api/shipApi";

export function useShipPreview(ship, enabled = true) {
  const shipId = ship?.id;
  const seedPortId = ship?.port_id ?? ship?.portId;
  const hasShipId = shipId != null && shipId !== "";

  const shipQuery = useQuery({
    queryKey: ["ship", "preview", shipId],
    queryFn: () => getShipById(shipId),
    enabled: hasShipId && enabled,
  });

  const photoQuery = useQuery({
    queryKey: ["ship", shipId, "photo"],
    queryFn: () => getShipPhoto(shipId),
    enabled: hasShipId && enabled,
  });

  const positionQuery = useQuery({
    queryKey: ["ship", shipId, "position"],
    queryFn: () => getShipPosition(shipId),
    enabled: hasShipId && enabled,
  });

  const voyageQuery = useQuery({
    queryKey: ["ship", shipId, "voyage"],
    queryFn: () => getShipVoyage(shipId),
    enabled: hasShipId && enabled,
  });

  const summaryQuery = useQuery({
    queryKey: ["ship", shipId, "summary"],
    queryFn: () => getShipSummary(shipId),
    enabled: hasShipId && enabled,
  });

  const companiesQuery = useQuery({
    queryKey: ["ship", shipId, "companies"],
    queryFn: () => getShipCompanies(shipId),
    enabled: hasShipId && enabled,
  });

  const portId = seedPortId ?? shipQuery.data?.port_id ?? shipQuery.data?.portId;
  const portQuery = useQuery({
    queryKey: ["port", portId],
    queryFn: () => getPortById(portId),
    enabled: portId != null && portId !== "" && enabled,
  });

  return {
    ship: shipQuery.data,
    photo: photoQuery.data,
    position: positionQuery.data,
    voyage: voyageQuery.data,
    port: portQuery.data,
    summary: summaryQuery.data,
    companies: companiesQuery.data,

    isLoading:
      shipQuery.isLoading ||
      photoQuery.isLoading ||
      positionQuery.isLoading ||
      voyageQuery.isLoading ||
      portQuery.isLoading ||
      summaryQuery.isLoading ||
      companiesQuery.isLoading,

    isError:
      shipQuery.isError ||
      photoQuery.isError ||
      positionQuery.isError ||
      voyageQuery.isError ||
      portQuery.isError ||
      summaryQuery.isError ||
      companiesQuery.isError,

    errors: [
      shipQuery.error,
      photoQuery.error,
      positionQuery.error,
      voyageQuery.error,
      portQuery.error,
      summaryQuery.error,
      companiesQuery.error,
    ].filter(Boolean),
  };
}
