import type { Locale } from "@/types/locale";

export function formatRecordDate(iso: string, locale: Locale): string {
  const loc = locale === "tr" ? "tr-TR" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}
