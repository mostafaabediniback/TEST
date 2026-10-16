import DetailCard from "@/components/detail/DetailCard";
import DetailFields from "@/components/detail/DetailFields";
import formatTime from "@/lib/formatTime";

export default function PerformanceInsightsTab({ position, voyage }) {
  return (
    <DetailCard title="Performance insights">
      <DetailFields
        rows={[
          ["Speed", position.speed == null ? null : `${position.speed} knots`],
          ["Course", position.course == null ? null : `${position.course}°`],
          [
            "Navigational status",
            position.navigational_status ?? voyage.status,
          ],
          ["Reported ETA", formatTime(voyage.create_time)],
        ]}
      />
    </DetailCard>
  );
}
