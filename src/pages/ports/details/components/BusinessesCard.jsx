import { useState } from "react";
import { Anchor } from "lucide-react";
import PortCard from "./PortCard";
import { usePortCompanies } from "@/hooks/usePortCompanies";
import { useEffect } from "react";

export default function BusinessesCard({ radiusMeters = 12000 }) {
  const [showAll, setShowAll] = useState(false);
const portId = window.location.pathname.split("/").filter(Boolean).pop();


  const { data, isLoading, isError, refetch } = usePortCompanies({
    portId,
    radiusMeters,
  });
  useEffect(() => {
    refetch();
  }, []);

  const businesses = Array.isArray(data)
    ? data
    : (data?.items ?? data?.companies ?? data?.data?.items ?? []);

  return (
    <PortCard title="Businesses at port">
      {isLoading ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Loading businesses…
        </p>
      ) : isError ? (
        <p className="py-6 text-center text-sm text-red-600">
          Could not load businesses for this port.
        </p>
      ) : businesses.length ? (
        <>
          <ul className="divide-y divide-slate-100">
            {businesses
              .slice(0, showAll ? businesses.length : 5)
              .map((business, index) => (
                <li
                  key={business.id ?? index}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-700">
                    <Anchor size={17} />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-blue-700">
                      {business.name ?? "Unnamed business"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {business.type ?? business.service ?? "Maritime services"}
                    </p>
                  </div>
                </li>
              ))}
          </ul>

          {businesses.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="mt-3 text-xs font-semibold text-blue-700 hover:underline"
            >
              {showAll ? "SHOW LESS" : "VIEW FULL LIST"}
            </button>
          )}
        </>
      ) : (
        <p className="py-6 text-center text-sm text-slate-500">
          No business information available for this port.
        </p>
      )}
    </PortCard>
  );
}
