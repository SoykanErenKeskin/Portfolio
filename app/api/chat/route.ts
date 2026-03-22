import { NextRequest, NextResponse } from "next/server";
import { getChatbotPrompt } from "@/lib/chat/get-prompt";
import { buildSystemPrompt } from "@/lib/chat/build-prompt";
import { getAllProjects } from "@/lib/db/projects";
import { getProfilesForChatbot } from "@/lib/db/profile";
import { getFaqForChatbot } from "@/lib/db/faq";
import { getLearningTimeline } from "@/lib/db/learning-timeline";
import { classifyCrisisFromUserText } from "@/lib/chat/crisis-classifier";
import {
  containsSensitiveUserContent,
  detectCrisisLanguage,
  getCrisisResponseText,
  type CrisisLang,
} from "@/lib/chat/sensitive-content";

type Message = { role: "user" | "assistant" | "system"; content: string };

function parseLocale(raw: unknown): CrisisLang {
  if (raw === "tr" || raw === "en") return raw;
  return "en";
}

/** User-visible message when upstream chat API fails (locale + HTTP status). */
function userFacingChatError(locale: CrisisLang, status: number): string {
  const tr = locale === "tr";
  if (status === 429) {
    return tr
      ? "Şu an çok fazla istek var. Lütfen kısa bir süre sonra tekrar deneyin."
      : "Too many requests right now. Please try again in a moment.";
  }
  if (status === 402 || status === 403) {
    return tr
      ? "Sohbet servisi kotası veya API anahtarı sınırına ulaştı. Site yöneticisi ile iletişime geçin."
      : "Chat quota or API key limit reached. Please contact the site administrator.";
  }
  if (status >= 500) {
    return tr
      ? "Sohbet servisi şu an yanıt veremiyor. Lütfen daha sonra tekrar deneyin."
      : "The chat service is temporarily unavailable. Please try again later.";
  }
  return tr
    ? "Sohbet geçici olarak kullanılamıyor. Lütfen sonra tekrar deneyin."
    : "Chat is temporarily unavailable. Please try again later.";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages?: Message[];
      locale?: string;
    };
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const siteLocale = parseLocale(body?.locale);

    const userTexts = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content ?? "");
    const combinedUser = userTexts.join("\n");

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const apiKey = openRouterKey || openaiKey;
    const isOpenRouter = !!openRouterKey;

    /** Crisis gate: AI classifier first; keyword fallback inside classifier on failure */
    if (apiKey) {
      const { crisis } = await classifyCrisisFromUserText(combinedUser, {
        apiKey,
        isOpenRouter,
      });
      if (crisis) {
        const lang = detectCrisisLanguage(combinedUser, siteLocale);
        const fixed = getCrisisResponseText(lang);
        return NextResponse.json({
          crisis: true,
          /** Fixed template only — never forward any LLM body here */
          message: fixed,
          crisisLang: lang,
        });
      }
    } else {
      if (containsSensitiveUserContent(combinedUser)) {
        const lang = detectCrisisLanguage(combinedUser, siteLocale);
        return NextResponse.json({
          crisis: true,
          message: getCrisisResponseText(lang),
          crisisLang: lang,
        });
      }
      return NextResponse.json(
        { error: "Chat API key not configured (OPENROUTER_API_KEY or OPENAI_API_KEY)" },
        { status: 503 }
      );
    }

    /** Keyword gate before main chat (classifier false negatives) */
    if (containsSensitiveUserContent(combinedUser)) {
      const lang = detectCrisisLanguage(combinedUser, siteLocale);
      const fixed = getCrisisResponseText(lang);
      return NextResponse.json({
        crisis: true,
        message: fixed,
        crisisLang: lang,
      });
    }

    const [
      { systemPrompt: customPrompt, rules, chatbotData },
      projects,
      profiles,
      faq,
      learningTimeline,
    ] = await Promise.all([
      getChatbotPrompt(),
      getAllProjects({ publishedOnly: true }),
      getProfilesForChatbot(),
      getFaqForChatbot(),
      getLearningTimeline(),
    ]);

    const systemPrompt = buildSystemPrompt(
      customPrompt,
      projects,
      profiles,
      faq,
      rules,
      chatbotData,
      learningTimeline
    );
    const apiMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const openAiUrl = "https://api.openai.com/v1/chat/completions";
    const openRouterModel =
      process.env.OPENROUTER_MODEL?.trim() ||
      "stepfun/step-3.5-flash:free";
    const openAiModel =
      process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

    const openRouterHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterKey!}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
    };

    let res: Response;

    if (isOpenRouter) {
      res = await fetch(openRouterUrl, {
        method: "POST",
        headers: openRouterHeaders,
        body: JSON.stringify({
          model: openRouterModel,
          messages: apiMessages,
          max_tokens: 2048,
        }),
      });
      /** Quota / rate limit / model errors — retry with OpenAI if a separate key is configured */
      if (!res.ok && openaiKey) {
        const errText = await res.text();
        console.warn(
          "OpenRouter chat failed, falling back to OpenAI:",
          res.status,
          errText.slice(0, 500)
        );
        res = await fetch(openAiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: apiMessages,
            max_tokens: 2048,
          }),
        });
      }
    } else {
      res = await fetch(openAiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: openAiModel,
          messages: apiMessages,
          max_tokens: 2048,
        }),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error("Chat API error:", res.status, errText);
      return NextResponse.json(
        { error: userFacingChatError(siteLocale, res.status) },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content =
      data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";

    /** Main model must use CRISIS_GATE (first line) — replace with fixed template, never show model prose */
    const firstLine = content.trim().split(/\r?\n/)[0]?.trim() ?? "";
    const gateMatch = /^CRISIS_GATE$/i.test(firstLine);
    if (gateMatch) {
      const lang = detectCrisisLanguage(combinedUser, siteLocale);
      const fixed = getCrisisResponseText(lang);
      return NextResponse.json({
        crisis: true,
        message: fixed,
        crisisLang: lang,
      });
    }

    return NextResponse.json({ message: content });
  } catch (e) {
    console.error("Chat error:", e);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
