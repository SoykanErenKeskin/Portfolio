"use client";

import { useEffect } from "react";
import type { Locale } from "@/types/locale";

export function LocaleHtml({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale === "tr" ? "tr" : "en";
  }, [locale]);
  return null;
}
