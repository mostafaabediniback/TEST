"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleMarker, Popup } from "react-leaflet";

import ShipDetails from "./ShipDetails";
import { useShipPreview } from "@/hooks/useShipPreview";

const defaultMarkerStyle = {
  color: "#ffffff",
  weight: 2,
  fillColor: "#2563eb",
  fillOpacity: 0.95,
};

const hoverMarkerStyle = {
  radius: 10,
  color: "#dbeafe",
  weight: 3,
  fillColor: "#1d4ed8",
  fillOpacity: 1,
};

function ShipMarker({ ship }) {
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState(false);

  const shipId = ship.id;
  const portId = ship.port_id ?? ship.portId;

  const preview = useShipPreview(ship, isSelected);

  function handleMarkerClick(event) {
    const marker = event.target;

    setIsSelected(true);

    // Prevent the hover tooltip from remaining visible.
    marker.closeTooltip();

    // Explicitly open the click popup next to this marker.
    marker.openPopup();
  }

  function handleMouseOver(event) {
    const marker = event.target;

    marker.setStyle(hoverMarkerStyle);
    marker.openTooltip();
  }

  function handleMouseOut(event) {
    const marker = event.target;

    marker.setStyle({
      radius: 7,
      ...defaultMarkerStyle,
    });

    // The popup remains open after clicking, but the hover tooltip closes.
    if (!isSelected) {
      marker.closeTooltip();
    }
  }

  function handleDetailsClick() {
    navigate(`/ships/${shipId}`, {
      state: {
        ship,
        portId,
      },
    });
  }

  const displayedShip = preview.ship ?? ship;

  return (
    <CircleMarker
      center={[Number(ship.lat), Number(ship.lon)]}
      radius={7}
      pathOptions={defaultMarkerStyle}
      eventHandlers={{
        click: handleMarkerClick,
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
        popupclose: () => {
          setIsSelected(false);
        },
      }}
    >
      {/* <Tooltip
        direction="top"
        offset={[0, -10]}
        opacity={1}
        interactive={false}
      >
        <ShipDetails
          ship={displayedShip}
          photo={preview.photo}
          position={preview.position}
          voyage={preview.voyage}
          isLoading={preview.isLoading}
          compact
        />
      </Tooltip> */}

      <Popup
        direction="top"
        offset={[0, -10]}
        closeButton
        autoPan
      >
        <ShipDetails
          ship={displayedShip}
          photo={preview.photo}
          position={preview.position}
          voyage={preview.voyage}
          port={preview.port}
          isLoading={preview.isLoading}
          onDetailsClick={handleDetailsClick}
        />
      </Popup>
    </CircleMarker>
  );
}

export default function ShipMarkers({ ships = [] }) {
  return ships.map((ship, index) => {
    const lat = Number(ship.lat);
    const lon = Number(ship.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return null;
    }

    const key = ship.id ?? `${lat}-${lon}-${index}`;

    return <ShipMarker key={key} ship={ship} />;
  });
}
