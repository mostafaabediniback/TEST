import { useVoyagePositionsTimeline } from "@/hooks/useVoyagePositionsTimeline";
import { formatTimestamp } from "@/lib/dateTime";

function formatTimelineTime(value) {
  if (value == null) return "Not available";

  return formatTimestamp(Number(value) * 1000, {
    unit: "auto",
    options: { dateStyle: "medium", timeStyle: "short" },
  });
}

function formatDuration(from, to) {
  if (from == null || to == null) return "Not available";

  const totalMinutes = Math.max(
    0,
    Math.floor((Number(to) - Number(from)) / 60)
  );

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    `${minutes}m`,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function VoyageTimelineTable({ voyage }) {
  const { data: timelineData } = useVoyagePositionsTimeline(voyage?.id);

  if (!timelineData?.length) {
    return <p className="text-sm text-slate-500">No timeline data available.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">From</th>
            <th className="px-3 py-2 font-medium">To</th>
            <th className="px-3 py-2 font-medium">Time passed</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {timelineData.map((item, index) => (
            <tr key={`${item.from_time}-${item.to_time}-${index}`}>
              <td className="px-3 py-2 font-medium text-slate-800">
                {item.status || "Unknown"}
              </td>
              <td className="px-3 py-2 text-slate-600">
                {formatTimelineTime(item.from_time)}
              </td>
              <td className="px-3 py-2 text-slate-600">
                {formatTimelineTime(item.to_time)}
              </td>
              <td className="px-3 py-2 text-slate-600">
                {formatDuration(item.from_time, item.to_time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
