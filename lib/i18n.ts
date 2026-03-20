import type { Locale } from "@/types/locale";
import { isLocale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import en from "@/messages/en.json";
import tr from "@/messages/tr.json";

const dictionaries: Record<Locale, Messages> = {
  en: en as Messages,
  tr: tr as Messages,
};

export function getMessages(locale: string): Messages {
  const l = isLocale(locale) ? locale : "en";
  return dictionaries[l];
}

export { isLocale };
export type { Locale } from "@/types/locale";
