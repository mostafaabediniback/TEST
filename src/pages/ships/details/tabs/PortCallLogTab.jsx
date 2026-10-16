import DetailCard from "@/components/detail/DetailCard";
import DetailFields from "@/components/detail/DetailFields";
import formatTime from "@/lib/formatTime";

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
            formatTime(voyage.departure_time) ?? voyage.departure,
          ],
          ["Arrival port", voyage.destination ?? voyage.arrival_port_name],
          ["Reported ETA", formatTime(voyage.arrival_time)],
          ["Current port", voyage.arrival_port_name],
        ]}
      />
    </DetailCard>
  );
}
