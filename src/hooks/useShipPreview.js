// hooks/useShipPreview.js

import { useQuery } from "@tanstack/react-query";
import {
  getPortById,
  getShipById,
  getShipPhoto,
  getShipPosition,
  getShipVoyage,
} from "@/api/shipApi";

export function useShipPreview(ship, enabled = true) {
  const shipId = ship?.id;
  const portId = ship?.port_id ?? ship?.portId;

  const shipQuery = useQuery({
    queryKey: ["ship", "preview", shipId],
    queryFn: () => getShipById(shipId),
    enabled: Boolean(shipId) && enabled,
    staleTime: 5 * 60 * 1000,
  });

  const photoQuery = useQuery({
    queryKey: ["ship", shipId, "photo"],
    queryFn: () => getShipPhoto(shipId),
    enabled: Boolean(shipId) && enabled,
    staleTime: 10 * 60 * 1000,
  });

  const positionQuery = useQuery({
    queryKey: ["ship", shipId, "position"],
    queryFn: () => getShipPosition(shipId),
    enabled: Boolean(shipId) && enabled,
    staleTime: 30 * 1000,
  });

  const voyageQuery = useQuery({
    queryKey: ["ship", shipId, "voyage"],
    queryFn: () => getShipVoyage(shipId),
    enabled: Boolean(shipId) && enabled,
    staleTime: 5 * 60 * 1000,
  });

  const portQuery = useQuery({
    queryKey: ["port", portId],
    queryFn: () => getPortById(portId),
    enabled: Boolean(portId) && enabled,
    staleTime: 10 * 60 * 1000,
  });

  return {
    ship: shipQuery.data,
    photo: photoQuery.data,
    position: positionQuery.data,
    voyage: voyageQuery.data,
    port: portQuery.data,

    isLoading:
      shipQuery.isLoading ||
      photoQuery.isLoading ||
      positionQuery.isLoading ||
      voyageQuery.isLoading ||
      portQuery.isLoading,

    isError:
      shipQuery.isError ||
      photoQuery.isError ||
      positionQuery.isError ||
      voyageQuery.isError ||
      portQuery.isError,

    errors: [
      shipQuery.error,
      photoQuery.error,
      positionQuery.error,
      voyageQuery.error,
      portQuery.error,
    ].filter(Boolean),
  };
}
