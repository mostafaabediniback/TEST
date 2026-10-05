import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "@/App";
import { LocaleProvider } from "@/context/LocaleContext";
import * as carsApi from "@/api/carsApi";
import { mockCars } from "@/data/mockCars";
import { setViewport } from "./setup";

const clients = [];

function renderApp(path = "/vehicles") {
  window.history.replaceState({}, "", path);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <LocaleProvider><App /></LocaleProvider>
    </QueryClientProvider>,
  );
}

async function switchToEnglish(user) {
  await user.click(screen.getByRole("button", { name: "تغییر زبان" }));
  const dialog = await screen.findByRole("dialog", { name: "زبان" });
  await user.click(within(dialog).getByRole("button", { name: "English" }));
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Language" })).toBeNull());
}

afterEach(() => {
  clients.splice(0).forEach((client) => client.clear());
});

describe("bilingual dashboard", () => {
  it("starts in Persian, mirrors the sidebar when English is chosen, and remembers the choice", async () => {
    const user = userEvent.setup();
    const app = renderApp();

    expect(document.documentElement.lang).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.querySelector('[data-slot="sidebar"]')?.getAttribute("data-side")).toBe("right");
    expect(screen.getByRole("navigation", { name: "ناوبری" })).toBeTruthy();
    expect(await screen.findByText("۸ ماشین پیدا شد")).toBeTruthy();

    await switchToEnglish(user);

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.querySelector('[data-slot="sidebar"]')?.getAttribute("data-side")).toBe("left");
    const navigation = screen.getByRole("navigation", { name: "Navigation" });
    for (const name of ["Map", "Vehicles", "Settings"]) {
      expect(within(navigation).getByRole("link", { name })).toBeTruthy();
    }
    expect(screen.getByRole("heading", { name: "Vehicle directory" })).toBeTruthy();
    expect(screen.getByRole("searchbox", { name: "Search vehicles" }).placeholder).toBe("Search driver, plate, or vehicle ID...");
    expect(screen.getByText("8 cars found")).toBeTruthy();
    expect(localStorage.getItem("car-map-locale")).toBe("en");

    app.unmount();
    renderApp("/settings");
    expect(document.documentElement.dir).toBe("ltr");
    expect(screen.getByRole("heading", { name: "Preferences" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "English" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("switch", { name: "Vector details" }).getAttribute("aria-disabled")).toBe("true");
  });

  it("keeps the search and status filter when changing language and clears the search accessibly", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText("۸ ماشین پیدا شد");

    await user.click(screen.getByRole("button", { name: "آزاد" }));
    const search = screen.getByRole("searchbox", { name: "جستجوی خودروها" });
    await user.type(search, "۱۰۱");
    expect(await screen.findByText("۱ ماشین پیدا شد", {}, { timeout: 2500 })).toBeTruthy();
    expect(screen.getByText("علی رضایی")).toBeTruthy();

    await switchToEnglish(user);
    expect(screen.getByRole("searchbox", { name: "Search vehicles" }).value).toBe("۱۰۱");
    expect(screen.getByRole("button", { name: "Available" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("1 car found")).toBeTruthy();
    expect(screen.queryByText("رضا احمدی")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByRole("searchbox", { name: "Search vehicles" }).value).toBe("");
    expect(document.activeElement).toBe(screen.getByRole("searchbox", { name: "Search vehicles" }));
    expect(await screen.findByText("4 cars found", {}, { timeout: 2500 })).toBeTruthy();
  });

  it("collapses the desktop sidebar and restores it with Ctrl+B", async () => {
    const user = userEvent.setup();
    renderApp("/settings");
    const trigger = screen.getByRole("button", { name: "باز و بسته کردن سایدبار" });
    const sidebar = document.querySelector('[data-slot="sidebar"]');
    expect(sidebar.getAttribute("data-state")).toBe("expanded");

    await user.click(trigger);
    expect(sidebar.getAttribute("data-state")).toBe("collapsed");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await user.keyboard("{Control>}b{/Control}");
    expect(sidebar.getAttribute("data-state")).toBe("expanded");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it.each([
    { locale: "fa", side: "right", direction: "rtl", toggle: "باز و بسته کردن سایدبار", navigation: "ناوبری" },
    { locale: "en", side: "left", direction: "ltr", toggle: "Toggle sidebar", navigation: "Navigation" },
  ])("opens the $locale mobile drawer on the $side, then closes it with Escape and restores focus", async ({ locale, side, direction, toggle, navigation }) => {
    setViewport(390);
    localStorage.setItem("car-map-locale", locale);
    const user = userEvent.setup();
    renderApp("/settings");
    const trigger = screen.getByRole("button", { name: toggle });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("navigation", { name: navigation })).toBeNull();

    await user.click(trigger);
    const drawer = await screen.findByRole("dialog", { name: navigation });
    expect(drawer.getAttribute("data-side")).toBe(side);
    expect(drawer.getAttribute("dir")).toBe(direction);
    expect(within(drawer).getByRole("navigation", { name: navigation })).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: navigation })).toBeNull());
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it.each([
    { locale: "fa", direction: "rtl", title: "اطلاعات خودرو", close: "بستن اطلاعات خودرو", marker: "ماشین ۱۰۱: علی رضایی", nextMarker: "ماشین ۱۰۲: رضا احمدی", fields: ["راننده", "پلاک", "شناسه", "وضعیت", "عرض جغرافیایی", "طول جغرافیایی"], status: "آزاد", nextStatus: "مشغول" },
    { locale: "en", direction: "ltr", title: "Car details", close: "Close car details", marker: "Car 101: علی رضایی", nextMarker: "Car 102: رضا احمدی", fields: ["Driver", "Plate", "ID", "Status", "Latitude", "Longitude"], status: "Available", nextStatus: "Busy" },
  ])("opens the $locale bottom drawer from a marker and restores focus after dismissal", async ({ locale, direction, title, close, marker, nextMarker, fields, status, nextStatus }) => {
    localStorage.setItem("car-map-locale", locale);
    const user = userEvent.setup();
    renderApp("/?view=fleet");
    const firstMarker = await screen.findByRole("button", { name: marker });
    expect(screen.queryByRole("dialog", { name: title })).toBeNull();
    expect(firstMarker.getAttribute("aria-haspopup")).toBe("dialog");
    expect(firstMarker.getAttribute("aria-expanded")).toBe("false");

    await user.click(firstMarker);
    let drawer = await screen.findByRole("dialog", { name: title });
    expect(drawer.getAttribute("dir")).toBe(direction);
    expect(drawer.getAttribute("data-swipe-direction")).toBe("down");
    expect(firstMarker.getAttribute("aria-expanded")).toBe("true");
    expect(firstMarker.getAttribute("aria-controls")).toBe(drawer.id);
    for (const field of fields) expect(within(drawer).getByText(field)).toBeTruthy();
    expect(drawer.textContent).toContain("علی رضایی");
    expect(drawer.textContent).toContain("12 الف 345");
    const number = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", { maximumFractionDigits: 4 });
    expect(drawer.textContent).toContain(number.format(35.7001));
    expect(drawer.textContent).toContain(number.format(51.3922));
    expect(within(drawer).getByText(status)).toBeTruthy();
    expect(new URLSearchParams(window.location.search).get("car")).toBe("101");

    await user.click(within(drawer).getByRole("button", { name: close }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: title })).toBeNull());
    expect(new URLSearchParams(window.location.search).has("car")).toBe(false);
    expect(new URLSearchParams(window.location.search).get("view")).toBe("fleet");
    await waitFor(() => expect(document.activeElement).toBe(firstMarker));
    expect(firstMarker.getAttribute("aria-expanded")).toBe("false");

    // Exercise a real data refresh, as the polling query does, after dismissal.
    await act(async () => { await clients.at(-1).refetchQueries({ queryKey: ["cars"] }); });
    expect(screen.queryByRole("dialog", { name: title })).toBeNull();
    expect(new URLSearchParams(window.location.search).has("car")).toBe(false);

    const secondMarker = screen.getByRole("button", { name: nextMarker });
    await user.click(secondMarker);
    drawer = await screen.findByRole("dialog", { name: title });
    expect(drawer.textContent).toContain("رضا احمدی");
    expect(drawer.textContent).not.toContain("علی رضایی");
    expect(within(drawer).getByText(nextStatus)).toBeTruthy();
    expect(new URLSearchParams(window.location.search).get("car")).toBe("102");
    expect(secondMarker.getAttribute("aria-expanded")).toBe("true");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: title })).toBeNull());
    expect(new URLSearchParams(window.location.search).has("car")).toBe(false);
    await waitFor(() => expect(document.activeElement).toBe(secondMarker));
  });

  it("opens car details from a direct vehicle URL and closes without reopening on refresh", async () => {
    const user = userEvent.setup();
    renderApp("/?car=101");
    const drawer = await screen.findByRole("dialog", { name: "اطلاعات خودرو" });
    expect(drawer.textContent).toContain("علی رضایی");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "اطلاعات خودرو" })).toBeNull());
    expect(new URLSearchParams(window.location.search).has("car")).toBe(false);
    await act(async () => { await clients.at(-1).refetchQueries({ queryKey: ["cars"] }); });
    expect(screen.queryByRole("dialog", { name: "اطلاعات خودرو" })).toBeNull();
  });

  it("loads a directly selected vehicle even when it is outside the current map tile", async () => {
    localStorage.setItem("car-map-locale", "en");
    const selectedCar = mockCars.find((car) => car.id === 102);
    const lookup = vi.spyOn(carsApi, "getCars").mockImplementation(async (params) => {
      if (Object.hasOwn(params, "z")) return [];
      return params.search === "102" && params.status === "all" ? [selectedCar] : [];
    });

    try {
      renderApp("/?car=102");
      const drawer = await screen.findByRole("dialog", { name: "Car details" });
      expect(drawer.textContent).toContain("رضا احمدی");
      expect(drawer.textContent).toContain("21 ب 123");
      expect(within(drawer).getByText("Busy")).toBeTruthy();
      expect(lookup).toHaveBeenCalledWith(expect.objectContaining({ search: "102", status: "all" }));
      expect(lookup.mock.calls.some(([params]) => params.search === "102" && !Object.hasOwn(params, "z"))).toBe(true);
    } finally {
      lookup.mockRestore();
    }
  });

  it.each(["{Enter}", " "])("opens car details from a focused marker with the %j key", async (key) => {
    localStorage.setItem("car-map-locale", "en");
    const user = userEvent.setup();
    renderApp("/");
    const marker = await screen.findByRole("button", { name: "Car 101: علی رضایی" });
    marker.focus();
    await user.keyboard(key);

    const drawer = await screen.findByRole("dialog", { name: "Car details" });
    expect(drawer.textContent).toContain("علی رضایی");
    expect(marker.getAttribute("aria-expanded")).toBe("true");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Car details" })).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(marker));
  });

  it("opens the same drawer when a vehicle directory link is followed", async () => {
    localStorage.setItem("car-map-locale", "en");
    const user = userEvent.setup();
    renderApp();
    const driver = await screen.findByText("رضا احمدی");
    const vehicleCard = driver.closest('[data-slot="card"]');

    const viewOnMap = within(vehicleCard).getByRole("button", { name: "View on map" });
    expect(viewOnMap.getAttribute("href")).toBe("/?car=102");
    await user.click(viewOnMap);
    const drawer = await screen.findByRole("dialog", { name: "Car details" });
    expect(window.location.pathname).toBe("/");
    expect(new URLSearchParams(window.location.search).get("car")).toBe("102");
    expect(drawer.textContent).toContain("رضا احمدی");
    expect(drawer.textContent).toContain("21 ب 123");
    expect(within(drawer).getByText("Busy")).toBeTruthy();
  });
});
