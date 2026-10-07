import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import TemplatePage from "@/pages/TemplatePage";
import Settings from "@/pages/Settings";
import Map from "@/pages/map";
import { FilterProvider } from "@/context/FilterContext";
import { LoadingProvider } from "./context/LoadingContext";

export default function App() {
  return (
    <LoadingProvider>
      <FilterProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route index element={<TemplatePage title="Test menu 1" />} />
              <Route
                path="test-2"
                element={<TemplatePage title="Test menu 2" />}
              />
              <Route path="settings" element={<Settings />} />
              <Route path="map" element={<Map />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FilterProvider>
    </LoadingProvider>
  );
}
