import type { LocalizedString } from "@/types/project";

export const KOCAELI_CASE_ID = "kocaeli-real-estate";

export const kocaeliCopy = {
  heroMetricsNote: {
    en: "R² is share of variance explained — not “65% of predictions are correct”. MAPE is mean absolute percentage error. Sale/rental counts are inventory totals; evaluation used 6,667 rows.",
    tr: "R² açıklanan varyans payıdır — “tahminlerin %65’i doğru” değildir. MAPE ortalama mutlak yüzdesel hatadır. Satış/kira sayıları envanter toplamıdır; değerlendirme 6.667 satır kullanır.",
  },
  outcomesTitle: {
    en: "Outcome summary",
    tr: "Sonuç özeti",
  },
  outcomes: [
    {
      en: "Site/project identity signals validated on the Kocaeli global model.",
      tr: "Site/proje kimliği sinyalleri Kocaeli global modelde doğrulandı.",
    },
    {
      en: "After the V24.1 merge repair, full_v24 became the new global best checkpoint.",
      tr: "V24.1 merge repair sonrasında full_v24 yeni global best checkpoint oldu.",
    },
    {
      en: "Raw listing title/site/address were converted into county-scoped, fold-safe features — not fed raw into the model.",
      tr: "Ham listing title/site/address modele verilmeden county-scoped, fold-safe feature’lara dönüştürüldü.",
    },
  ] as LocalizedString[],
  remainsHardTitle: {
    en: "What remains hard",
    tr: "Hâlâ zor olan",
  },
  remainsHard: [
    {
      en: "Underprediction on premium / top-decile listings is not fully resolved.",
      tr: "Premium/top-decile ilanlarda underprediction tamamen çözülmedi.",
    },
    {
      en: "Unobserved signals — interior quality, true view, façade, in-site unit position — still set a performance ceiling.",
      tr: "İç kalite, gerçek manzara, cephe ve site içi daire konumu gibi gözlenmeyen sinyaller performans tavanı oluşturuyor.",
    },
  ] as LocalizedString[],
  densityTitle: {
    en: "Actual vs predicted density",
    tr: "Gerçek vs tahmin yoğunluğu",
  },
  densityFigure: {
    en: "FIG — ACTUAL VS PREDICTED (UNIT PRICE)",
    tr: "ŞEK — GERÇEK VS TAHMİN (BİRİM FİYAT)",
  },
  densityAxisActual: {
    en: "Actual unit price (TL/m²)",
    tr: "Gerçek birim fiyat (TL/m²)",
  },
  densityAxisPredicted: {
    en: "Predicted unit price (TL/m²)",
    tr: "Tahmin edilen birim fiyat (TL/m²)",
  },
  densityEmptyTitle: {
    en: "Density chart unavailable",
    tr: "Yoğunluk grafiği yok",
  },
  densityEmptyBody: {
    en: "Aggregate actual-vs-predicted bins are not yet present in the public snapshot. Verified global metrics and narrative below remain available. No synthetic distribution is shown.",
    tr: "Public snapshot içinde henüz aggregate gerçek-vs-tahmin hücreleri yok. Aşağıdaki doğrulanmış global metrikler ve anlatı görüntülenmeye devam eder. Sentetik dağılım çizilmez.",
  },
  densityReadNotes: [
    {
      en: "Predictions follow the overall price structure along the unit-price diagonal.",
      tr: "Tahminler birim-fiyat diyagonalinde genel fiyat yapısını takip ediyor.",
    },
    {
      en: "Mean-pull / underprediction can still appear in the most expensive segment.",
      tr: "En pahalı segmentte mean-pull/underprediction hâlâ görülebilir.",
    },
  ] as LocalizedString[],
  densityLegend: {
    en: "Cell intensity = count / density",
    tr: "Hücre yoğunluğu = count / density",
  },
  problemTitle: {
    en: "Problem — why this is hard",
    tr: "Problem — neden zor",
  },
  problemBlocks: [
    {
      en: "Counties inside the same province have different price mechanisms and listing densities.",
      tr: "Aynı il içindeki ilçelerin fiyat mekanizmaları ve veri yoğunlukları farklı.",
    },
    {
      en: "Premium, large-home-heavy areas such as Başiskele can show variance compression.",
      tr: "Başiskele gibi premium ve large-home ağırlıklı bölgelerde variance compression oluşabiliyor.",
    },
    {
      en: "Listing fields are incomplete, inconsistent, and user-entered.",
      tr: "İlan verileri eksik, tutarsız ve kullanıcı girişlerine bağlı.",
    },
    {
      en: "Site/project names have spelling variants and the same name can appear in different counties — they cannot be used raw.",
      tr: "Site/proje isimleri yazım varyasyonları ve aynı isimlerin farklı ilçelerde bulunabilmesi nedeniyle doğrudan kullanılamıyor.",
    },
    {
      en: "The model must capture spread in expensive, heterogeneous segments — not only the mean.",
      tr: "Modelin yalnızca ortalamayı öğrenmesi değil, pahalı ve heterojen segmentlerdeki spread’i de yakalaması gerekiyor.",
    },
  ] as LocalizedString[],
  systemTitle: {
    en: "System overview",
    tr: "Sistem özeti",
  },
  systemFigure: {
    en: "FIG — DATA / PRODUCT FLOW",
    tr: "ŞEK — VERİ / ÜRÜN AKIŞI",
  },
  systemSteps: [
    { en: "Sahibinden sale / rental listings", tr: "Sahibinden satış / kira ilanları" },
    {
      en: "Cleaning + geo/location + trend/demographic enrichment",
      tr: "Temizlik + geo/konum + trend/demografi zenginleştirme",
    },
    {
      en: "Site/project and duplex/large-home extraction",
      tr: "Site/proje ve dubleks/büyük konut çıkarımı",
    },
    {
      en: "Fold-safe model pipeline and validation",
      tr: "Fold-safe model pipeline ve validasyon",
    },
    { en: "Prediction service", tr: "Tahmin servisi" },
    {
      en: "User location / site selection",
      tr: "Kullanıcı konum / site seçimi",
    },
    {
      en: "Point estimate + reasonable value band",
      tr: "Nokta tahmin + makul değer bandı",
    },
  ] as LocalizedString[],
  systemUserFlow: {
    en: "User picks a map location (lat/lon). Nearby known site/project options appear. “No site”, “not in list”, and manual site name are supported. An unknown manual name is never wired into target encoding — it is collected as feedback.",
    tr: "Kullanıcı haritadan konum seçer (lat/lon). Yakındaki bilinen site/proje seçenekleri gösterilir. “Site yok”, “listede yok” ve manuel site adı desteklenir. Bilinmeyen manuel ad doğrudan target encoding’e bağlanmaz; feedback olarak toplanır.",
  },
  datasetTitle: {
    en: "Dataset evidence",
    tr: "Veri kanıtı",
  },
  datasetFigure: {
    en: "FIG — SALE / RENTAL BY COUNTY",
    tr: "ŞEK — İLÇEYE GÖRE SATIŞ / KİRA",
  },
  datasetNarrative: {
    en: "Volume is not success by itself. Uneven county coverage is why evaluation is reported county-by-county — not only as a single global score.",
    tr: "Hacmi başarı gibi abartmamak gerekir. Coverage dengesizliği, değerlendirmeyi yalnızca global skora değil ilçe bazında yapmayı gerektirir.",
  },
  innovationsTitle: {
    en: "Technical innovations",
    tr: "Ana teknik yenilikler",
  },
  siteIdentityTitle: {
    en: "Site / project identity",
    tr: "Site / proje kimliği",
  },
  siteIdentityBody: [
    {
      en: "Raw title, site_name, and address_text do not enter the model directly.",
      tr: "Raw title, site_name ve address_text doğrudan modele gitmiyor.",
    },
    {
      en: "Identity is county-scoped (e.g. basiskele::zeray_perla).",
      tr: "Identity county-scoped: örneğin basiskele::zeray_perla.",
    },
    {
      en: "Controlled categorical/flag features + fold-safe target encoding; merge audit catches bad joins.",
      tr: "Controlled categorical/flag feature’lar + fold-safe target encoding; merge audit yanlış birleşmeleri denetler.",
    },
    {
      en: "V24.1: severe merge warnings = 0; 12 non-blocking possible bad merges for manual review.",
      tr: "V24.1: severe merge warning 0; manuel incelenecek non-blocking possible bad merge 12.",
    },
  ] as LocalizedString[],
  siteIdentityFeaturesTitle: {
    en: "Example feature families",
    tr: "Örnek feature aileleri",
  },
  siteIdentityFeatures: [
    "site_project_id",
    "has_site_project_id",
    "frequency bucket",
    "match source",
    "site quality tier",
    "OOF price/residual/confidence",
    "county/district/location/duplex interactions",
  ],
  duplexTitle: {
    en: "Duplex and large-home signals",
    tr: "Dubleks ve large-home sinyalleri",
  },
  duplexBody: [
    {
      en: "Structured detail_konut_tipi is the primary source; title is fallback only.",
      tr: "Structured detail_konut_tipi ana kaynak; title yalnızca fallback.",
    },
    {
      en: "On conflict, structured detail wins. “Ara Kat” vs “Ara Kat Dubleks” is preserved.",
      tr: "Çelişkide structured detail kazanır. “Ara Kat” ile “Ara Kat Dubleks” ayrımı korunur.",
    },
    {
      en: "Roof, garden, mid-floor, and standard duplex flags/types; large-home buckets and site interactions.",
      tr: "Çatı, bahçe, ara kat ve standard duplex flag/type’ları; large-home bucket ve site etkileşimleri.",
    },
  ] as LocalizedString[],
  timelineTitle: {
    en: "Model / experiment timeline",
    tr: "Model / deney zaman çizelgesi",
  },
  timelineFigure: {
    en: "FIG — SELECTED MILESTONES",
    tr: "ŞEK — SEÇİLMİŞ DÖNÜM NOKTALARI",
  },
  resultsTitle: {
    en: "Results",
    tr: "Sonuçlar",
  },
  resultsLead: {
    en: "Selected experiment full_v24 on kocaeli_global. County metrics, variance ratio, leakage, and merge audit details sit in the panels below.",
    tr: "Seçilen deney: full_v24 · kapsam kocaeli_global. İlçe metrikleri, variance ratio, leakage ve merge audit ayrıntıları aşağıdaki panellerde.",
  },
  productBandTitle: {
    en: "Product translation — value band",
    tr: "Ürün çevirisi — değer bandı",
  },
  productBandFigure: {
    en: "FIG — ILLUSTRATIVE TOTAL PROPERTY VALUE",
    tr: "ŞEK — ÖRNEK TOPLAM KONUT DEĞERİ",
  },
  productBandIllustrative: {
    en: "Illustrative example — total property value (not unit price TL/m²)",
    tr: "Illustrative örnek — toplam konut değeri (birim fiyat TL/m² değil)",
  },
  productBandNarrative: {
    en: "The product leads with a point estimate and a reasonable band; a wider market range stays in detail/tooltip. Intervals are a more honest decision aid for users than quoting R² alone.",
    tr: "Ana üründe nokta tahmin + makul band öncelikli; daha geniş band detay/tooltip seviyesinde. R² yerine interval yaklaşımı kullanıcıya daha dürüst bir karar desteği sunar.",
  },
  productBandLabels: {
    estimate: { en: "Estimated value", tr: "Tahmini değer" },
    reasonable: { en: "Reasonable value range", tr: "Makul değer aralığı" },
    wider: { en: "Wider market range", tr: "Daha geniş piyasa aralığı" },
  },
  productProofTitle: {
    en: "Product proof",
    tr: "Ürün kanıtı",
  },
  limitationsTitle: {
    en: "Limitations",
    tr: "Sınırlamalar",
  },
  limitations: [
    {
      en: "Premium / top-decile underprediction continues.",
      tr: "Premium/top-decile underprediction sürüyor.",
    },
    {
      en: "Visual/interior quality, view, and façade signals are unobserved.",
      tr: "Görsel/iç kalite, manzara ve cephe sinyalleri gözlenmiyor.",
    },
  ] as LocalizedString[],
  rejectedTitle: {
    en: "What did not improve the model",
    tr: "Modele katkı vermeyenler",
  },
  rejectedItems: [
    {
      en: "V19 calibration: variance ratio opened slightly, but R² and MAPE worsened — rejected.",
      tr: "V19 calibration: variance ratio bir miktar açılsa da R² ve MAPE bozuldu — reddedildi.",
    },
    {
      en: "No-ridge variant degraded — rejected.",
      tr: "No-ridge varyantı kötüleşti — reddedildi.",
    },
    {
      en: "V22 Sentinel/satellite environment indices: no meaningful lift over V21 — closed as diagnostic.",
      tr: "V22 Sentinel/uydu çevre indeksleri V21 üstüne anlamlı lift üretmedi — diagnostic olarak kapatıldı.",
    },
  ] as LocalizedString[],
  footerContact: {
    en: "Contact",
    tr: "İletişim",
  },
  footerRepo: {
    en: "View repository",
    tr: "Depoyu görüntüle",
  },
  dataBadgeLive: {
    en: "Data as of",
    tr: "Veri tarihi",
  },
  dataBadgeReference: {
    en: "Reference data",
    tr: "Referans veri",
  },
  approximateLabel: {
    en: "Approximate / reference distribution",
    tr: "Yaklaşık / referans dağılım",
  },
  saleLegend: { en: "Sale", tr: "Satış" },
  rentalLegend: { en: "Rental", tr: "Kira" },
  decisionSelected: { en: "selected", tr: "seçildi" },
  decisionRejected: { en: "rejected", tr: "reddedildi" },
  decisionDiagnostic: { en: "diagnostic", tr: "diagnostic" },
  decisionCurrentBest: { en: "current best", tr: "güncel best" },
} as const;

export type TimelineDecision =
  | "selected"
  | "rejected"
  | "diagnostic"
  | "current-best";

export const kocaeliTimeline: {
  era: LocalizedString;
  summary: LocalizedString;
  decision: TimelineDecision;
}[] = [
  {
    era: {
      en: "V1–V16 / legacy thesis era",
      tr: "V1–V16 / legacy tez dönemi",
    },
    summary: {
      en: "Classical tabular models; low R² and variance compression in Başiskele.",
      tr: "Klasik tabular modeller; Başiskele’de düşük R² ve variance compression.",
    },
    decision: "rejected",
  },
  {
    era: {
      en: "V17–V18 / location era",
      tr: "V17–V18 / konum dönemi",
    },
    summary: {
      en: "Geo features lifted Başiskele; comparable-market predictor rejected.",
      tr: "Geo feature’ları Başiskele’de lift verdi; comparable-market predictor reddedildi.",
    },
    decision: "selected",
  },
  {
    era: {
      en: "V19 / calibration diagnostics",
      tr: "V19 / kalibrasyon teşhisi",
    },
    summary: {
      en: "Isotonic/linear calibration and no-ridge tried; R²/MAPE worsened — rejected.",
      tr: "Isotonic/linear calibration ve no-ridge denendi; R²/MAPE bozulduğu için reddedildi.",
    },
    decision: "rejected",
  },
  {
    era: {
      en: "V20–V21 / site-project signals",
      tr: "V20–V21 / site-proje sinyalleri",
    },
    summary: {
      en: "Site/project identity produced the first meaningful lift; extraction improved.",
      tr: "Site/proje kimliği ilk anlamlı lift’i üretti; extraction iyileştirildi.",
    },
    decision: "selected",
  },
  {
    era: {
      en: "V22 / satellite pilot",
      tr: "V22 / uydu pilotu",
    },
    summary: {
      en: "GEE + Sentinel features: no meaningful lift — closed as diagnostic.",
      tr: "GEE + Sentinel feature’ları anlamlı lift vermedi; diagnostic olarak kapatıldı.",
    },
    decision: "diagnostic",
  },
  {
    era: {
      en: "V23 / duplex interactions",
      tr: "V23 / dubleks etkileşimleri",
    },
    summary: {
      en: "Modest but consistent lift on refreshed Başiskele data — Başiskele-only best.",
      tr: "Yenilenmiş Başiskele verisinde modest fakat tutarlı lift; Başiskele-only best.",
    },
    decision: "selected",
  },
  {
    era: {
      en: "V24 → V24.1 / global repair",
      tr: "V24 → V24.1 / global onarım",
    },
    summary: {
      en: "Kocaeli global site-aware model; after merge repair, full_v24 is global best.",
      tr: "Kocaeli global site-aware model; merge repair sonrası full_v24 global best.",
    },
    decision: "current-best",
  },
];
