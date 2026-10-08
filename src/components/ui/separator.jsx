// Adapted from shadcn/ui (MIT), Base Nova registry.
// https://ui.shadcn.com/r/styles/base-nova/separator.json
// JavaScript, Tailwind CSS 3, and bidirectional layout compatibility.
"use client";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { cn } from "@/lib/utils";
function Separator({ className, orientation = "horizontal", ...props }) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-[horizontal]:h-px data-[horizontal]:w-full data-[vertical]:w-px data-[vertical]:self-stretch",
        className,
      )}
      {...props}
    />
  );
}
export { Separator };
