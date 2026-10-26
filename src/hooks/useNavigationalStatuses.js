import { useEffect, useState } from "react";
import { getNavigationalStatuses } from "@/api/navigationalStatus";

export function useNavigationalStatuses() {
  const [data, setData] = useState([]);
  const [isPending, setIsPending] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStatuses() {
      setIsPending(true);
      setIsError(false);
      setError(null);

      try {
        const statuses = await getNavigationalStatuses({
          signal: controller.signal,
        });
        setData(statuses);
      } catch (err) {
        if (err.name !== "AbortError") {
          setIsError(true);
          setError(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsPending(false);
        }
      }
    }

    loadStatuses();

    return () => controller.abort();
  }, []);

  return { data, isPending, isError, error };
}
