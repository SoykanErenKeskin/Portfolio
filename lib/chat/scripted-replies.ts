/**
 * Scripted portfolio assistant — no LLM.
 * Matching + answer variants keep replies feeling conversational.
 */

export type ScriptLocale = "en" | "tr";

export type ScriptedIntentId =
  | "greeting"
  | "thanks"
  | "who"
  | "projects"
  | "skills"
  | "contact"
  | "resume"
  | "education"
  | "experience"
  | "languages"
  | "websites"
  | "career"
  | "quarox";

type IntentDef = {
  id: ScriptedIntentId;
  /** Normalized phrases that map strongly to this intent */
  phrases: string[];
  /** Loose keywords; scored by hit count */
  keywords: string[];
  answers: Record<ScriptLocale, string[]>;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickVariant(variants: string[], seed: string): string {
  if (variants.length === 0) return "";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return variants[h % variants.length]!;
}

const INTENTS: IntentDef[] = [
  {
    id: "greeting",
    phrases: ["hi", "hello", "hey", "selam", "merhaba", "hey there", "good morning", "gunaydin"],
    keywords: ["selam", "merhaba", "hello", "hi ", "hey"],
    answers: {
      en: [
        "Hey — I can walk you through Soykan's background, projects, skills, or how to reach him. What are you curious about?",
        "Hi! Ask me about his work, stack, education, or contact details — happy to help.",
      ],
      tr: [
        "Merhaba — Soykan'ın geçmişi, projeleri, becerileri veya iletişim bilgileri hakkında yardımcı olabilirim. Ne merak ediyorsun?",
        "Selam! Çalışmaları, teknoloji yığını, eğitimi veya iletişimi sorabilirsin.",
      ],
    },
  },
  {
    id: "thanks",
    phrases: ["thanks", "thank you", "tesekkur", "tesekkurler", "sagol", "thx"],
    keywords: ["thanks", "thank", "tesekkur", "sagol", "teşekkür"],
    answers: {
      en: [
        "You're welcome. If you want the resume link or a project deep-dive, just say the word.",
        "Anytime. Ping me again if something else about the portfolio comes up.",
      ],
      tr: [
        "Rica ederim. Özgeçmiş veya bir proje detayı istersen yazman yeterli.",
        "Ne demek. Portföyle ilgili başka bir şey olursa yine sor.",
      ],
    },
  },
  {
    id: "who",
    phrases: [
      "who is soykan",
      "soykan kimdir",
      "about soykan",
      "tell me about him",
      "kim bu",
      "hakkinda",
    ],
    keywords: [
      "kimdir",
      "who is",
      "about him",
      "hakkinda",
      "tanit",
      "introduce",
      "background",
      "biyografi",
      "bio",
    ],
    answers: {
      en: [
        "Soykan Eren Keskin is a fourth-year Industrial Engineering student at Kocaeli University. He leans into digital transformation, data analytics, and process optimization — basically bridging engineering thinking with practical software.\n\nHe also spent an Erasmus semester at Universidad de Málaga, which shows up in how comfortably he works across languages and teams.",
        "Short version: industrial engineering + software-minded builder. Soykan studies at Kocaeli University, cares about making operations clearer with data, and ships projects that solve real workflow problems rather than demos for their own sake.",
      ],
      tr: [
        "Soykan Eren Keskin, Kocaeli Üniversitesi'nde dördüncü sınıf Endüstri Mühendisliği öğrencisi. Dijital dönüşüm, veri analitiği ve süreç optimizasyonuna odaklanıyor — mühendislik bakışını pratik yazılıma bağlayan biri.\n\nUniversidad de Málaga'da Erasmus dönemi de var; çok dilli / çok kültürlü ortamlarda rahat çalışmasına yansıyor.",
        "Kısaca: endüstri mühendisliği + yazılım odaklı üretici. Kocaeli Üniversitesi'nde okuyor, operasyonları veriyle netleştirmeyi seviyor ve “sırf demo” değil, gerçek iş akışı sorunlarına çözüm üreten projeler çıkarıyor.",
      ],
    },
  },
  {
    id: "projects",
    phrases: [
      "what projects",
      "hangi projelerde",
      "his projects",
      "projeleri",
      "project portfolio",
    ],
    keywords: [
      "project",
      "proje",
      "portfolio",
      "calisti",
      "worked on",
      "built",
      "yaptigi",
      "case",
    ],
    answers: {
      en: [
        "A few highlights from his portfolio:\n\n• **Order & operational tracking** — mobile + backend for warehouse-to-delivery style ops (roles, routes, live monitoring).\n• **Personality-based place recommendation & routing** — RIASEC-inspired recommendations with a routing angle.\n• **Internet café feasibility** — market + financial model, AutoCAD layout, SketchUp concept.\n• Fault-detection / data analysis work on the side.\n\nOpen the **Projects** page for the full case write-ups.",
        "He's shipped systems that mix ops and software: logistics-style order & route tracking, a personality-based recommendation/routing project, a full café feasibility study (numbers + floor plan), plus analytics / fault-detection pieces.\n\nIf you want depth on one of them, the project pages walk through problem → approach → outcome.",
      ],
      tr: [
        "Portföyden öne çıkanlar:\n\n• **Sipariş & operasyon takibi** — depodan teslimata rol, rota ve canlı izleme (mobil + backend).\n• **Kişilik bazlı mekân önerisi & yönlendirme** — RIASEC esintili öneri + routing.\n• **Internet kafe fizibilitesi** — pazar/finans modeli, AutoCAD yerleşim, SketchUp konsept.\n• Arıza tespiti / veri analizi çalışmaları.\n\nDetaylı vaka yazıları için **Projeler** sayfasına bakabilirsin.",
        "Operasyon ile yazılımı birleştiren işler çıkarmış: lojistik tarzı sipariş-rota takibi, kişilik bazlı öneri/yönlendirme, kafe fizibilitesi (rakam + yerleşim), ayrıca analitik / arıza tespiti parçaları.\n\nBirine derinlemesine bakmak istersen proje sayfalarında problem → yaklaşım → sonuç akışı var.",
      ],
    },
  },
  {
    id: "skills",
    phrases: [
      "technical skills",
      "teknik becerileri",
      "what can he do",
      "tech stack",
      "becerileri neler",
    ],
    keywords: [
      "skill",
      "beceri",
      "stack",
      "teknoloji",
      "tech",
      "yazilim",
      "programming",
      "dil bilir",
      "tools",
      "arac",
    ],
    answers: {
      en: [
        "On the technical side you'll see **JavaScript, Python, Java, C#**, plus **SQL / Pandas / Scikit-learn** for analytics. For industry tooling: **SAP, Power BI, AutoCAD**, and some PCB work with EasyEDA / Altium. Frontend/backend practice includes **React**, Supabase, and Firebase.\n\nSoft skills he leans on: structured problem-solving, teamwork, and adapting quickly in new environments.",
        "Think dual toolkit: software (**JS, Python, Java, C#, React**) and engineering ops (**SAP, Power BI, AutoCAD**), with a solid data layer (**SQL, Pandas, scikit-learn**).\n\nHe's strongest when a problem needs both process thinking and a working digital prototype.",
      ],
      tr: [
        "Teknik tarafta **JavaScript, Python, Java, C#**; analitikte **SQL / Pandas / Scikit-learn**. Endüstri araçları: **SAP, Power BI, AutoCAD**, PCB tarafında EasyEDA / Altium. Yazılım pratikte **React**, Supabase, Firebase de var.\n\nYumuşak beceriler: yapılandırılmış problem çözme, ekip çalışması, yeni ortama hızlı uyum.",
        "İki katmanlı bir toolkit: yazılım (**JS, Python, Java, C#, React**) + mühendislik/ops (**SAP, Power BI, AutoCAD**), üstüne veri katmanı (**SQL, Pandas, scikit-learn**).\n\nEn iyi olduğu yer: süreç düşüncesi ile çalışan bir dijital prototipi aynı anda isteyen problemler.",
      ],
    },
  },
  {
    id: "contact",
    phrases: [
      "how can i contact",
      "nasil iletisime",
      "contact him",
      "email",
      "iletisim",
    ],
    keywords: [
      "contact",
      "email",
      "mail",
      "iletisim",
      "ulasmak",
      "reach",
      "linkedin",
      "yazabilir",
      "message",
    ],
    answers: {
      en: [
        "Easiest path: **soykanerenkeskin@gmail.com**.\n\nYou can also find him on **LinkedIn** and **GitHub**, or use the Contact page on this site. Personal site: **soykanerenkeskin.com**.\n\n(If you meant The Quarox — that's a separate business site for digitalizing companies, not his personal inbox.)",
        "Drop a mail at **soykanerenkeskin@gmail.com**, or connect via LinkedIn / GitHub from the header. This portfolio's Contact section has the same channels in one place.",
      ],
      tr: [
        "En hızlı yol: **soykanerenkeskin@gmail.com**.\n\n**LinkedIn** ve **GitHub** üzerinden de ulaşabilirsin; sitedeki İletişim sayfası da aynı kanalları topluyor. Kişisel site: **soykanerenkeskin.com**.\n\n(The Quarox ayrı bir iş / danışmanlık sitesi — kişisel iletişim kutusu değil.)",
        "**soykanerenkeskin@gmail.com** adresine yazabilir veya üst menüdeki LinkedIn / GitHub bağlantılarından gidebilirsin. İletişim bölümünde hepsi bir arada.",
      ],
    },
  },
  {
    id: "resume",
    phrases: [
      "can i see his resume",
      "ozgecmisini",
      "resume",
      "cv",
      "ozgecmis",
    ],
    keywords: ["resume", "cv", "ozgecmis", "curriculum", "pdf"],
    answers: {
      en: [
        "Sure — here's the resume PDF:\n\n{resumeUrl}\n\nDownload it from that link whenever you need it.",
        "Yep. Resume (PDF):\n\n{resumeUrl}",
      ],
      tr: [
        "Tabii — özgeçmiş PDF'i burada:\n\n{resumeUrl}\n\nİstediğin zaman o linkten indirebilirsin.",
        "Evet. Özgeçmiş (PDF):\n\n{resumeUrl}",
      ],
    },
  },
  {
    id: "education",
    phrases: ["education", "university", "okul", "erasmus", "malaga", "kocaeli"],
    keywords: [
      "education",
      "university",
      "universite",
      "okul",
      "erasmus",
      "malaga",
      "kocaeli",
      "student",
      "ogrenci",
      "degree",
    ],
    answers: {
      en: [
        "He's studying **Industrial Engineering at Kocaeli University** (2022–present, fourth year).\n\nHe also did an **Erasmus exchange at Universidad de Málaga** (Feb–Jul 2024) — useful context for international collaboration and language practice.",
        "Academic path: Kocaeli University · Industrial Engineering, plus a semester abroad in Málaga. That mix shows up in both his engineering coursework and how he frames cross-cultural team work.",
      ],
      tr: [
        "**Kocaeli Üniversitesi Endüstri Mühendisliği** öğrencisi (2022–günümüz, 4. sınıf).\n\n**Universidad de Málaga**'da Erasmus dönemi de var (Şub–Tem 2024) — uluslararası iş birliği ve dil pratiği için iyi bir bağlam.",
        "Akademik yol: Kocaeli Üniversitesi · Endüstri Mühendisliği + Málaga'da bir dönem. Hem ders birikimine hem de çok kültürlü ekip çalışmasına yansıyor.",
      ],
    },
  },
  {
    id: "experience",
    phrases: ["experience", "internship", "staj", "work history", "deneyim"],
    keywords: [
      "experience",
      "internship",
      "staj",
      "intern",
      "deneyim",
      "production planning",
      "uretim planlama",
      "work history",
      "job experience",
    ],
    answers: {
      en: [
        "Industry-wise he's done a **Production Planning internship**: workflow analysis, spotting bottlenecks, and drafting process-improvement ideas in a real manufacturing setting.\n\nAlongside that, his project work doubles as applied experience — ops dashboards, routing, feasibility models.",
        "Look at the Production Planning intern role for classic IE exposure (flows, bottlenecks, improvement proposals). His portfolio projects fill in the software/ops side with shipping systems end-to-end.",
      ],
      tr: [
        "Sektör tarafında **Üretim Planlama stajı** var: iş akışı analizi, darboğaz tespiti ve gerçek bir üretim ortamında iyileştirme önerileri.\n\nBunun yanında projeleri de uygulamalı deneyim sayılır — operasyon panelleri, routing, fizibilite modelleri.",
        "Klasik EM stajı için Üretim Planlama rolüne bak; portföy projeleri ise yazılım/ops tarafını uçtan uca tamamlıyor.",
      ],
    },
  },
  {
    id: "languages",
    phrases: ["languages", "diller", "english level", "hangi dilleri"],
    keywords: [
      "language",
      "dil",
      "english",
      "spanish",
      "german",
      "ispanyolca",
      "almanca",
      "turkce",
      "c1",
    ],
    answers: {
      en: [
        "Language stack: **Turkish (native)**, **English (C1)**, **Spanish (A2)**, **German (A2)**. English is day-to-day ready; Spanish and German are actively improving.",
        "He's native in Turkish, solid in English (C1), and building Spanish + German at A2 — enough for Erasmus-style environments and growing from there.",
      ],
      tr: [
        "Diller: **Türkçe (ana dil)**, **İngilizce (C1)**, **İspanyolca (A2)**, **Almanca (A2)**. İngilizce günlük iş için hazır; İspanyolca ve Almanca geliştirme aşamasında.",
        "Ana dil Türkçe, İngilizce C1, İspanyolca + Almanca A2 — Erasmus tarzı ortamlara yetiyor ve üzerine inşa ediliyor.",
      ],
    },
  },
  {
    id: "websites",
    phrases: ["website", "personal site", "sitesi", "web sitesi"],
    keywords: ["website", "websitesi", "soykanerenkeskin.com", "personal site", "kisisel site"],
    answers: {
      en: [
        "Personal / portfolio site: **https://soykanerenkeskin.com** (you're on that world right now).\n\n**The Quarox (thequarox.com)** is separate — a business/consulting venture for helping companies digitize, not his personal homepage.",
        "If you want “his website,” go with **soykanerenkeskin.com**. The Quarox domain is the company-facing digitalization project, so don't mix the two.",
      ],
      tr: [
        "Kişisel / portföy sitesi: **https://soykanerenkeskin.com** (şu an o dünyadasın).\n\n**The Quarox (thequarox.com)** ayrı — firmaların dijitalleşmesine odaklanan iş/danışmanlık girişimi; kişisel ana sayfa değil.",
        "“Kişisel sitesi” dendiğinde cevap **soykanerenkeskin.com**. Quarox alanı şirket odaklı dijitalleşme projesi; ikisini karıştırmamak lazım.",
      ],
    },
  },
  {
    id: "quarox",
    phrases: ["the quarox", "quarox", "thequarox"],
    keywords: ["quarox", "thequarox"],
    answers: {
      en: [
        "**The Quarox** is Soykan's separate venture aimed at helping businesses with digital transformation / digitization consulting. It's not the personal portfolio — that lives at soykanerenkeskin.com.",
        "Quarox ≠ personal site. Think company offering for digitizing operations; portfolio & bio stay on this personal site.",
      ],
      tr: [
        "**The Quarox**, işletmelerin dijital dönüşümü / dijitalleşme danışmanlığı için Soykan'ın ayrı girişimi. Kişisel portföy değil — o soykanerenkeskin.com'da.",
        "Quarox ≠ kişisel site. Operasyonları dijitalleştirme tarafındaki şirket teklifi gibi düşün; özgeçmiş ve portföy bu kişisel sitede.",
      ],
    },
  },
  {
    id: "career",
    phrases: ["career", "looking for", "internship opportunity", "ne ariyor", "kariyer"],
    keywords: [
      "career",
      "kariyer",
      "interest",
      "hedef",
      "goal",
      "hire",
      "ise al",
      "opportunity",
      "role",
      "pozisyon",
    ],
    answers: {
      en: [
        "He's interested in roles where **industrial engineering meets software and digital tools** — production optimization, data-driven decisions, and practical digital solutions for real ops.\n\nIf that overlaps with what you're hiring for, the Contact channels are the right next step.",
        "Directionally: ops improvement + analytics + building the tools that make those improvements stick. Not locked to one title — more about impact at the IE ↔ software intersection.",
      ],
      tr: [
        "**Endüstri mühendisliği ile yazılım / dijital araçların kesiştiği** rollere ilgisi var — üretim optimizasyonu, veriye dayalı kararlar, gerçek operasyon için pratik dijital çözümler.\n\nAçık bir pozisyonla örtüşüyorsa İletişim kanalları doğru sonraki adım.",
        "Yön: ops iyileştirme + analitik + o iyileştirmeyi kalıcı kılan araçları üretmek. Tek bir unvana kilitli değil; EM ↔ yazılım kesişimindeki etkiye bakıyor.",
      ],
    },
  },
];

const FALLBACK: Record<ScriptLocale, string[]> = {
  en: [
    "I mostly cover Soykan's portfolio topics — background, projects, skills, education, and contact. Try one of the suggestions, or rephrase around those themes.",
    "Not sure I have that detail locked in. Ask about who he is, what he's built, his stack, or how to reach him — those I can answer cleanly.",
  ],
  tr: [
    "Ben daha çok Soykan'ın portföy konularını biliyorum — geçmiş, projeler, beceriler, eğitim ve iletişim. Önerilerden birini dene veya soruyu o temalara yaklaştır.",
    "Bu detayı net bilmiyorum. Kim olduğu, neler yaptığı, teknoloji yığını veya nasıl ulaşılacağı sorularında net cevap verebilirim.",
  ],
};

export type ScriptedMatchResult = {
  intentId: ScriptedIntentId | "fallback";
  content: string;
};

function scoreIntent(normalized: string, intent: IntentDef): number {
  let score = 0;
  for (const phrase of intent.phrases) {
    const p = normalize(phrase);
    if (!p) continue;
    if (normalized === p) score += 12;
    else if (normalized.includes(p)) score += 8;
  }
  for (const kw of intent.keywords) {
    const k = normalize(kw);
    if (k && normalized.includes(k)) score += 2;
  }
  return score;
}

/**
 * Match free-text (or a suggestion chip) to a scripted answer.
 * `resumeUrl` is injected when the resume intent wins.
 */
export function matchScriptedReply(
  rawText: string,
  locale: ScriptLocale,
  opts?: { resumeUrl?: string | null; conversationSeed?: string }
): ScriptedMatchResult {
  const normalized = normalize(rawText);
  if (!normalized) {
    return {
      intentId: "fallback",
      content: pickVariant(FALLBACK[locale], `empty-${locale}`),
    };
  }

  let best: IntentDef | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const s = scoreIntent(normalized, intent);
    if (s > bestScore) {
      bestScore = s;
      best = intent;
    }
  }

  const threshold = 2;
  if (!best || bestScore < threshold) {
    return {
      intentId: "fallback",
      content: pickVariant(
        FALLBACK[locale],
        `${normalized}-${opts?.conversationSeed ?? ""}`
      ),
    };
  }

  let content = pickVariant(
    best.answers[locale],
    `${best.id}-${normalized}-${opts?.conversationSeed ?? ""}`
  );

  if (best.id === "resume") {
    const url = opts?.resumeUrl?.trim();
    if (url) {
      content = content.replaceAll("{resumeUrl}", url);
    } else {
      content =
        locale === "tr"
          ? "Özgeçmiş dosyası şu an bağlı değil; İletişim sayfasından veya site yöneticisinden güncel PDF'i isteyebilirsin."
          : "The resume file isn't linked right now — grab it from the Contact page or ask the site admin for the latest PDF.";
    }
  }

  return { intentId: best.id, content };
}

/** Suggestion chip labels — keep in sync with messages.*.json `chat.suggestions` */
export const SCRIPTED_SUGGESTION_INTENT: ScriptedIntentId[] = [
  "who",
  "projects",
  "skills",
  "contact",
  "resume",
];

export function replyForSuggestionIndex(
  index: number,
  locale: ScriptLocale,
  opts?: { resumeUrl?: string | null; conversationSeed?: string }
): ScriptedMatchResult {
  const id = SCRIPTED_SUGGESTION_INTENT[index];
  if (!id) {
    return matchScriptedReply("", locale, opts);
  }
  const intent = INTENTS.find((i) => i.id === id)!;
  let content = pickVariant(
    intent.answers[locale],
    `suggestion-${id}-${opts?.conversationSeed ?? Date.now()}`
  );
  if (id === "resume") {
    const url = opts?.resumeUrl?.trim();
    content = url
      ? content.replaceAll("{resumeUrl}", url)
      : locale === "tr"
        ? "Özgeçmiş dosyası şu an bağlı değil; İletişim sayfasından bakabilirsin."
        : "The resume file isn't linked right now — check the Contact page.";
  }
  return { intentId: id, content };
}

/** Artificial “thinking” delay so replies don't feel instant/scripted. */
export function scriptedReplyDelayMs(textLength: number): number {
  const base = 450 + Math.min(900, textLength * 8);
  const jitter = Math.floor(Math.random() * 350);
  return base + jitter;
}
