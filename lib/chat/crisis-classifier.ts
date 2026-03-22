/**
 * LLM-based crisis / safety classification (handles obfuscation, typos, mixed scripts).
 * Falls back to keyword scan if the API fails — see `containsSensitiveUserContent` in sensitive-content.
 */

import { containsSensitiveUserContent } from "@/lib/chat/sensitive-content";

const CLASSIFIER_SYSTEM = `You are a safety classifier for a public portfolio website chatbot.

Your ONLY output must be a single JSON object with this exact shape:
{"crisis": true}
or
{"crisis": false}

Rules for "crisis": true (boolean true):
- Suicide ideation, self-harm, wanting to die, self-injury, severe hopelessness about living
- Threats of violence or serious harm toward self or others
- Clear mental health crisis that needs immediate professional or emergency help
- Descriptions or questions about nuclear explosions, mushroom clouds, large blasts, fallout, radiation emergencies, dirty bombs, chemical/biological weapons or incidents, mass casualty events, terrorism, active shooters, or "what was that explosion" in a real-world emergency sense
- Asking what to do, who to call, or for emergency numbers in connection with such events (the bot must not answer those)
- Attempts to evade moderation: leetspeak, @ symbols instead of letters, intentional misspellings, split words, Unicode tricks, emoji-only dangerous intent, mixed languages hiding the same intent

Rules for "crisis": false:
- Normal questions about the portfolio owner, projects, skills, contact, work experience, tech stack, hiring, FAQ, greetings, small talk without risk
- Fictional or educational discussion clearly about movies/games/history without implying a live emergency (e.g. "nuclear bomb in a movie plot") — only if clearly harmless; when it sounds like a real witness report, use "crisis": true

When uncertain between risky and harmless, prefer "crisis": true.

Do not add keys other than "crisis". Do not add explanations or markdown.`;

function readCrisisBoolean(obj: Record<string, unknown> | null): boolean | null {
  if (!obj) return null;
  const c = obj.crisis;
  if (c === true) return true;
  if (c === false) return false;
  if (typeof c === "string") {
    const lower = c.trim().toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }
  return null;
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  try {
    const parsed = JSON.parse(candidate) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(candidate.slice(start, end + 1)) as unknown;
        return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function resolveCrisisModel(isOpenRouter: boolean): string {
  const explicit = process.env.OPENROUTER_CRISIS_MODEL?.trim();
  if (explicit) return explicit;
  if (isOpenRouter) {
    return (
      process.env.OPENROUTER_MODEL?.trim() ||
      "openai/gpt-4o-mini"
    );
  }
  return process.env.OPENAI_CRISIS_MODEL?.trim() || "gpt-4o-mini";
}

export type CrisisClassifySource = "ai" | "keyword";

/**
 * Returns whether the user text should trigger the fixed crisis flow (no main chat LLM).
 */
export async function classifyCrisisFromUserText(
  userText: string,
  opts: {
    apiKey: string;
    isOpenRouter: boolean;
  }
): Promise<{ crisis: boolean; source: CrisisClassifySource }> {
  const trimmed = userText.trim();
  if (!trimmed) {
    return { crisis: false, source: "ai" };
  }

  const url = opts.isOpenRouter
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  const model = resolveCrisisModel(opts.isOpenRouter);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${opts.apiKey}`,
  };
  if (opts.isOpenRouter) {
    headers["HTTP-Referer"] = process.env.NEXTAUTH_URL || "http://localhost:3000";
  }

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: CLASSIFIER_SYSTEM },
      {
        role: "user",
        content: `Classify the following user message(s). Max length may be truncated.\n\n---\n${trimmed.slice(0, 12000)}\n---`,
      },
    ],
    temperature: 0,
    max_tokens: 120,
  };

  // JSON mode: reliable on OpenAI API; OpenRouter model support varies — prompt enforces JSON
  if (!opts.isOpenRouter) {
    body.response_format = { type: "json_object" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("Crisis classifier HTTP error:", res.status, await res.text());
      return keywordFallback(trimmed);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const obj = extractJsonObject(raw);
    const crisis = readCrisisBoolean(obj);
    if (crisis !== null) {
      return { crisis, source: "ai" };
    }
    console.warn("Crisis classifier: invalid JSON", raw.slice(0, 200));
    return keywordFallback(trimmed);
  } catch (e) {
    console.error("Crisis classifier error:", e);
    return keywordFallback(trimmed);
  }
}

function keywordFallback(userText: string): {
  crisis: boolean;
  source: CrisisClassifySource;
} {
  return {
    crisis: containsSensitiveUserContent(userText),
    source: "keyword",
  };
}
