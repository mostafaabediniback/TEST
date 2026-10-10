import fixture from "../../mocks/dashboard/reports.json";
import { createMockService } from "./mockService.js";
/** Future endpoint: GET /api/dashboard/reports. */
export const getReports = createMockService(fixture, "reports");
