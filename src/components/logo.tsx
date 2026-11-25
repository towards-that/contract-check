import { cn } from "@/lib/utils";

export function Logo({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-[10px] bg-ink text-cream shadow-sm",
          size === "md" ? "size-9" : "size-7",
        )}
      >
        <span
          className={cn(
            "font-display leading-none",
            size === "md" ? "mt-0.5 text-[22px]" : "text-[17px]",
          )}
        >
          §
        </span>
      </span>
      <span
        className={cn(
          "font-semibold tracking-[-0.02em] text-ink",
          size === "md" ? "text-[19px]" : "text-base",
        )}
      >
        Fine<span className="font-display text-[1.18em] italic">Print</span>
        <span className="text-forest">.</span>
      </span>
    </span>
  );
}
