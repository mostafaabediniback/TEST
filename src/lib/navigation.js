export function isPlainLinkClick(event) {
  return !event.defaultPrevented && event.button === 0 &&
    !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
}

export function getDetailTabTarget(location, tab) {
  const search = new URLSearchParams(location.search);
  if (tab === "Overview") search.delete("tab");
  else search.set("tab", tab);
  const query = search.toString();
  return location.pathname + (query ? `?${query}` : "");
}
