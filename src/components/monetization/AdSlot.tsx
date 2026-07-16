import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  id: string;
  className?: string;
}

export function AdSlot({ id, className }: AdSlotProps) {
  if (siteConfig.ads.enabled) {
    // When ads are enabled, render the actual ad container
    // AdSense or other ad network code can be swapped in here
    return (
      <div
        id={`ad-slot-${id}`}
        className={cn("my-6 flex items-center justify-center", className)}
        aria-label="Advertisement"
      >
        {/* Ad network script will populate this container */}
      </div>
    );
  }

  // Development placeholder
  return (
    <div
      id={`ad-slot-${id}`}
      className={cn(
        "my-6 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 py-6",
        className
      )}
      aria-hidden="true"
    >
      <span className="text-xs font-medium tracking-wide text-muted-foreground/50">
        Ad Slot: {id}
      </span>
    </div>
  );
}