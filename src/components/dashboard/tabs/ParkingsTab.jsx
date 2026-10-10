import DashboardTab from "../DashboardTab";
import { getParkings } from "@/services/dashboard/parkings.service";
export default function ParkingsTab() {
  return <DashboardTab tab="parkings" service={getParkings} />;
}
