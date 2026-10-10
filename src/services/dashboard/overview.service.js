import fixture from "../../mocks/dashboard/overview.json";
import { createMockService } from "./mockService.js";
/** Future endpoint: GET /api/dashboard/overview. */
export const getOverview = createMockService(fixture, "overview");
