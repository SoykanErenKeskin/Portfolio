import { supabase } from "@/lib/db/supabase";
import { DEFAULT_CHATBOT_PROMPT } from "@/lib/chatbot-default-prompt";

export type ChatbotPromptResult = {
  systemPrompt: string;
  rules: string | null;
  chatbotData: string | null;
};

/** Veritabanından chatbot system prompt, rules ve data alır */
export async function getChatbotPrompt(): Promise<ChatbotPromptResult> {
  try {
    const { data } = await supabase
      .from("chatbot_prompt")
      .select("system_prompt, rules, chatbot_data")
      .limit(1)
      .single();

    return {
      systemPrompt: data?.system_prompt?.trim() || DEFAULT_CHATBOT_PROMPT,
      rules: data?.rules?.trim() || null,
      chatbotData: data?.chatbot_data?.trim() || null,
    };
  } catch {
    return {
      systemPrompt: DEFAULT_CHATBOT_PROMPT,
      rules: null,
      chatbotData: null,
    };
  }
}

/** @deprecated Use getChatbotPrompt instead */
export async function getChatbotSystemPrompt(): Promise<string> {
  const { systemPrompt } = await getChatbotPrompt();
  return systemPrompt;
}
