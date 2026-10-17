import DetailCard from "@/components/detail/DetailCard";
import DetailFields from "@/components/detail/DetailFields";
import { AIS_TIMESTAMP_FORMAT, formatTimestamp } from "@/lib/dateTime";

export default function PortCallLogTab({ voyage }) {
  return (
    <DetailCard title="Port call log">
      <p className="mb-4 text-sm text-slate-500">
        Events reported for the current voyage.
      </p>
      <DetailFields
        rows={[
          ["Departure port", voyage.origin ?? voyage.departure_port_name],
          [
            "Departure time",
            formatTimestamp(voyage.departure_time, AIS_TIMESTAMP_FORMAT) ?? voyage.departure,
          ],
          ["Arrival port", voyage.destination ?? voyage.arrival_port_name],
          ["Reported ETA", formatTimestamp(voyage.arrival_time, AIS_TIMESTAMP_FORMAT)],
          ["Current port", voyage.arrival_port_name],
        ]}
      />
    </DetailCard>
  );
}
