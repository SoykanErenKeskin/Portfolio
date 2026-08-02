import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
  /** Soft plate behind the asset — always rounded, never sharp corners */
  withPlate?: boolean;
};

/** TheQuarox cloud/node mark from brand PNG. */
export function QuaroxCloudIcon({
  className,
  title = "System node",
  withPlate = true,
}: Props) {
  const image = (
    <Image
      src="/brand/quarox-nodes.png"
      alt=""
      width={64}
      height={64}
      className={cn(
        "h-full w-full object-contain",
        withPlate ? "rounded-2xl" : "rounded-xl"
      )}
    />
  );

  if (!withPlate) {
    return (
      <span
        className={cn("inline-flex h-9 w-9 overflow-hidden rounded-xl", className)}
        role="img"
        aria-label={title}
      >
        {image}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[rgb(var(--gp-coral)/0.28)] bg-[rgb(var(--gp-bg-deep)/0.9)] p-1.5 shadow-[0_0_16px_-6px_rgb(var(--gp-coral)/0.35)]",
        className
      )}
      role="img"
      aria-label={title}
    >
      {image}
    </span>
  );
}
