import { describe, expect, it, vi } from "vitest";
import { buildViewport, latLngToTile, readUrlPosition, replaceUrlPosition } from "@/lib/mapPosition";

describe("XYZ URL positions", () => {
  it.each([
    "", "?z=13&x=1", "?z=&x=0&y=0", "?z=13&x=Infinity&y=1",
    "?z=-1&x=0&y=0", "?z=19&x=0&y=0", "?z=2&x=4&y=0",
    "?z=2&x=-1&y=0", "?z=2&x=1&y=4", "?z=2&x=1.5&y=0",
  ])("rejects incomplete or invalid tile coordinates: %s", (search) => {
    expect(readUrlPosition(search)).toBeNull();
  });

  it("accepts zero coordinates and uses a tile's center for XYZ-only URLs", () => {
    expect(readUrlPosition("?z=0&x=0&y=0")).toEqual({ z: 0, x: 0, y: 0, lat: 0, lng: 0 });
    const position = readUrlPosition("?z=2&x=1&y=1");
    expect(position.lng).toBe(-45);
    expect(position.lat).toBeCloseTo(40.97989806962013, 12);
    expect(latLngToTile(position.lat, position.lng, position.z)).toEqual({ x: 1, y: 1 });
  });

  it("round-trips the exact center while preserving unrelated URL data and history", () => {
    const state = { idx: 3, key: "existing", usr: { view: "fleet" } };
    window.history.replaceState(state, "", "/?view=fleet&car=101#details");
    const historyLength = window.history.length;
    const position = buildViewport(35.704321987654, 51.407654321098, 13);
    const replace = vi.spyOn(window.history, "replaceState");
    try {
      replaceUrlPosition(position);
      expect(readUrlPosition(window.location.search)).toEqual(position);
      expect(window.location.hash).toBe("#details");
      expect(new URLSearchParams(window.location.search).get("car")).toBe("101");
      expect(new URLSearchParams(window.location.search).get("view")).toBe("fleet");
      expect(window.history.state).toEqual(state);
      expect(window.history.length).toBe(historyLength);
      replaceUrlPosition(position);
      expect(replace).toHaveBeenCalledTimes(1);
    } finally {
      replace.mockRestore();
    }
  });

  it("ignores precision coordinates that disagree with XYZ", () => {
    expect(readUrlPosition("?z=2&x=1&y=1&lat=-40&lng=45"))
      .toEqual(readUrlPosition("?z=2&x=1&y=1"));
  });

  it("keeps valid tile indices near the poles and in wrapped worlds", () => {
    expect(latLngToTile(90, 180, 2)).toEqual({ x: 0, y: 0 });
    expect(latLngToTile(-90, -180, 2)).toEqual({ x: 0, y: 3 });
    expect(latLngToTile(0, 540, 2)).toEqual({ x: 0, y: 2 });
    const wrapped = buildViewport(30, 411.4, 13);
    expect(readUrlPosition(`?${new URLSearchParams(wrapped)}`)).toEqual(wrapped);
    const polar = buildViewport(88, 51, 13);
    expect(readUrlPosition(`?${new URLSearchParams(polar)}`)).toEqual(polar);
  });
});
