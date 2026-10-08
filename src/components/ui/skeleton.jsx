// Adapted from shadcn/ui (MIT), Base Nova registry.
// https://ui.shadcn.com/r/styles/base-nova/skeleton.json
// JavaScript, Tailwind CSS 3, and bidirectional layout compatibility.
import { cn } from "@/lib/utils";
function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
export { Skeleton };
