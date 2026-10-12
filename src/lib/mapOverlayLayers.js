// Each data source owns one group; only this manager writes to the overlay.
export function createMapLayerManager(overlay, map) {
  const groups = new Map();
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
    });
  }
  return {
    setGroup(key, group) { groups.set(key, group); sync(); },
    removeGroup(key) { if (groups.delete(key)) sync(); },
    clear() {
      groups.clear();
      overlay.setProps({ layers: [], onClick: null, onHover: null });
      map.getCanvas().style.cursor = "";
    },
  };
}
