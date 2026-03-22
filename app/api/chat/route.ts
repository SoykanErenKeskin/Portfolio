import { NextRequest, NextResponse } from "next/server";
import { getChatbotPrompt } from "@/lib/chat/get-prompt";
import { buildSystemPrompt } from "@/lib/chat/build-prompt";
import { getAllProjects } from "@/lib/db/projects";
import { getProfilesForChatbot } from "@/lib/db/profile";
import { getFaqForChatbot } from "@/lib/db/faq";

type Message = { role: "user" | "assistant" | "system"; content: string };

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { messages?: Message[] };
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const apiKey = openRouterKey || openaiKey;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chat API key not configured (OPENROUTER_API_KEY or OPENAI_API_KEY)" },
        { status: 503 }
      );
    }

    const [
      { systemPrompt: customPrompt, rules, chatbotData },
      projects,
      profiles,
      faq,
    ] = await Promise.all([
      getChatbotPrompt(),
      getAllProjects({ publishedOnly: true }),
      getProfilesForChatbot(),
      getFaqForChatbot(),
    ]);

    const systemPrompt = buildSystemPrompt(
      customPrompt,
      projects,
      profiles,
      faq,
      rules,
      chatbotData
    );
    const apiMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    const isOpenRouter = !!openRouterKey;
    const url = isOpenRouter
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model =
      process.env.OPENROUTER_MODEL ||
      (isOpenRouter ? "stepfun/step-3.5-flash:free" : "gpt-4o-mini");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    if (isOpenRouter) {
      headers["HTTP-Referer"] = process.env.NEXTAUTH_URL || "http://localhost:3000";
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: apiMessages,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Chat API error:", res.status, errText);
      return NextResponse.json(
        { error: "Chat service error" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content =
      data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";
    return NextResponse.json({ message: content });
  } catch (e) {
    console.error("Chat error:", e);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
