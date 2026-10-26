export function createMapLayerManager(overlay, map) {
  const groups = new Map();

  const getCursor = ({ isDragging, isHovering }) => {
    if (isDragging) return "grabbing";
    return isHovering ? "pointer" : "grab";
  };
  const onClick = (info) => {
    if (!info.object) for (const group of groups.values()) group.onEmptyClick?.();
  };
  const onHover = (info) => {
    map.getCanvas().style.cursor = info.object ? "pointer" : "";
    for (const group of groups.values()) group.onHover?.(info);
  };
  function sync() {
    overlay.setProps({
      layers: [...groups.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).flatMap((group) => group.layers),
      onClick,
      onHover,
      getCursor,
      pickingRadius: 3,
    });
  }
  return {
    setGroup(key, group) { groups.set(key, group); sync(); },
    removeGroup(key) { if (groups.delete(key)) sync(); },
    clear() {
      groups.clear();
      overlay.setProps({ layers: [], onClick: null, onHover: null, getCursor: () => "" });
      map.getCanvas().style.cursor = "";
    },
  };
}