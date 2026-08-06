import type { UIMessage } from "ai";

import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "aura-chat-session-id";

function sessionId() {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function loadMessages(): Promise<UIMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("session_id", sessionId())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load conversation", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    metadata: { createdAt: row.created_at },
    parts: [{ type: "text" as const, text: row.content }],
  }));
}

export async function saveMessage(role: "user" | "assistant", content: string) {
  if (!content.trim()) return;
  const { error } = await supabase
    .from("chat_messages")
    .insert({ session_id: sessionId(), role, content });
  if (error) console.error("Failed to save message", error);
}

export async function clearMessages() {
  const { error } = await supabase.from("chat_messages").delete().eq("session_id", sessionId());
  if (error) console.error("Failed to clear conversation", error);
}