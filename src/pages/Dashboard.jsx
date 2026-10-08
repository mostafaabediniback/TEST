import { useEffect, useState } from "react";
import WorldMap from "@/components/map/WorldMap";

export default function Dashboard() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    async function loadGeoData() {
      try {
        const response = await fetch(
          "/maps/countries.geo.json",
        );

        if (!response.ok) {
          throw new Error("Failed to load map data");
        }

        const result = await response.json();
        setGeoData(result);
      } catch (error) {
        console.error(error);
      }
    }

    loadGeoData();
  }, []);

  return <WorldMap geoData={geoData} />;
}
