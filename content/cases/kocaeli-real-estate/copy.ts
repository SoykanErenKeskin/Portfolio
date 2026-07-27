import type { LocalizedString } from "@/types/project";

export const KOCAELI_CASE_ID = "kocaeli-real-estate";

export const kocaeliCopy = {
  heroMetricsNote: {
    en: "R² is the share of variance explained, not “65% of predictions are correct”. MAPE is mean absolute percentage error. Sale and rental counts are inventory totals; evaluation used 6,667 rows.",
    tr: "R² açıklanan varyans payıdır; “tahminlerin %65’i doğru” anlamına gelmez. MAPE ortalama mutlak yüzdesel hatadır. Satış ve kira sayıları envanter toplamıdır; değerlendirme 6.667 satır kullanır.",
  },
  outcomesTitle: {
    en: "Outcome summary",
    tr: "Sonuç özeti",
  },
  outcomes: [
    {
      en: "Site and project identity signals were validated on the Kocaeli global model.",
      tr: "Site ve proje kimliği sinyalleri Kocaeli global modelde doğrulandı.",
    },
    {
      en: "After the V24.1 merge repair, full_v24 became the new global best checkpoint.",
      tr: "V24.1 birleştirme onarımından sonra full_v24 yeni global en iyi kontrol noktası oldu.",
    },
    {
      en: "Raw listing title, site, and address were turned into county-scoped, fold-safe features instead of being fed raw into the model.",
      tr: "Ham ilan başlığı, site ve adres modele ham verilmedi; ilçe kapsamlı ve fold-güvenli özelliklere dönüştürüldü.",
    },
  ] as LocalizedString[],
  remainsHardTitle: {
    en: "What remains hard",
    tr: "Hâlâ zor olan",
  },
  remainsHard: [
    {
      en: "Underprediction on premium and top-decile listings is not fully resolved.",
      tr: "Premium ve üst ondalık dilimdeki ilanlarda düşük tahmin sorunu tamamen çözülmedi.",
    },
    {
      en: "Unobserved signals such as interior quality, true view, façade, and in-site unit position still set a performance ceiling.",
      tr: "İç kalite, gerçek manzara, cephe ve site içi daire konumu gibi gözlenmeyen sinyaller hâlâ performans tavanı oluşturuyor.",
    },
  ] as LocalizedString[],
  densityTitle: {
    en: "Actual vs predicted density",
    tr: "Gerçek ve tahmin yoğunluğu",
  },
  densityFigure: {
    en: "FIG. Actual vs predicted (unit price)",
    tr: "ŞEK. Gerçek ve tahmin (birim fiyat)",
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
    en: "Aggregate actual-vs-predicted bins are not yet present in the public snapshot. Verified global metrics and the narrative below remain available. No synthetic distribution is shown.",
    tr: "Herkese açık anlık görüntüde henüz toplu gerçek-tahmin hücreleri yok. Aşağıdaki doğrulanmış global metrikler ve anlatı görüntülenmeye devam eder. Sentetik dağılım çizilmez.",
  },
  densityReadNotes: [
    {
      en: "Predictions follow the overall price structure along the unit-price diagonal.",
      tr: "Tahminler birim fiyat diyagonalinde genel fiyat yapısını takip ediyor.",
    },
    {
      en: "Mean-pull and underprediction can still appear in the most expensive segment.",
      tr: "En pahalı segmentte ortalamaya çekilme ve düşük tahmin hâlâ görülebilir.",
    },
  ] as LocalizedString[],
  densityLegend: {
    en: "Cell intensity equals count or density",
    tr: "Hücre yoğunluğu adet veya yoğunluk değerini gösterir",
  },
  problemTitle: {
    en: "Problem: why this is hard",
    tr: "Problem: neden zor",
  },
  problemBlocks: [
    {
      en: "Counties inside the same province have different price mechanisms and listing densities.",
      tr: "Aynı il içindeki ilçelerin fiyat mekanizmaları ve ilan yoğunlukları farklıdır.",
    },
    {
      en: "Premium, large-home-heavy areas such as Başiskele can show variance compression.",
      tr: "Başiskele gibi premium ve büyük konut ağırlıklı bölgelerde varyans sıkışması oluşabiliyor.",
    },
    {
      en: "Listing fields are incomplete, inconsistent, and user-entered.",
      tr: "İlan alanları eksik, tutarsız ve kullanıcı girişine bağlıdır.",
    },
    {
      en: "Site and project names have spelling variants, and the same name can appear in different counties, so they cannot be used raw.",
      tr: "Site ve proje adlarında yazım farkları vardır ve aynı ad farklı ilçelerde geçebilir; bu yüzden ham kullanılamaz.",
    },
    {
      en: "The model must capture spread in expensive, heterogeneous segments, not only the mean.",
      tr: "Model yalnızca ortalamayı değil, pahalı ve heterojen segmentlerdeki yayılımı da yakalamalıdır.",
    },
  ] as LocalizedString[],
  systemTitle: {
    en: "System overview",
    tr: "Sistem özeti",
  },
  systemFigure: {
    en: "FIG. Data and product flow",
    tr: "ŞEK. Veri ve ürün akışı",
  },
  systemSteps: [
    { en: "Public sale and rental listings", tr: "Açık satış ve kira ilanları" },
    {
      en: "Cleaning, geo and location features, trend and demographic enrichment",
      tr: "Temizlik, coğrafi ve konum özellikleri, trend ve demografi zenginleştirme",
    },
    {
      en: "Site, project, duplex, and large-home extraction",
      tr: "Site, proje, dubleks ve büyük konut çıkarımı",
    },
    {
      en: "Fold-safe model pipeline and validation",
      tr: "Fold-güvenli model hattı ve doğrulama",
    },
    { en: "Prediction service", tr: "Tahmin servisi" },
    {
      en: "User location and site selection",
      tr: "Kullanıcı konum ve site seçimi",
    },
    {
      en: "Point estimate plus reasonable value band",
      tr: "Nokta tahmin artı makul değer bandı",
    },
  ] as LocalizedString[],
  systemUserFlow: {
    en: "The user picks a map location (lat/lon). Nearby known site and project options appear. “No site”, “not in list”, and a manual site name are supported. An unknown manual name is never wired into target encoding; it is collected as feedback.",
    tr: "Kullanıcı haritadan konum seçer (enlem/boylam). Yakındaki bilinen site ve proje seçenekleri gösterilir. “Site yok”, “listede yok” ve elle site adı desteklenir. Bilinmeyen elle girilen ad hedef kodlamaya bağlanmaz; geri bildirim olarak toplanır.",
  },
  datasetTitle: {
    en: "Dataset evidence",
    tr: "Veri kanıtı",
  },
  datasetFigure: {
    en: "FIG. Sale and rental by county",
    tr: "ŞEK. İlçeye göre satış ve kira",
  },
  datasetNarrative: {
    en: "Volume is not success by itself. Uneven county coverage is why evaluation is reported county by county, not only as a single global score.",
    tr: "Hacim tek başına başarı değildir. İlçe kapsamı dengesiz olduğu için değerlendirme yalnızca tek bir global skorla değil, ilçe ilçe de raporlanır.",
  },
  innovationsTitle: {
    en: "Technical innovations",
    tr: "Ana teknik yenilikler",
  },
  siteIdentityTitle: {
    en: "Site and project identity",
    tr: "Site ve proje kimliği",
  },
  siteIdentityBody: [
    {
      en: "Raw title, site_name, and address_text do not enter the model directly.",
      tr: "Ham title, site_name ve address_text doğrudan modele girmez.",
    },
    {
      en: "Identity is county-scoped (for example basiskele::zeray_perla).",
      tr: "Kimlik ilçe kapsamlıdır (örnek: basiskele::zeray_perla).",
    },
    {
      en: "Controlled categorical and flag features plus fold-safe target encoding; merge audit catches bad joins.",
      tr: "Kontrollü kategorik ve bayrak özellikler ile fold-güvenli hedef kodlama kullanılır; birleştirme denetimi hatalı birleşmeleri yakalar.",
    },
    {
      en: "V24.1: severe merge warnings = 0; 12 non-blocking possible bad merges remain for manual review.",
      tr: "V24.1: ciddi birleştirme uyarısı 0; elle incelenecek 12 engelleyici olmayan olası hatalı birleştirme kaldı.",
    },
  ] as LocalizedString[],
  siteIdentityFeaturesTitle: {
    en: "Example feature families",
    tr: "Örnek özellik aileleri",
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
    tr: "Dubleks ve büyük konut sinyalleri",
  },
  duplexBody: [
    {
      en: "Structured detail_konut_tipi is the primary source; title is fallback only.",
      tr: "Yapılandırılmış detail_konut_tipi birincil kaynaktır; title yalnızca yedektir.",
    },
    {
      en: "On conflict, structured detail wins. “Ara Kat” versus “Ara Kat Dubleks” is preserved.",
      tr: "Çelişkide yapılandırılmış detay kazanır. “Ara Kat” ile “Ara Kat Dubleks” ayrımı korunur.",
    },
    {
      en: "Roof, garden, mid-floor, and standard duplex flags and types; large-home buckets and site interactions.",
      tr: "Çatı, bahçe, ara kat ve standart dubleks bayrakları ve tipleri; büyük konut grupları ve site etkileşimleri kullanılır.",
    },
  ] as LocalizedString[],
  timelineTitle: {
    en: "Model and experiment timeline",
    tr: "Model ve deney zaman çizelgesi",
  },
  timelineFigure: {
    en: "FIG. Selected milestones",
    tr: "ŞEK. Seçilmiş dönüm noktaları",
  },
  resultsTitle: {
    en: "Results",
    tr: "Sonuçlar",
  },
  resultsLead: {
    en: "Selected experiment full_v24 on kocaeli_global. County metrics, variance ratio, leakage, and merge audit details sit in the panels below.",
    tr: "Seçilen deney: full_v24, kapsam: kocaeli_global. İlçe metrikleri, varyans oranı, sızıntı ve birleştirme denetimi ayrıntıları aşağıdaki panellerdedir.",
  },
  resultLabels: {
    experiment: { en: "Experiment", tr: "Deney" },
    scope: { en: "Scope", tr: "Kapsam" },
    varianceRatio: { en: "Variance ratio", tr: "Varyans oranı" },
    evaluationRows: { en: "Evaluation rows", tr: "Değerlendirme satırı" },
    leakagePass: { en: "Leakage pass", tr: "Sızıntı kontrolü" },
    severeMergeWarnings: {
      en: "Severe merge warnings",
      tr: "Ciddi birleştirme uyarıları",
    },
    countyResults: { en: "County results", tr: "İlçe sonuçları" },
    countyColumn: { en: "County", tr: "İlçe" },
    mergeAudit: { en: "Merge audit", tr: "Birleştirme denetimi" },
    possibleBadMerges: {
      en: "Possible bad merges",
      tr: "Olası hatalı birleştirmeler",
    },
    nonBlockingManualReview: {
      en: "non-blocking manual review",
      tr: "engelleyici değil, elle inceleme",
    },
    vsReference: { en: "vs", tr: "karşılaştırma" },
    varianceImproved: {
      en: "variance ratio improved",
      tr: "varyans oranı iyileşti",
    },
  },
  productBandTitle: {
    en: "Product translation: value band",
    tr: "Ürün çevirisi: değer bandı",
  },
  productBandFigure: {
    en: "FIG. Illustrative total property value",
    tr: "ŞEK. Örnek toplam konut değeri",
  },
  productBandIllustrative: {
    en: "Illustrative example: total property value (not unit price TL/m²)",
    tr: "Örnek anlatım: toplam konut değeri (birim fiyat TL/m² değil)",
  },
  productBandNarrative: {
    en: "The product leads with a point estimate and a reasonable band; a wider market range stays in detail or tooltip. Intervals are a more honest decision aid for users than quoting R² alone.",
    tr: "Üründe önce nokta tahmin ve makul bant gelir; daha geniş piyasa aralığı ayrıntı veya ipucu düzeyinde kalır. Kullanıcıya yalnızca R² vermekten ziyade aralık yaklaşımı daha dürüst bir karar desteğidir.",
  },
  productBandLabels: {
    estimate: { en: "Estimated value", tr: "Tahmini değer" },
    reasonable: { en: "Reasonable value range", tr: "Makul değer aralığı" },
    wider: { en: "Wider market range", tr: "Daha geniş piyasa aralığı" },
    rangeTo: { en: "to", tr: "ile" },
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
      en: "Premium and top-decile underprediction continues.",
      tr: "Premium ve üst ondalık dilimde düşük tahmin sorunu sürüyor.",
    },
    {
      en: "Visual and interior quality, view, and façade signals are unobserved.",
      tr: "Görsel ve iç kalite, manzara ve cephe sinyalleri gözlenmiyor.",
    },
  ] as LocalizedString[],
  rejectedTitle: {
    en: "What did not improve the model",
    tr: "Modele katkı vermeyenler",
  },
  rejectedItems: [
    {
      en: "V19 calibration: variance ratio opened slightly, but R² and MAPE worsened, so it was rejected.",
      tr: "V19 kalibrasyon: varyans oranı biraz açılsa da R² ve MAPE bozulduğu için reddedildi.",
    },
    {
      en: "The no-ridge variant degraded and was rejected.",
      tr: "Ridge’siz varyant kötüleşti ve reddedildi.",
    },
    {
      en: "V22 Sentinel satellite environment indices produced no meaningful lift over V21 and were closed as diagnostic.",
      tr: "V22 Sentinel uydu çevre indeksleri V21 üzerine anlamlı iyileşme vermedi ve tanısal olarak kapatıldı.",
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
  decisionDiagnostic: { en: "diagnostic", tr: "tanısal" },
  decisionCurrentBest: { en: "current best", tr: "güncel en iyi" },
  metricGlobalR2: { en: "Global R²", tr: "Global R²" },
  metricGlobalMape: { en: "Global MAPE", tr: "Global MAPE" },
  metricSaleRental: { en: "Sale + rental", tr: "Satış + kira" },
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
      en: "V1 to V16 / legacy thesis era",
      tr: "V1 ile V16 / eski tez dönemi",
    },
    summary: {
      en: "Classical tabular models; low R² and variance compression in Başiskele.",
      tr: "Klasik tablo modelleri; Başiskele’de düşük R² ve varyans sıkışması.",
    },
    decision: "rejected",
  },
  {
    era: {
      en: "V17 to V18 / location era",
      tr: "V17 ile V18 / konum dönemi",
    },
    summary: {
      en: "Geo features lifted Başiskele; the comparable-market predictor was rejected.",
      tr: "Coğrafi özellikler Başiskele’de iyileşme verdi; karşılaştırılabilir-piyasa tahmincisi reddedildi.",
    },
    decision: "selected",
  },
  {
    era: {
      en: "V19 / calibration diagnostics",
      tr: "V19 / kalibrasyon teşhisi",
    },
    summary: {
      en: "Isotonic and linear calibration and a no-ridge variant were tried; R² and MAPE worsened, so they were rejected.",
      tr: "İzotonik ve doğrusal kalibrasyon ile ridge’siz varyant denendi; R² ve MAPE bozulduğu için reddedildi.",
    },
    decision: "rejected",
  },
  {
    era: {
      en: "V20 to V21 / site-project signals",
      tr: "V20 ile V21 / site-proje sinyalleri",
    },
    summary: {
      en: "Site and project identity produced the first meaningful lift; extraction improved.",
      tr: "Site ve proje kimliği ilk anlamlı iyileşmeyi üretti; çıkarım güçlendirildi.",
    },
    decision: "selected",
  },
  {
    era: {
      en: "V22 / satellite pilot",
      tr: "V22 / uydu pilotu",
    },
    summary: {
      en: "GEE and Sentinel features gave no meaningful lift and were closed as diagnostic.",
      tr: "GEE ve Sentinel özellikleri anlamlı iyileşme vermedi; tanısal olarak kapatıldı.",
    },
    decision: "diagnostic",
  },
  {
    era: {
      en: "V23 / duplex interactions",
      tr: "V23 / dubleks etkileşimleri",
    },
    summary: {
      en: "Modest but consistent lift on refreshed Başiskele data; Başiskele-only best.",
      tr: "Yenilenmiş Başiskele verisinde mütevazı ama tutarlı iyileşme; yalnızca Başiskele için en iyi.",
    },
    decision: "selected",
  },
  {
    era: {
      en: "V24 to V24.1 / global repair",
      tr: "V24 ile V24.1 / global onarım",
    },
    summary: {
      en: "Kocaeli global site-aware model; after merge repair, full_v24 is the global best.",
      tr: "Kocaeli global site-farkındalı model; birleştirme onarımından sonra full_v24 global en iyidir.",
    },
    decision: "current-best",
  },
];
