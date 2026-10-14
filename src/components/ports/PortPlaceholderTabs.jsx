import { Ship } from "lucide-react";
import { Card } from "@/components/ui/card";

export function InPortTab() {
  return <TabPlaceholder title="In port" />;
}

export function ExpectedArrivalsTab() {
  return <TabPlaceholder title="Expected arrivals" />;
}

export function PortCongestionTab() {
  return <TabPlaceholder title="Port congestion" />;
}

export function StatisticsTab() {
  return <TabPlaceholder title="Statistics" />;
}

export function InTheNewsTab() {
  return <TabPlaceholder title="In the news" />;
}

function TabPlaceholder({ title }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Ship className="size-5 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        No {title.toLowerCase()} information is available yet.
      </p>
    </Card>
  );
}