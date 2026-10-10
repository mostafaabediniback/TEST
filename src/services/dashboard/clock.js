/** Relative fixtures are materialized against a configurable reference clock. */
export function getDashboardNow(referenceAt) {
  const instant = referenceAt ? new Date(referenceAt).getTime() : Date.now();
  if (!Number.isFinite(instant))
    throw new Error("Invalid dashboard reference clock");
  return instant;
}
