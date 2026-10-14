import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import StartupIntro from "./components/layout/StartupIntro";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ShipDetails from "./pages/ShipDetails";
import Ships from "./pages/Ships";
import Voyages from "./pages/Voyages";
import Ports from "./pages/Ports";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DirectionProvider } from "./context/DirectionContext";
import { FilterProvider } from "./context/FilterContext";
import { LocaleProvider } from "./context/LocaleContext";
import { MapControllerProvider } from "./context/MapControllerContext";
import { MapInfoProvider } from "./context/MapInfoContext";
import PortDetails from "./pages/PortDetails";

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
                      <Route path="/" element={<Home />} />

                      <Route path="/ships" element={<Ships />} />
                      <Route path="/ships/:id" element={<ShipDetails />} />

                      <Route path="/voyage" element={<Voyages />} />
                      <Route path="/port" element={<Ports />} />
                        <Route path="/ports/:id" element={<PortDetails />} />


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
