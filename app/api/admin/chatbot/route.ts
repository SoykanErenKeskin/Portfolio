import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/db/supabase";
import { DEFAULT_CHATBOT_PROMPT } from "@/lib/chatbot-default-prompt";
import { DEFAULT_CHATBOT_RULES } from "@/lib/chat/build-prompt";
import { getDefaultProfileData } from "@/lib/chat/context";

export const dynamic = "force-dynamic";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const { data: row } = await supabase
    .from("chatbot_prompt")
    .select("system_prompt, rules, chatbot_data")
    .limit(1)
    .single();

  const systemPrompt = row?.system_prompt?.trim() || DEFAULT_CHATBOT_PROMPT;
  const rules = row?.rules?.trim() || DEFAULT_CHATBOT_RULES;
  const chatbotData = row?.chatbot_data?.trim() || getDefaultProfileData();

  return NextResponse.json({
    systemPrompt,
    rules,
    chatbotData,
    defaultSystemPrompt: DEFAULT_CHATBOT_PROMPT,
    defaultRules: DEFAULT_CHATBOT_RULES,
    defaultChatbotData: getDefaultProfileData(),
  });
}

export async function PUT(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as {
    systemPrompt?: string;
    rules?: string;
    chatbotData?: string;
  };
  const systemPrompt =
    typeof data.systemPrompt === "string" ? data.systemPrompt : "";
  const rules = typeof data.rules === "string" ? data.rules : null;
  const chatbotData =
    typeof data.chatbotData === "string" ? data.chatbotData : null;

  const { data: existing } = await supabase
    .from("chatbot_prompt")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    const { data: row, error } = await supabase
      .from("chatbot_prompt")
      .update({
        system_prompt: systemPrompt,
        rules: rules,
        chatbot_data: chatbotData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(row);
  }

  const { data: row, error } = await supabase
    .from("chatbot_prompt")
    .insert({ system_prompt: systemPrompt, rules, chatbot_data: chatbotData })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(row);
}

/** Varsayılanları yükleyip DB'ye kaydeder – tek tıkla sıfırlama */
export async function POST() {
  const err = await requireAdmin();
  if (err) return err;

  const systemPrompt = DEFAULT_CHATBOT_PROMPT;
  const rules = DEFAULT_CHATBOT_RULES;
  const chatbotData = getDefaultProfileData();

  const { data: existing } = await supabase
    .from("chatbot_prompt")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    const { data: row, error } = await supabase
      .from("chatbot_prompt")
      .update({
        system_prompt: systemPrompt,
        rules,
        chatbot_data: chatbotData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ...row });
  }

  const { data: row, error } = await supabase
    .from("chatbot_prompt")
    .insert({ system_prompt: systemPrompt, rules, chatbot_data: chatbotData })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ...row });
}
