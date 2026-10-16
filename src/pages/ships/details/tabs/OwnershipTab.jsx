import DetailCard from "@/components/detail/DetailCard";
import DetailFields from "@/components/detail/DetailFields";

export default function OwnershipTab({ ship }) {
  return (
    <DetailCard title="Ownership">
      <DetailFields
        rows={[
          ["Owner", ship.owner],
          ["Manager", ship.manager],
          ["Operator", ship.operator],
        ]}
      />
    </DetailCard>
  );
}
