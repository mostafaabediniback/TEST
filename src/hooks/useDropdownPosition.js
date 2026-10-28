import { useLayoutEffect } from "react";

const INITIAL_MENU_STYLE = {
  position: "fixed",
  top: 0,
  left: 0,
  visibility: "hidden",
  zIndex: 9999,
};

/** Keep portalled filters out of document flow and inside the visible viewport. */
export function useDropdownPosition({
  open,
  setOpen,
  anchorRef,
  menuRef,
  searchRef,
}) {
  useLayoutEffect(() => {
    if (!open) return;

    const anchor = anchorRef.current;
    const menu = menuRef.current;
    if (!anchor || !menu) return;

    function positionMenu() {
      const viewport = window.visualViewport;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const rect = anchor.getBoundingClientRect();
      const padding = 8;
      const gap = 4;
      const width = Math.min(rect.width, viewportWidth - padding * 2);
      const left = Math.max(
        viewportLeft + padding,
        Math.min(rect.left, viewportLeft + viewportWidth - width - padding),
      );
      const below = Math.max(0, viewportTop + viewportHeight - rect.bottom - gap - padding);
      const above = Math.max(0, rect.top - viewportTop - gap - padding);
      const desiredHeight = Math.min(menu.scrollHeight, 384);
      const placeAbove = below < desiredHeight && above > below;
      const maxHeight = Math.min(384, placeAbove ? above : below);
      const height = Math.min(desiredHeight, maxHeight);

      Object.assign(menu.style, {
        width: `${width}px`,
        maxHeight: `${maxHeight}px`,
        left: `${left}px`,
        top: `${placeAbove ? rect.top - gap - height : rect.bottom + gap}px`,
        visibility: "visible",
      });
    }

    function closeOnOutsideClick(event) {
      if (!anchor.contains(event.target) && !menu.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        const trigger = anchor.matches("button") ? anchor : anchor.querySelector("button");
        trigger?.focus({ preventScroll: true });
      }
    }

    positionMenu();
    searchRef?.current?.focus({ preventScroll: true });
    const observer = new ResizeObserver(positionMenu);
    observer.observe(anchor);
    observer.observe(menu);
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    window.visualViewport?.addEventListener("resize", positionMenu);
    window.visualViewport?.addEventListener("scroll", positionMenu);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("focusin", closeOnOutsideClick);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
      window.visualViewport?.removeEventListener("resize", positionMenu);
      window.visualViewport?.removeEventListener("scroll", positionMenu);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("focusin", closeOnOutsideClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen, anchorRef, menuRef, searchRef]);

  return INITIAL_MENU_STYLE;
}
