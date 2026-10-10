import fixture from "../../mocks/dashboard/parkings.json";
import { createMockService } from "./mockService.js";
/** Future endpoint: GET /api/dashboard/parkings. */
export const getParkings = createMockService(fixture, "parkings");
