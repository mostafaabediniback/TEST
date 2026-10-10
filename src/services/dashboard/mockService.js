import { buildDashboardResponse } from "./analytics.js";
import { getDashboardNow } from "./clock.js";
export function createMockService(fixture, tab) {
  return async (
    filters = {},
    { signal, referenceAt, mockState, delay = 180 } = {},
  ) => {
    await new Promise((resolve, reject) => {
      if (signal?.aborted)
        return reject(new DOMException("Aborted", "AbortError"));
      const finish = () => {
        signal?.removeEventListener("abort", abort);
        resolve();
      };
      const timer = setTimeout(finish, delay);
      const abort = () => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
        reject(new DOMException("Aborted", "AbortError"));
      };
      signal?.addEventListener("abort", abort, { once: true });
    });
    if (mockState === "error")
      throw new Error("Could not load dashboard data. Please try again.");
    const source =
      mockState === "empty"
        ? {
            ...fixture,
            data: { ...fixture.data, vehicles: [], parkings: [], trips: [] },
          }
        : fixture;
    return buildDashboardResponse(
      source,
      tab,
      filters,
      getDashboardNow(referenceAt),
    );
  };
}
