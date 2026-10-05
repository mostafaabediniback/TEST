import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Map as LeafletMap } from "leaflet";
import { WorldMap } from "@/components/map/WorldMap";
import { CarFilterProvider } from "@/context/CarFilterContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { getCars } from "@/api/carsApi";

vi.mock("@/api/carsApi", () => ({ getCars: vi.fn() }));

const clients = [];
let maps;
let setView;
let originalGeolocation;

function setGeolocation(value) {
  Object.defineProperty(navigator, "geolocation", { configurable: true, value });
}

function renderMap(path = "/", { strict = false } = {}) {
  window.history.replaceState({ test: "preserved" }, "", path);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  const content = (
    <QueryClientProvider client={client}>
      <LocaleProvider>
        <BrowserRouter>
          <CarFilterProvider><WorldMap /></CarFilterProvider>
        </BrowserRouter>
      </LocaleProvider>
    </QueryClientProvider>
  );
  return render(strict ? <StrictMode>{content}</StrictMode> : content);
}

async function readyMap() {
  await waitFor(() => expect(maps.length).toBeGreaterThan(0));
  await waitFor(() => expect(getCars).toHaveBeenCalled());
  return maps.at(-1);
}

async function settleMovement() {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 180)); });
}

beforeEach(() => {
  localStorage.setItem("car-map-locale", "en");
  originalGeolocation = Object.getOwnPropertyDescriptor(navigator, "geolocation");
  setGeolocation(undefined);
  getCars.mockReset().mockResolvedValue([]);
  maps = [];
  const initialize = LeafletMap.prototype.initialize;
  vi.spyOn(LeafletMap.prototype, "initialize").mockImplementation(function (...args) {
    initialize.apply(this, args);
    maps.push(this);
  });
  setView = vi.spyOn(LeafletMap.prototype, "setView");
});

afterEach(() => {
  clients.splice(0).forEach((client) => client.clear());
  vi.restoreAllMocks();
  if (originalGeolocation) Object.defineProperty(navigator, "geolocation", originalGeolocation);
  else delete navigator.geolocation;
});

describe("map position lifecycle", () => {
  it("creates the map directly from URL XYZ and never requests geolocation", async () => {
    const geolocate = vi.fn();
    setGeolocation({ getCurrentPosition: geolocate });
    renderMap("/?z=2&x=1&y=1&view=fleet#map");
    const map = await readyMap();

    expect(geolocate).not.toHaveBeenCalled();
    expect(setView.mock.calls[0][0][0]).toBeCloseTo(40.97989806962013, 10);
    expect(setView.mock.calls[0][0][1]).toBe(-45);
    expect(setView.mock.calls[0][1]).toBe(2);
    expect(map.getZoom()).toBe(2);
    expect(getCars).toHaveBeenCalledExactlyOnceWith({ search: "", status: "all", z: 2, x: 1, y: 1 });
    expect(new URLSearchParams(window.location.search).get("view")).toBe("fleet");
    expect(window.location.hash).toBe("#map");
    expect(window.history.state.test).toBe("preserved");
  });

  it("resolves geolocation once under StrictMode before any map or car request exists", async () => {
    let resolveLocation;
    const geolocate = vi.fn((success) => { resolveLocation = success; });
    setGeolocation({ getCurrentPosition: geolocate });
    renderMap("/?view=fleet", { strict: true });

    expect(geolocate).toHaveBeenCalledTimes(1);
    expect(maps).toHaveLength(0);
    expect(document.querySelector(".leaflet-container")).toBeNull();
    expect(getCars).not.toHaveBeenCalled();
    await act(async () => { resolveLocation({ coords: { latitude: 0, longitude: 0 } }); });
    const map = await readyMap();

    expect(geolocate).toHaveBeenCalledTimes(1);
    expect(map.getCenter()).toMatchObject({ lat: 0, lng: 0 });
    expect(map.getZoom()).toBe(13);
    expect(setView.mock.calls.every(([center, zoom]) => center[0] === 0 && center[1] === 0 && zoom === 13)).toBe(true);
    expect(getCars).toHaveBeenCalledExactlyOnceWith({ search: "", status: "all", z: 13, x: 4096, y: 4096 });
    const params = new URLSearchParams(window.location.search);
    expect([params.get("z"), params.get("x"), params.get("y")]).toEqual(["13", "4096", "4096"]);
    expect(params.get("view")).toBe("fleet");
  });

  it.each(["unavailable", "denied"])("uses the default only when geolocation is %s and URL XYZ is invalid", async (reason) => {
    if (reason === "denied") {
      setGeolocation({ getCurrentPosition: vi.fn((_success, error) => error({ code: 1 })) });
    }
    renderMap("/?z=13&x=&y=3");
    const map = await readyMap();

    expect(setView.mock.calls[0][0]).toEqual([35.7008, 51.4001]);
    expect(map.getCenter()).toMatchObject({ lat: 35.7008, lng: 51.4001 });
    expect(getCars).toHaveBeenCalledTimes(1);
    const request = getCars.mock.calls[0][0];
    expect(request.z).toBe(13);
    expect(request.x).toBeGreaterThan(0);
    expect(request.y).toBeGreaterThan(0);
    const params = new URLSearchParams(window.location.search);
    expect(Number(params.get("x"))).toBe(request.x);
    expect(Number(params.get("y"))).toBe(request.y);
  });

  it("writes completed movement with replaceState and restores its exact center on refresh", async () => {
    const geolocate = vi.fn();
    setGeolocation({ getCurrentPosition: geolocate });
    const app = renderMap("/?z=2&x=1&y=1&view=fleet#map");
    const map = await readyMap();
    const replace = vi.spyOn(window.history, "replaceState");
    const push = vi.spyOn(window.history, "pushState");
    const historyLength = window.history.length;
    const state = window.history.state;
    const originalSearch = window.location.search;

    act(() => { map.fire("movestart").fire("move").fire("zoomend"); });
    await settleMovement();
    expect(window.location.search).toBe(originalSearch);
    expect(replace).not.toHaveBeenCalled();
    expect(getCars).toHaveBeenCalledTimes(1);

    const center = [41.123456789, -44.987654321];
    act(() => { map.setView(center, 2, { animate: false }); });
    const savedLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const params = new URLSearchParams(window.location.search);
    expect(Number(params.get("lat"))).toBe(center[0]);
    expect(Number(params.get("lng"))).toBe(center[1]);
    expect(params.get("view")).toBe("fleet");
    expect(window.location.hash).toBe("#map");
    expect(replace).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
    expect(window.history.length).toBe(historyLength);
    expect(window.history.state).toEqual(state);
    await settleMovement();
    expect(getCars).toHaveBeenCalledTimes(1);

    app.unmount();
    setView.mockClear();
    renderMap(savedLocation);
    await waitFor(() => expect(setView).toHaveBeenCalled());
    expect(setView.mock.calls[0][0]).toEqual(center);
    expect(setView.mock.calls[0][1]).toBe(2);
    expect(geolocate).not.toHaveBeenCalled();
  });

  it("cancels a pending movement fetch when another gesture starts and reuses a revisited tile", async () => {
    renderMap("/?z=2&x=1&y=1");
    const map = await readyMap();
    act(() => {
      map.setView([20, 10], 2, { animate: false });
      map.fire("movestart");
    });
    await settleMovement();
    expect(getCars).toHaveBeenCalledTimes(1);

    act(() => { map.fire("moveend"); });
    await settleMovement();
    await waitFor(() => expect(getCars).toHaveBeenCalledTimes(2));
    expect(getCars.mock.calls[1][0]).toMatchObject({ z: 2, x: 2, y: 1 });

    act(() => { map.setView([40.9, -45], 2, { animate: false }); });
    await settleMovement();
    expect(getCars).toHaveBeenCalledTimes(2);
    expect(new URLSearchParams(window.location.search).get("x")).toBe("1");
  });

  it("opens the saved car drawer without allowing the selected car to override URL position", async () => {
    const car = { id: 101, lat: 35.7001, lng: 51.3922, driverName: "Driver", plate: "ABC123", status: "available" };
    getCars.mockResolvedValue([car]);
    const geolocate = vi.fn();
    setGeolocation({ getCurrentPosition: geolocate });
    renderMap("/?z=2&x=1&y=1&lat=42&lng=-50&car=101");
    const map = await readyMap();
    await screen.findByRole("dialog", { name: "Car details" });

    expect(map.getCenter()).toMatchObject({ lat: 42, lng: -50 });
    expect(map.getZoom()).toBe(2);
    expect(setView.mock.calls.every(([center, zoom]) => center[0] === 42 && center[1] === -50 && zoom === 2)).toBe(true);
    expect(geolocate).not.toHaveBeenCalled();
    expect(new URLSearchParams(window.location.search).get("car")).toBe("101");
  });

  it("preserves the latest moved position and hash when selecting or closing a car", async () => {
    const car = { id: 101, lat: 35.7001, lng: 51.3922, driverName: "Driver", plate: "ABC123", status: "available" };
    getCars.mockResolvedValue([car]);
    const user = userEvent.setup();
    renderMap("/?z=2&x=1&y=1&view=fleet#map");
    const map = await readyMap();
    const marker = await screen.findByRole("button", { name: "Car 101: Driver" });
    act(() => { map.setView([20, 10], 2, { animate: false }); });
    const replace = vi.spyOn(window.history, "replaceState");

    // Avoid Leaflet's focus auto-pan against jsdom's zero-sized map layout.
    fireEvent.click(marker);
    await screen.findByRole("dialog", { name: "Car details" });
    // Selecting the car then intentionally focuses it. The router update that
    // precedes that movement must start with the latest URL, not stale search.
    const selectionUrl = new URL(String(replace.mock.calls[0][2]), window.location.href);
    expect(selectionUrl.searchParams.get("car")).toBe("101");
    expect(selectionUrl.searchParams.get("lat")).toBe("20");
    expect(selectionUrl.searchParams.get("lng")).toBe("10");
    expect(selectionUrl.searchParams.get("x")).toBe("2");
    expect(selectionUrl.searchParams.get("view")).toBe("fleet");
    expect(selectionUrl.hash).toBe("#map");

    act(() => { map.setView([25, 15], 2, { animate: false }); });
    replace.mockClear();
    await user.click(screen.getByRole("button", { name: "Close car details" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Car details" })).toBeNull());
    // Focus restoration may subsequently auto-pan to the marker in Leaflet.
    const closeUrl = new URL(String(replace.mock.calls[0][2]), window.location.href);
    expect(closeUrl.searchParams.has("car")).toBe(false);
    expect(closeUrl.searchParams.get("lat")).toBe("25");
    expect(closeUrl.searchParams.get("lng")).toBe("15");
    expect(["z", "x", "y"].map((key) => closeUrl.searchParams.get(key))).toEqual(["2", "2", "1"]);
    const params = new URLSearchParams(window.location.search);
    expect(params.has("car")).toBe(false);
    expect(Number(params.get("lat"))).toBe(map.getCenter().lat);
    expect(Number(params.get("lng"))).toBe(map.getCenter().lng);
    expect(params.get("view")).toBe("fleet");
    expect(window.location.hash).toBe("#map");
  });
});
