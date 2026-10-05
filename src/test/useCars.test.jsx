import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { focusManager, onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getCars } from "@/api/carsApi";
import { useCars } from "@/hooks/useCars";

vi.mock("@/api/carsApi", () => ({ getCars: vi.fn() }));

const tile = { search: "", status: "all", z: 13, x: 5265, y: 3225 };
let client;

function Wrapper({ children }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

async function advance(ms = 1) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

beforeEach(() => {
  vi.useFakeTimers();
  getCars.mockReset().mockResolvedValue([{ id: 101 }]);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

afterEach(() => {
  client.clear();
  focusManager.setFocused(undefined);
  onlineManager.setOnline(true);
  vi.useRealTimers();
});

describe("map car tile cache", () => {
  it("reuses loaded tiles after movement, elapsed polling intervals, and remounts", async () => {
    const hook = renderHook((filters) => useCars(filters), { initialProps: tile, wrapper: Wrapper });
    await advance();
    expect(hook.result.current.data).toEqual([{ id: 101 }]);
    expect(getCars).toHaveBeenCalledWith(tile);

    hook.rerender({ ...tile, x: tile.x + 1 });
    await advance();
    expect(getCars).toHaveBeenCalledTimes(2);

    await advance(6000);
    hook.rerender({ ...tile });
    await advance();
    expect(hook.result.current.data).toEqual([{ id: 101 }]);
    expect(getCars).toHaveBeenCalledTimes(2);

    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      onlineManager.setOnline(false);
      onlineManager.setOnline(true);
    });
    await advance();
    expect(getCars).toHaveBeenCalledTimes(2);

    hook.unmount();
    await advance(10 * 60 * 1000);
    const revisited = renderHook(() => useCars(tile), { wrapper: Wrapper });
    await advance();
    expect(revisited.result.current.data).toEqual([{ id: 101 }]);
    expect(getCars).toHaveBeenCalledTimes(2);
  });

  it("caches search and status results separately within the same tile", async () => {
    getCars.mockImplementation(async ({ search, status }) => [{ id: `${search}:${status}` }]);
    const hook = renderHook((filters) => useCars(filters), { initialProps: tile, wrapper: Wrapper });
    await advance();

    hook.rerender({ ...tile, search: "102" });
    await advance();
    expect(hook.result.current.data).toEqual([{ id: "102:all" }]);

    hook.rerender({ ...tile, search: "102", status: "busy" });
    await advance();
    expect(hook.result.current.data).toEqual([{ id: "102:busy" }]);

    hook.rerender(tile);
    await advance();
    expect(hook.result.current.data).toEqual([{ id: ":all" }]);
    expect(getCars).toHaveBeenCalledTimes(3);
  });

  it("shares an in-flight request between consumers and keeps it on remount", async () => {
    let resolveRequest;
    getCars.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve; }));
    const first = renderHook(() => useCars(tile), { wrapper: Wrapper });
    const second = renderHook(() => useCars({ ...tile }), { wrapper: Wrapper });
    expect(getCars).toHaveBeenCalledTimes(1);

    first.unmount();
    second.unmount();
    const remounted = renderHook(() => useCars(tile), { wrapper: Wrapper });
    expect(getCars).toHaveBeenCalledTimes(1);
    await act(async () => { resolveRequest([{ id: 102 }]); });
    await advance();
    expect(remounted.result.current.data).toEqual([{ id: 102 }]);
    expect(getCars).toHaveBeenCalledTimes(1);
  });

  it("allows a failed tile request to be retried on a later visit", async () => {
    getCars.mockRejectedValueOnce(new Error("Request failed"));
    const hook = renderHook((filters) => useCars(filters), { initialProps: tile, wrapper: Wrapper });
    await advance();
    expect(hook.result.current.isError).toBe(true);

    hook.rerender({ ...tile, x: tile.x + 1 });
    await advance();
    hook.rerender(tile);
    await advance();
    expect(hook.result.current.isSuccess).toBe(true);
    expect(getCars).toHaveBeenCalledTimes(3);
  });

});

describe("vehicle directory car requests", () => {
  it("preserves polling without XYZ and keeps directory results separate from tile results", async () => {
    const directory = { search: "", status: "all" };
    renderHook(() => useCars(tile), { wrapper: Wrapper });
    const hook = renderHook(() => useCars(directory), { wrapper: Wrapper });
    await advance();
    expect(hook.result.current.isSuccess).toBe(true);
    expect(getCars).toHaveBeenCalledTimes(2);
    expect(getCars).toHaveBeenLastCalledWith(directory);

    await advance(3000);
    expect(getCars).toHaveBeenCalledTimes(3);
    expect(getCars).toHaveBeenLastCalledWith(directory);
  });
});
