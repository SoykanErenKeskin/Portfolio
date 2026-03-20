"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

export type ImageOrientation = "portrait" | "landscape" | "unknown";

type Variant = "cover" | "gallery";

type Props = {
  src: string;
  alt: string;
  variant: Variant;
  /** Hint for above-the-fold cover */
  priority?: boolean;
  fallbackLabel: string;
  /** When true, img fills parent (for aspect-ratio containers) */
  fillContainer?: boolean;
};

/**
 * Renders project screenshots/diagrams without upscaling or forced crop.
 * Orientation is detected after load; portrait assets get a narrow centered frame,
 * landscape/diagrams get a wider max width. Uses native <img> + object-contain so
 * local /public paths never hit the Next.js optimizer (404-safe) and aspect ratio is preserved.
 */
export function ProjectAssetImage({
  src,
  alt,
  variant,
  priority,
  fallbackLabel,
  fillContainer,
}: Props) {
  const [broken, setBroken] = useState(false);
  const [orientation, setOrientation] = useState<ImageOrientation>("unknown");

  const invalid = !src.trim();

  const onLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
      if (w <= 0 || h <= 0) return;
      setOrientation(h > w * 1.02 ? "portrait" : "landscape");
    },
    []
  );

  if (invalid || broken) {
    return (
      <div
        className={cn(
          "flex min-h-[140px] w-full items-center justify-center bg-surface-raised",
          variant === "cover" && "min-h-[200px]"
        )}
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  const frameClass =
    orientation === "portrait"
      ? "max-w-[min(100%,20rem)] sm:max-w-[min(100%,24rem)]"
      : orientation === "landscape"
        ? "max-w-[min(100%,min(100vw-2rem,56rem))]"
        : variant === "cover"
          ? "max-w-[min(100%,min(100vw-2rem,56rem))]"
          : "max-w-[min(100%,min(100vw-2rem,48rem))]";

  return (
    <div
      className={cn(
        "flex w-full justify-center",
        variant === "gallery" && !fillContainer && "min-h-[80px]",
        fillContainer && "h-full w-full"
      )}
    >
      <div
        className={cn(
          "flex w-full justify-center",
          !fillContainer && frameClass,
          fillContainer && "h-full w-full"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- public project assets; dimensions unknown; avoids optimizer 404 */}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={onLoad}
          onError={() => setBroken(true)}
          className={cn(
            "block object-contain",
            fillContainer
              ? "h-full max-h-full w-full max-w-full"
              : "h-auto w-auto max-h-[min(85vh,1200px)] max-w-full"
          )}
        />
      </div>
    </div>
  );
}
