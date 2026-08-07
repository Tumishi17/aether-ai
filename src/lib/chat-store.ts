import type { UIMessage } from "ai";

import { clearChatMessages, fetchChatMessages, saveChatMessage } from "@/lib/chat.functions";

const SESSION_KEY = "aura-chat-session-id";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sessionId(): string | null {
  if (typeof window === "undefined") return null;
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id || !UUID_RE.test(id)) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function loadMessages(): Promise<UIMessage[]> {
  const id = sessionId();
  if (!id) return [];
  try {
    const rows = await fetchChatMessages({ data: { sessionId: id } });
    return rows.map((row) => ({
      id: row.id,
      role: row.role === "assistant" ? ("assistant" as const) : ("user" as const),
      metadata: { createdAt: row.created_at },
      parts: [{ type: "text" as const, text: row.content }],
    }));
  } catch (error) {
    console.error("Failed to load conversation", error);
    return [];
  }
}

export async function saveMessage(role: "user" | "assistant", content: string) {
  const id = sessionId();
  if (!id || !content.trim()) return;
  try {
    await saveChatMessage({ data: { sessionId: id, role, content: content.trim().slice(0, 20000) } });
  } catch (error) {
    console.error("Failed to save message", error);
  }
}

export async function clearMessages() {
  const id = sessionId();
  if (!id) return;
  try {
    await clearChatMessages({ data: { sessionId: id } });
  } catch (error) {
    console.error("Failed to clear conversation", error);
  }
}
