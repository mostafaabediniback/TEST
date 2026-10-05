import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom has no layout or media-query engine. Keep the app's real responsive
// hook and Base UI components, supplying only the browser APIs they consume.
export function setViewport(width) {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
  window.matchMedia = vi.fn((query) => {
    const maxWidth = /max-width:\s*(\d+)px/.exec(query);
    const minWidth = /min-width:\s*(\d+)px/.exec(query);
    return {
      media: query,
      matches: maxWidth ? width <= Number(maxWidth[1]) : minWidth ? width >= Number(minWidth[1]) : false,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  // Base UI restores scroll after a modal closes; jsdom has no scroll layout.
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubEnv("VITE_DATA_SOURCE", "mock");
  vi.stubEnv("VITE_VECTOR_TILE_URL", "");
  localStorage.clear();
  setViewport(1280);
  document.documentElement.removeAttribute("lang");
  document.documentElement.removeAttribute("dir");
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
