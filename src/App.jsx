import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ShipDetailPage from "./pages/ShipDetailPage";
import Ships from "./pages/Ships";
import Voyage from "./pages/Voyage";
import Port from "./pages/Port";

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
        <FilterProvider>
          <MapInfoProvider>
            <DirectionProvider>
              <MapControllerProvider>
                <Routes>
                  <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Home />} />

                    <Route path="/ships" element={<Ships />} />
                    <Route path="/ships/:id" element={<ShipDetailPage />} />

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
