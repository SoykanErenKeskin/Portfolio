import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-9 w-9 p-1.5",
  md: "h-14 w-14 p-2",
  lg: "h-20 w-20 p-3",
} as const;

/** Eder house/network mark from brand PNG — plate uses soft rounded corners only. */
export function EderHouseIcon({
  className,
  title = "Eder",
  size = "md",
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-2xl border border-[rgb(var(--gp-coral)/0.35)] bg-[rgb(var(--gp-bg-deep)/0.92)] shadow-[0_0_20px_-6px_rgb(var(--gp-coral)/0.4)]",
        size === "lg" && "rounded-3xl",
        sizeClass[size],
        className
      )}
      role="img"
      aria-label={title}
    >
      <Image
        src="/brand/eder-house.png"
        alt=""
        width={80}
        height={80}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
