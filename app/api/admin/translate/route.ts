import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";

const DEEPL_FREE = "https://api-free.deepl.com";
const DEEPL_PRO = "https://api.deepl.com";

export async function POST(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  const key = process.env.DEEPL_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { error: "DEEPL_API_KEY not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const base = key.endsWith(":fx") ? DEEPL_FREE : DEEPL_PRO;

  // Single text
  const single = body as { text?: string; from?: string; to?: string };
  if (typeof single.text === "string") {
    const from = (single.from ?? "").toUpperCase();
    const to = (single.to ?? "EN").toUpperCase();
    if (!to || (to !== "EN" && to !== "TR")) {
      return NextResponse.json({ error: "Invalid target language" }, { status: 400 });
    }

    const res = await fetch(`${base}/v2/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${key}`,
      },
      body: JSON.stringify({
        text: [single.text],
        target_lang: to === "TR" ? "TR" : "EN",
        ...(from && { source_lang: from }),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: errText || "DeepL request failed" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      translations?: Array<{ text?: string }>;
    };
    const translated = data.translations?.[0]?.text ?? "";
    return NextResponse.json({ translated });
  }

  // Multiple texts
  const multi = body as { texts?: Record<string, string>; from?: string; to?: string };
  if (multi.texts && typeof multi.texts === "object") {
    const from = (multi.from ?? "").toUpperCase();
    const to = (multi.to ?? "EN").toUpperCase();
    if (!to || (to !== "EN" && to !== "TR")) {
      return NextResponse.json({ error: "Invalid target language" }, { status: 400 });
    }

    const keys = Object.keys(multi.texts);
    const values = keys.map((k) => (multi.texts as Record<string, string>)[k] ?? "").filter(Boolean);
    if (values.length === 0) {
      return NextResponse.json({ translated: {} });
    }

    const res = await fetch(`${base}/v2/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${key}`,
      },
      body: JSON.stringify({
        text: values,
        target_lang: to === "TR" ? "TR" : "EN",
        ...(from && { source_lang: from }),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: errText || "DeepL request failed" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      translations?: Array<{ text?: string }>;
    };
    const translated: Record<string, string> = {};
    (data.translations ?? []).forEach((t, i) => {
      if (keys[i]) translated[keys[i]] = t.text ?? "";
    });
    return NextResponse.json({ translated });
  }

  return NextResponse.json({ error: "Missing text or texts" }, { status: 400 });
}
