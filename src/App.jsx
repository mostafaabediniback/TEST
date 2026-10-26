import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import "flag-icons/css/flag-icons.min.css";

import StartupIntro from "./components/layout/StartupIntro";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ShipDetails from "@/pages/ships/details/ShipDetails";
import Ships from "@/pages/ships/list/Ships";
import Voyages from "@/pages/voyages/Voyages";
import Ports from "@/pages/ports/list/Ports";
import PortDetails from "@/pages/ports/details/PortDetails";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DirectionProvider } from "./context/DirectionContext";
import { FilterProvider } from "./context/FilterContext";
import { LocaleProvider } from "./context/LocaleContext";
import { MapControllerProvider } from "./context/MapControllerContext";
import { MapInfoProvider } from "./context/MapInfoContext";

function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <StartupIntro>
          <FilterProvider>
            <MapInfoProvider>
              <DirectionProvider>
                <MapControllerProvider>
                  <Routes>
                    <Route element={<DashboardLayout />}>
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard/3/5/3" replace />}
                      />

                      <Route path="/home" element={<Home />} />
                      <Route path="/ships" element={<Ships />} />
                      <Route path="/ships/:id" element={<ShipDetails />} />
                      <Route path="/voyage" element={<Voyages />} />
                      <Route path="/port" element={<Ports />} />
                      <Route path="/ports/:id" element={<PortDetails />} />

                      {/* Example: /dashboard/12/2194/1428 */}
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
        </StartupIntro>
      </LocaleProvider>
    </BrowserRouter>
  );
}

export default App;
