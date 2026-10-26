import { IconLayer } from "@deck.gl/layers";
import anchorIcon from "../../assets/port-anchor.svg";
import { getOverviewPickedPort } from "./portOverviewData.js";

const ICON_MAPPING = { port: { x: 0, y: 0, width: 64, height: 64, mask: false } };
const getIcon = () => "port";

class PortOverviewIconLayer extends IconLayer {
  static layerName = "PortOverviewIconLayer";
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    info.object = getOverviewPickedPort(this.props.data, info.index, this.props.ports);
    return info;
  }
}

export function createPortOverviewLayer(data, ports, size, onClick) {
  return new PortOverviewIconLayer({
    id: "port-markers",
    data,
    ports,
    iconAtlas: anchorIcon,
    iconMapping: ICON_MAPPING,
    getIcon,
    getSize: size,
    getColor: [255, 255, 255, 255],
    sizeUnits: "pixels",
    billboard: true,
    pickable: true,
    onClick,
  });
}
