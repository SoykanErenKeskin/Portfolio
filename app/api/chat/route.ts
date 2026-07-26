import { NextRequest, NextResponse } from "next/server";
import {
  containsSensitiveUserContent,
  detectCrisisLanguage,
  getCrisisResponseText,
  type CrisisLang,
} from "@/lib/chat/sensitive-content";
import {
  matchScriptedReply,
  type ScriptLocale,
} from "@/lib/chat/scripted-replies";

type Message = { role: "user" | "assistant" | "system"; content: string };

function parseLocale(raw: unknown): CrisisLang {
  if (raw === "tr" || raw === "en") return raw;
  return "en";
}

/**
 * Scripted portfolio Q&A — no LLM / API keys required.
 * Kept as an HTTP endpoint so the widget can stay a thin client if desired.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages?: Message[];
      locale?: string;
      resumeUrl?: string | null;
    };
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const siteLocale = parseLocale(body?.locale);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const text = lastUser?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "empty message" }, { status: 400 });
    }

    if (containsSensitiveUserContent(text)) {
      const lang = detectCrisisLanguage(text, siteLocale);
      return NextResponse.json({
        crisis: true,
        crisisLang: lang,
        message: getCrisisResponseText(lang),
      });
    }

    const seed = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("|");
    const { content } = matchScriptedReply(text, siteLocale as ScriptLocale, {
      resumeUrl: body.resumeUrl ?? null,
      conversationSeed: seed,
    });

    return NextResponse.json({ message: content });
  } catch {
    return NextResponse.json(
      { error: "Chat temporarily unavailable." },
      { status: 500 }
    );
  }
}
