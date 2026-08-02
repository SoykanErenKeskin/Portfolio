/** Display helpers for normalized profile fields (never invent values). */

export function formatProfileInstant(iso: string | null | undefined): string {
  if (!iso) return "Last update unavailable";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Last update unavailable";
  return (
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(date) + " UTC"
  );
}

export function formatR2(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Metric unavailable";
  return value.toFixed(2);
}

export function formatOptionalText(
  value: string | null | undefined,
  emptyLabel: string
): string {
  if (value == null || !String(value).trim()) return emptyLabel;
  return String(value);
}
