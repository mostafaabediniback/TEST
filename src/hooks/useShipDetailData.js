import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getShipSummary, getShipCompanies } from "@/api/shipApi";
import { useShipPreview } from "@/hooks/useShipPreview";
import {
  getDetailsReturnTarget,
  getShipCoordinates,
} from "@/lib/shipNavigation";
import demo from "@/mocks/ship-detail.json";

export function useShipDetailData({ allowDemo = false } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isDemo = allowDemo && id === "demo";
  const isMock =
    isDemo || new URLSearchParams(location.search).get("mock") === "dashboard";
  const seed = isDemo
    ? demo.ship
    : String(location.state?.ship?.id) === id
      ? location.state.ship
      : { id };
  const mock = isDemo
    ? demo
    : isMock
      ? (location.state?.dashboardMock ?? {})
      : {};
  const preview = useShipPreview(seed, !isMock);
  const ship = isMock ? seed : { ...seed, ...preview.ship };
  const position = isMock ? (mock.position ?? {}) : (preview.position ?? {});
  const voyage = isMock ? (mock.voyage ?? {}) : (preview.voyage ?? {});
  const port = isMock ? (mock.port ?? {}) : (preview.port ?? {});
  const summaryQuery = useQuery({
    queryKey: ["ship", seed.id, "summary"],
    queryFn: () => getShipSummary(seed.id),
    enabled: !isMock,
    staleTime: 5 * 60 * 1000,
  });
  const companiesQuery = useQuery({
    queryKey: ["ship", seed.id, "companies"],
    queryFn: () => getShipCompanies(seed.id),
    enabled: !isMock,
    staleTime: 5 * 60 * 1000,
  });
  const summary = isMock ? (mock.summary ?? {}) : (summaryQuery.data ?? {});
  const companyData = isMock ? mock.companies : companiesQuery.data;
  const companies = Array.isArray(companyData)
    ? companyData
    : (companyData?.items ?? companyData?.companies ?? []);
  const coordinates = getShipCoordinates(position) ?? getShipCoordinates(ship);
  const imageUrl = isMock
    ? (mock.photo?.url ?? null)
    : (preview.photo?.url ??
      preview.photo?.photo_url ??
      preview.photo?.image_url);
  const returnTo = getDetailsReturnTarget(location.search, location.state);
  function handleBack() {
    if (location.state?.returnTo === returnTo && window.history.state?.idx > 0)
      navigate(-1);
    else
      navigate(returnTo, {
        replace: true,
        state: { tableState: location.state?.tableState },
      });
  }
  return {
    id,
    ship,
    position,
    voyage,
    port,
    summary,
    companies,
    coordinates,
    imageUrl,
    isDemo,
    isMock,
    isLoading:
      preview.isLoading || summaryQuery.isLoading || companiesQuery.isLoading,
    isError: preview.isError || summaryQuery.isError || companiesQuery.isError,
    preview,
    returnTo,
    handleBack,
    location,
  };
}
