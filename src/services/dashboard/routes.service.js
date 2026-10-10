import fixture from "../../mocks/dashboard/routes.json";
import { createMockService } from "./mockService.js";
/** Future endpoint: GET /api/dashboard/routes. */
export const getRoutes = createMockService(fixture, "routes");
