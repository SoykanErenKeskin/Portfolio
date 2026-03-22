/**
 * Safety gate: self-harm / mental health + disaster–CBRN style reports.
 * Substring matching on normalized text (Turkish + ASCII lowercase). Err on the side of safety.
 */

/** Self-harm / mental health — fixed response, no main LLM */
const KEYWORD_FRAGMENTS = [
  // Turkish
  "intihar",
  "öldür",
  "öldürmek",
  "ölüm",
  "ölmek",
  "gebermek",
  "geber",
  "katletmek",
  "katlet",
  "idam",
  "asılma",
  "asılmak",
  "canıma kıy",
  "kendimi öldür",
  "kendini öldür",
  "hayatıma son",
  "intihar et",
  "kendine zarar",
  // English
  "suicide",
  "kill myself",
  "kill yourself",
  "end my life",
  "want to die",
  "wanting to die",
  "hang myself",
  "self-harm",
  "self harm",
  "cut myself",
  "hurt myself",
  "end it all",
] as const;

/**
 * Disaster / CBRN / mass-casualty style reports (no safety advice or phone numbers from this bot).
 * Phrase-based where possible to limit false positives.
 */
const DISASTER_SAFETY_FRAGMENTS = [
  // Turkish
  "mantar bulutu",
  "mantar şeklinde",
  "nükleer patlama",
  "nükleer silah",
  "atom bombası",
  "atom patlaması",
  "hidrojen bombası",
  "kirli bomba",
  "radyasyon sızıntısı",
  "kimyasal saldırı",
  "biyolojik saldırı",
  // English
  "mushroom cloud",
  "nuclear explosion",
  "nuclear blast",
  "nuclear bomb",
  "atomic bomb",
  "hydrogen bomb",
  "dirty bomb",
  "radiation leak",
  "chemical attack",
  "biological attack",
  "mass shooting",
  "active shooter",
] as const;

/** Stronger Turkish-only signals (for language detection) */
const TURKISH_CRISIS_MARKERS = [
  "intihar",
  "öldür",
  "ölüm",
  "geber",
  "katlet",
  "idam",
  "kendimi",
  "kendini",
  "canıma",
  "asılma",
  "hayatıma",
  "istemiyorum",
  "nükleer",
  "mantar",
  "atom bombası",
] as const;

/** English crisis markers for language detection */
const ENGLISH_CRISIS_MARKERS = [
  "suicide",
  "kill myself",
  "kill yourself",
  "self-harm",
  "self harm",
  "hang myself",
  "end my life",
  "want to die",
  "wanting to die",
  "hurt myself",
  "cut myself",
  "end it all",
  "nuclear",
  "mushroom cloud",
] as const;

export type CrisisLang = "tr" | "en";

function normalizeForScan(text: string): string {
  const tr = text.toLocaleLowerCase("tr-TR");
  const en = text.toLowerCase();
  return `${tr}\n${en}`;
}

function matchesFragmentList(
  normalized: string,
  fragments: readonly string[]
): boolean {
  for (const kw of fragments) {
    if (normalized.includes(kw.toLocaleLowerCase("tr-TR"))) return true;
  }
  return false;
}

/**
 * Loose heuristic when the user describes a blast + mushroom imagery without exact phrases
 * (catches classifier misses before the main model suggests emergency numbers).
 */
function looksLikeDisasterWitnessReport(normalized: string): boolean {
  const hasMantar = normalized.includes("mantar");
  const hasBulut = normalized.includes("bulut");
  const hasMushroom = normalized.includes("mushroom");
  const hasParlama =
    normalized.includes("parlama") || normalized.includes("flash");
  if (hasMantar && hasBulut) return true;
  if (hasParlama && (hasMantar || hasMushroom)) return true;
  return false;
}

/**
 * True if user text should trigger the fixed safety response (no main LLM):
 * mental health crisis, self-harm, or disaster/CBRN / mass-casualty style reports.
 */
export function containsSensitiveUserContent(text: string): boolean {
  const t = normalizeForScan(text);
  if (matchesFragmentList(t, KEYWORD_FRAGMENTS)) return true;
  if (matchesFragmentList(t, DISASTER_SAFETY_FRAGMENTS)) return true;
  if (looksLikeDisasterWitnessReport(t)) return true;
  return false;
}

/**
 * Guess user language from crisis-related input. Uses markers + Turkish letters.
 * `fallback` is usually the site locale (e.g. /tr vs /en) when ambiguous.
 */
export function detectCrisisLanguage(
  userText: string,
  fallback: CrisisLang
): CrisisLang {
  const combined = normalizeForScan(userText);
  let trScore = 0;
  let enScore = 0;

  if (/[ğüşıöçĞÜŞİÖÇ]/.test(userText)) trScore += 3;
  if (/[ıİ]/.test(userText)) trScore += 1;

  for (const w of TURKISH_CRISIS_MARKERS) {
    if (combined.includes(w.toLocaleLowerCase("tr-TR"))) trScore += 2;
  }
  for (const w of ENGLISH_CRISIS_MARKERS) {
    if (combined.includes(w.toLowerCase())) enScore += 2;
  }

  if (trScore > enScore) return "tr";
  if (enScore > trScore) return "en";
  return fallback;
}

/**
 * Fixed safe reply: general encouragement to use real-world help, but never any specific numbers or codes.
 */
export function getCrisisResponseText(lang: CrisisLang): string {
  if (lang === "tr") {
    return [
      "Bu tür konularda güvenli ve doğru yardımı verebilecek kişiler, bulunduğunuz yerdeki yetkili acil servisler, sağlık kurumları ve kriz destek kanallarıdır. Uygun görürseniz yerel resmi kurumlara veya acil yardım hatlarına başvurmanız önerilir.",
      "",
      "Bu portföy sohbeti üzerinden olay değerlendirmesi, güvenlik talimatı veya herhangi bir somut telefon numarası, kısa acil kod veya ülkeye özel hat bilgisi veremem ve vermemeliyim.",
      "",
      "Yalnızca Soykan’ın portföyü, projeleri ve kamuya açık iletişim bilgileri hakkında sorularınızda yardımcı olabilirim.",
    ].join("\n");
  }
  return [
    "For situations like this, appropriate help usually comes from local emergency services, health services, and crisis support in your area. Where it makes sense, contacting your local authorities or official emergency channels is advisable.",
    "",
    "This portfolio chat cannot assess events, give safety instructions, or provide any specific phone numbers, emergency short codes, or hotline digits.",
    "",
    "I can help only with questions about Soykan’s portfolio, projects, and public contact information.",
  ].join("\n");
}
