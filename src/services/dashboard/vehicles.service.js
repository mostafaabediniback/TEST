import fixture from "../../mocks/dashboard/vehicles.json";
import { createMockService } from "./mockService.js";
/** Future endpoint: GET /api/dashboard/vehicles. */
export const getVehicles = createMockService(fixture, "vehicles");
