import { useState } from "react";
import { Building2, ChevronRight } from "lucide-react";
import DetailCard from "@/components/detail/DetailCard";
import DetailEmpty from "@/components/detail/DetailEmpty";

function getCompanies(companyData) {
  if (Array.isArray(companyData)) return companyData;
  return companyData?.items ?? companyData?.companies ?? [];
}

export default function BusinessCards({ companyData }) {
  const [showAll, setShowAll] = useState(false);
  const companies = getCompanies(companyData);

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Businesses</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard title="At arrival location">
          {companies.length ? (
            <>
              <ul className="space-y-3">
                {companies
                  .slice(0, showAll ? companies.length : 5)
                  .map((company, index) => (
                    <li
                      key={company.id ?? index}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <Building2 size={18} />
                      </span>

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {company.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {company.type ??
                            company.service ??
                            "Maritime services"}
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>

              {companies.length > 5 && (
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
                  onClick={() => setShowAll((value) => !value)}
                >
                  {showAll ? "Show less" : "View full list"}
                  <ChevronRight size={15} />
                </button>
              )}
            </>
          ) : (
            <DetailEmpty>
              No businesses reported at the arrival location
            </DetailEmpty>
          )}
        </DetailCard>

        <DetailCard title="Near the vessel">
          <DetailEmpty>No nearby business data available</DetailEmpty>
        </DetailCard>
      </div>
    </section>
  );
}
