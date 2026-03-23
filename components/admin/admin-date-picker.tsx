"use client";

import { useState, useEffect, useRef } from "react";

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const TR_DAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYMD(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T12:00:00");
  return isNaN(d.getTime()) ? null : d;
}

export function AdminDatePicker({
  value,
  onChange,
  className = "",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const parsed = parseYMD(value);
  const [viewDate, setViewDate] = useState(() => parsed ?? new Date());

  const yearRange = Array.from({ length: 26 }, (_, i) => new Date().getFullYear() - 15 + i);

  useEffect(() => {
    const p = parseYMD(value);
    if (p) setViewDate(p);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    setYearDropdownOpen(false);
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!yearDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [yearDropdownOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const days: { day: number; isPrev: boolean; isNext: boolean }[] = [];
  for (let i = 0; i < offset; i++) {
    days.push({ day: prevMonthDays - offset + i + 1, isPrev: true, isNext: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isPrev: false, isNext: false });
  }
  const rest = 42 - days.length;
  for (let i = 1; i <= rest; i++) {
    days.push({ day: i, isPrev: false, isNext: true });
  }

  const selectDay = (day: number, isPrev: boolean, isNext: boolean) => {
    const m = isPrev ? month - 1 : isNext ? month + 1 : month;
    const y = isPrev && month === 0 ? year - 1 : isNext && month === 11 ? year + 1 : year;
    const next = new Date(y, m, day);
    onChange(toYMD(next));
    setViewDate(next);
  };

  const goPrevMonth = () => setViewDate(new Date(year, month - 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1));
  const goPrevYear = () => setViewDate(new Date(year - 1, month));
  const goNextYear = () => setViewDate(new Date(year + 1, month));
  const setYear = (y: number) => {
    setViewDate(new Date(y, month));
    setYearDropdownOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="admin-input-focus flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 font-sans text-sm text-ink"
      >
        <span className={value ? "text-ink" : "text-ink-faint"}>
          {value && parsed
            ? `${parsed.getDate()} ${TR_MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`
            : "Tarih seçin"}
        </span>
        <span className="text-ink-faint">▼</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-xl">
          <div className="border-b border-border bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={goPrevYear}
                  className="rounded p-1 text-ink-faint transition hover:bg-admin-violet/10 hover:text-admin-violet"
                  aria-label="Önceki yıl"
                  title="Önceki yıl"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="rounded p-1 text-ink-faint transition hover:bg-admin-violet/10 hover:text-admin-violet"
                  aria-label="Önceki ay"
                  title="Önceki ay"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm font-medium text-ink">{TR_MONTHS[month]}</span>
                <div ref={yearRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setYearDropdownOpen((o) => !o)}
                    className="flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-sm font-medium text-ink transition hover:bg-admin-violet/10 hover:text-admin-violet"
                  >
                    {year}
                    <span className="text-[10px] text-ink-faint">▼</span>
                  </button>
                  {yearDropdownOpen && (
                    <div className="absolute left-1/2 top-full z-10 mt-1 max-h-48 min-w-[4.5rem] -translate-x-1/2 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
                      {yearRange.map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setYear(y)}
                          className={`block w-full px-2 py-1 text-center font-mono text-[12px] transition hover:bg-admin-violet/10 ${
                            y === year ? "bg-admin-violet/10 text-admin-violet" : "text-ink"
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="rounded p-1 text-ink-faint transition hover:bg-admin-violet/10 hover:text-admin-violet"
                  aria-label="Sonraki ay"
                  title="Sonraki ay"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNextYear}
                  className="rounded p-1 text-ink-faint transition hover:bg-admin-violet/10 hover:text-admin-violet"
                  aria-label="Sonraki yıl"
                  title="Sonraki yıl"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3">
            <div className="mb-2 grid grid-cols-7 gap-0.5 text-center">
              {TR_DAYS.map((d) => (
                <span key={d} className="py-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {days.map(({ day, isPrev, isNext }, i) => {
                const dateStr = toYMD(
                  isPrev ? new Date(year, month - 1, day) : isNext ? new Date(year, month + 1, day) : new Date(year, month, day)
                );
                const isOther = isPrev || isNext;
                const isSelected = value === dateStr;
                const isToday = dateStr === toYMD(new Date());

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectDay(day, isPrev, isNext)}
                    className={`
                      flex h-8 w-8 items-center justify-center rounded-lg font-mono text-[12px] transition
                      ${isOther ? "text-ink-faint/60" : "text-ink"}
                      ${isSelected ? "bg-admin-violet/20 text-admin-violet ring-1 ring-admin-violet/50" : ""}
                      ${!isSelected && !isOther ? "hover:bg-admin-violet/10 hover:text-admin-violet" : ""}
                      ${!isSelected && isOther ? "hover:bg-admin-violet/5" : ""}
                      ${isToday && !isSelected ? "ring-1 ring-admin-violet/30" : ""}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between border-t border-border p-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="rounded-lg px-3 py-1.5 font-mono text-[11px] text-ink-faint transition hover:bg-admin-violet/10 hover:text-admin-violet"
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={() => {
                const today = toYMD(new Date());
                onChange(today);
                setViewDate(new Date());
                setOpen(false);
              }}
              className="rounded-lg px-3 py-1.5 font-mono text-[11px] text-admin-violet transition hover:bg-admin-violet/10"
            >
              Bugün
            </button>
          </div>
        </div>
      )}

      <input
        type="text"
        value={value}
        readOnly
        {...(required && { required: true })}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
    </div>
  );
}
