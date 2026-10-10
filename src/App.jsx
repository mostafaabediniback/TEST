import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ShipDetailPage from "./pages/ShipDetailPage";
import { SHIP_DETAIL_LAYOUT } from "./components/ships/detail/config";
import Ships from "./pages/Ships";
import Voyage from "./pages/Voyage";
import Port from "./pages/Port";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DirectionProvider } from "./context/DirectionContext";
import { FilterProvider } from "./context/FilterContext";
import { LocaleProvider } from "./context/LocaleContext";
import { MapControllerProvider } from "./context/MapControllerContext";
import { MapInfoProvider } from "./context/MapInfoContext";

const ShipDetailOverviewPage = lazy(() => import("./pages/ShipDetailOverviewPage"));

function OverviewDetails() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading vessel details…</div>}>
      <ShipDetailOverviewPage />
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <FilterProvider>
          <MapInfoProvider>
            <DirectionProvider>
              <MapControllerProvider>
                <Routes>
                  <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Home />} />

                    <Route path="/ships" element={<Ships />} />
                    <Route
                      path="/ships/:id"
                      element={SHIP_DETAIL_LAYOUT === "overview" ? <OverviewDetails /> : <ShipDetailPage />}
                    />
                    <Route path="/ships/:id/classic" element={<ShipDetailPage />} />
                    <Route path="/ships/:id/overview" element={<OverviewDetails />} />

                    <Route path="/voyage" element={<Voyage />} />
                    <Route path="/port" element={<Port />} />

                    <Route
                      path="/dashboard/:z/:x/:y"
                      element={<Dashboard />}
                    />
                  </Route>
                </Routes>
              </MapControllerProvider>
            </DirectionProvider>
          </MapInfoProvider>
        </FilterProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
}

export default App;
