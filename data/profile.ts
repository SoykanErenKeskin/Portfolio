/**
 * Profil verisi – chatbot'un portföy hakkında bilgi vermek için kullandığı kaynak.
 * Admin panelindeki Profile veya CMS verileriyle senkron tutulabilir.
 */
export const profile = {
  name: "Soykan Eren Keskin",
  shortBio:
    "Fourth-year Industrial Engineering student at Kocaeli University. Interested in digital transformation, data analytics, and process optimization. Combines analytical thinking with practical problem solving.",
  email: "soykanerenkeskin@gmail.com",
  github: "https://github.com/SoykanErenKeskin",
  linkedin: "https://www.linkedin.com/in/soykanerenkeskin",
  website: "https://soykanerenkeskin.com",
  /** The Quarox – firmamsı site, işletmelerin dijitalleşmesine yardımcı. Kişisel site DEĞİL. */
  thequarox: "https://thequarox.com",

  education: [
    "Kocaeli University, Industrial Engineering, 2022–Present",
    "Erasmus Exchange, Universidad de Malaga, Feb–Jul 2024",
  ],

  experience: [
    "Production Planning Intern at Özka Lastik – workflow analysis, bottleneck identification, process improvement proposals.",
  ],

  skills: {
    technical: [
      "JavaScript",
      "Python",
      "Java",
      "C#",
      "SAP",
      "Power BI",
      "AutoCAD",
      "EasyEDA / Altium",
    ],
    analytics: ["Pandas", "SQL", "Scikit-learn", "Data Visualization", "Statistical Analysis"],
    core: ["Critical thinking", "Teamwork", "Problem solving", "Adaptability"],
  },

  languages: [
    { lang: "Turkish", level: "Native" },
    { lang: "English", level: "C1" },
    { lang: "Spanish", level: "A2" },
    { lang: "German", level: "A2" },
  ],

  careerInterests:
    "Combining industrial engineering with software and digital tools; production optimization, data-driven decision making, practical digital solutions.",

  growthAreas: [
    "Öğrenci olarak tam zamanlı profesyonel deneyim henüz sınırlı.",
    "İspanyolca ve Almanca A2 – ilerletmeye açık.",
    "SAP modüllerinde derin kullanım ve sektörel sertifikalar geliştirilebilir.",
  ],

  faq: [
    { q: "Who is Soykan?", a: "Industrial Engineering student at Kocaeli University, with Erasmus experience. Focuses on data analytics, process optimization, and building software-oriented projects." },
    { q: "What projects has he worked on?", a: "Order & Operational Tracking System (mobile + backend), Personality-Based Place Recommendation & Routing, Internet Cafe Feasibility, Fault Detection systems, and data analysis projects." },
    { q: "What are his technical skills?", a: "JavaScript, Python, Java, C#, SAP, Power BI, AutoCAD, SQL, Pandas, Scikit-learn, React, Supabase, Firebase." },
    { q: "How can I contact him?", a: "soykanerenkeskin@gmail.com, LinkedIn, GitHub, or his personal site soykanerenkeskin.com. The Quarox (thequarox.com) is his separate business/consulting site for digitizing companies – not his personal portfolio." },
  ],

  /** Comprehensive profile context – chatbot'un daha doğru cevap vermesi için detaylı metin */
  comprehensiveContext: `
WEBSITES (important – do not confuse):
- Personal portfolio site: soykanerenkeskin.com – this is Soykan's personal/portfolio site.
- The Quarox (thequarox.com) – NOT a personal site. It is a separate venture/company site Soykan is building to help businesses with digital transformation. Think of it as a consulting/company offering for digitizing businesses. When someone asks for "his website" or "personal site", the answer is soykanerenkeskin.com, not thequarox.com.

Soykan Eren Keskin is a fourth-year Industrial Engineering student at Kocaeli University with a strong focus on digital transformation, data analytics, and process optimization. He is an interdisciplinary thinker who combines engineering principles with software development to create practical, real-world solutions.

He approaches problems with an analytical mindset and focuses on identifying inefficiencies, understanding systems, and improving processes through structured thinking and data-driven decision-making. His work reflects a balance between theoretical engineering knowledge and hands-on implementation using modern digital tools.

In addition to his academic background, Soykan actively develops software and data-oriented projects. His projects are not only technical implementations but are also designed with a clear purpose: solving real problems, improving user experience, or optimizing operations. This makes him stand out as someone who does not just build systems, but builds meaningful solutions.

His Erasmus Exchange experience at Universidad de Malaga played an important role in shaping his perspective. It enhanced his ability to adapt quickly, collaborate in multicultural environments, and communicate effectively across different contexts. This experience contributes to his flexibility and openness in both technical and professional settings.

Soykan has also gained practical industry experience through his role as a Production Planning Intern at Özka Lastik ve Kauçuk Sanayi Ticaret A.Ş. During this period, he worked on analyzing production workflows, identifying inefficiencies, and contributing to process improvement initiatives. He focused on bottleneck detection and operational optimization, supporting productivity improvements in a real manufacturing environment.

From a technical perspective, Soykan has experience with multiple programming languages and tools, including JavaScript, Python, Java, and C#, as well as industry-related tools such as SAP, Power BI, AutoCAD, EasyEDA, and Altium. This combination allows him to operate both in software environments and engineering-driven systems.

His core strengths include critical thinking, problem solving, adaptability, and teamwork. He is particularly strong in understanding complex systems, breaking them down into manageable parts, and designing structured solutions.

Project portfolio highlights:
- Personality-Based Site Recommendation System using the RIASEC personality model – combines psychology-based models with algorithmic thinking for personalized recommendations.
- Internet Cafe Feasibility and Business Planning – market analysis, financial models (cost, revenue, cash flow), physical layout (AutoCAD), 3D interior concept (SketchUp). Approaches problems from both business and technical perspectives.
- Order and Route Management Application – logistics system managing delivery from warehouse to final delivery. Role-based dashboards, route assignment, real-time tracking, operational monitoring. Designed for scalable, operationally efficient systems.

Overall, Soykan positions himself at the intersection of industrial engineering and software development. He is interested in roles involving production optimization, digital transformation, operations improvement, and data-driven systems. He aims to continue building solutions that bridge engineering logic with modern technology, focusing on efficient, scalable, and impactful systems.
`.trim(),
} as const;
