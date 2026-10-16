import DetailCard from "@/components/detail/DetailCard";
import DetailEmpty from "@/components/detail/DetailEmpty";

export default function InTheNewsTab() {
  return (
    <DetailCard title="In the news">
      <DetailEmpty>No news available for this vessel</DetailEmpty>
    </DetailCard>
  );
}
