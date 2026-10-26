import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import arrowIcon from "../../assets/ship-overview-arrow.svg";
import navigationAidIcon from "../../assets/ship-overview-navigation-aid.svg";
import { getOverviewPickedShip } from "./shipOverviewData.js";

const ICON_MAPPING = {
  "arrow-fill": { x: 0, y: 0, width: 40, height: 40, mask: true },
  "navigation-aid": { x: 0, y: 0, width: 40, height: 40, mask: false },
};
const arrowFill = () => "arrow-fill";
const navigationAid = () => "navigation-aid";

// Binary GPU data does not have array elements. Resolve picking indices back
// to original records only on hover/click, keeping existing popup behavior.
class ShipOverviewIconLayer extends IconLayer {
  static layerName = "ShipOverviewIconLayer";
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    info.object = getOverviewPickedShip(this.props.data, info.index, this.props.ships);
    return info;
  }
}
class ShipOverviewPointLayer extends ScatterplotLayer {
  static layerName = "ShipOverviewPointLayer";
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    info.object = getOverviewPickedShip(this.props.data, info.index, this.props.ships);
    return info;
  }
}

export function createShipOverviewLayers(overview, ships, zoom, onClick) {
  const iconScale = Math.max(0.8, Math.min(1.25, 0.8 + zoom * 0.03));
  const common = {
    ships,
    pickable: true,
    autoHighlight: true,
    highlightColor: [96, 165, 250, 255],
    onClick,
  };
  const icons = {
    ...common,
    iconMapping: ICON_MAPPING,
    sizeUnits: "pixels",
    getSize: 20,
    sizeScale: iconScale,
    billboard: false,
    // The translucent centre of a navigation aid is still clickable.
    alphaCutoff: 0.01,
  };
  return [
    new ShipOverviewPointLayer({
      ...common,
      id: "ship-overview-circles",
      data: overview.circles,
      radiusUnits: "pixels",
      getRadius: 4,
      radiusScale: iconScale,
      stroked: false,
    }),
    new ShipOverviewIconLayer({
      ...icons,
      id: "ship-overview-arrows",
      iconAtlas: arrowIcon,
      data: overview.arrows,
      getIcon: arrowFill,
    }),
    new ShipOverviewIconLayer({
      ...icons,
      id: "ship-overview-navigation-aids",
      iconAtlas: navigationAidIcon,
      data: overview.navigationAids,
      getIcon: navigationAid,
      getColor: [255, 255, 255, 255],
    }),
    new ShipOverviewPointLayer({
      ...common,
      id: "ship-overview-navigation-centres",
      data: overview.navigationAids,
      radiusUnits: "pixels",
      getRadius: 1.75,
      filled: false,
      stroked: true,
      getLineColor: [239, 68, 68, 255],
      lineWidthUnits: "pixels",
      getLineWidth: 1,
    }),
  ];
}
