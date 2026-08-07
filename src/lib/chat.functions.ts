import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const sessionSchema = z.object({
  sessionId: z.string().uuid(),
});

const saveSchema = sessionSchema.extend({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(20000),
});

export const fetchChatMessages = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) {
      console.error("Failed to load conversation", error);
      throw new Error("Could not load conversation");
    }

    return rows ?? [];
  });

export const saveChatMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("chat_messages").insert({
      session_id: data.sessionId,
      role: data.role,
      content: data.content,
    });

    if (error) {
      console.error("Failed to save message", error);
      throw new Error("Could not save message");
    }

    return { ok: true };
  });

export const clearChatMessages = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("chat_messages")
      .delete()
      .eq("session_id", data.sessionId);

    if (error) {
      console.error("Failed to clear conversation", error);
      throw new Error("Could not clear conversation");
    }

    return { ok: true };
  });
