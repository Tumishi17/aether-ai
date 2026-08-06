import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { BotMessageSquare, Copy, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/aura-logo.png";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/layout/page-header";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { copyToClipboard } from "@/lib/use-ai-feature";
import { clearMessages, loadMessages, saveMessage } from "@/lib/chat-store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chatbot — Aura Assist" },
      {
        name: "description",
        content:
          "Chat with Aura about drafting, planning, meetings and workplace problems, with your conversation saved securely.",
      },
      { property: "og:title", content: "AI Workplace Chatbot — Aura Assist" },
      {
        property: "og:description",
        content: "A conversational AI colleague for everyday workplace tasks.",
      },
    ],
  }),
  component: Assistant,
});

const suggestions = [
  "Draft a polite follow-up to a client who hasn't replied in a week",
  "Help me prepare an agenda for a 30-minute project kickoff",
  "Rewrite this update so it sounds more confident",
  "What should I prioritise if I only have three focused hours today?",
];

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

function timeOf(message: UIMessage) {
  const created = (message.metadata as { createdAt?: string } | undefined)?.createdAt;
  const date = created ? new Date(created) : new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Assistant() {
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);

  useEffect(() => {
    let active = true;
    void loadMessages().then((messages) => {
      if (!active) return;
      setInitialMessages(messages);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      {initialMessages ? (
        <ChatPanel initialMessages={initialMessages} />
      ) : (
        <>
          <PageHeader
            icon={BotMessageSquare}
            eyebrow="Assistant"
            title="AI Workplace Chatbot"
            description="Ask Aura anything about your work — your conversation is saved to your workspace."
          />
          <Card className="glass-panel">
            <CardContent className="flex h-[62vh] min-h-[420px] items-center justify-center">
              <Shimmer className="text-sm">Loading your conversation…</Shimmer>
            </CardContent>
          </Card>
        </>
      )}
      <AiDisclaimer />
    </div>
  );
}

function ChatPanel({ initialMessages }: { initialMessages: UIMessage[] }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedIds = useRef(new Set<string>(initialMessages.map((message) => message.id)));

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "aura-workplace-conversation",
    transport,
    messages: initialMessages,
    onError: (error) =>
      toast.error("The assistant could not reply", {
        description: error.message || "Please try again in a moment.",
      }),
    onFinish: ({ message }) => {
      if (savedIds.current.has(message.id)) return;
      savedIds.current.add(message.id);
      void saveMessage("assistant", textOf(message));
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  const focusInput = useCallback(() => textareaRef.current?.focus(), []);

  useEffect(() => {
    if (!isBusy) focusInput();
  }, [isBusy, focusInput]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy) return;
      void saveMessage("user", trimmed);
      void sendMessage({ text: trimmed });
      setInput("");
      focusInput();
    },
    [isBusy, sendMessage, focusInput],
  );

  const handleSubmit = (message: PromptInputMessage) => {
    send(message.text ?? input);
  };

  const clearConversation = async () => {
    setMessages([]);
    savedIds.current.clear();
    await clearMessages();
    toast.success("Conversation cleared");
    focusInput();
  };

  return (
    <>
      <PageHeader
        icon={BotMessageSquare}
        eyebrow="Assistant"
        title="AI Workplace Chatbot"
        description="Ask Aura anything about your work — your conversation is saved to your workspace."
        actions={
          <Button variant="outline" onClick={() => void clearConversation()} disabled={isBusy}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear conversation
          </Button>
        }
      />

      <Card className="glass-panel animate-rise overflow-hidden p-0">
        <CardContent className="flex h-[62vh] min-h-[420px] flex-col gap-3 p-3 sm:p-4">
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="gap-4">
              {messages.length === 0 ? (
                <ConversationEmptyState>
                  <img
                    src={logo}
                    alt="Aura Assist"
                    width={512}
                    height={512}
                    className="h-12 w-12 rounded-xl"
                  />
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold">How can I help you work today?</h2>
                    <p className="text-sm text-muted-foreground">
                      Pick a starting point or type your own question.
                    </p>
                  </div>
                  <div className="mt-2 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => send(suggestion)}
                        className="rounded-xl border border-border/70 bg-card/50 px-3 py-2.5 text-left text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((message) => {
                  const text = textOf(message);
                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        <MessageResponse>{text}</MessageResponse>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] opacity-60">
                          <span>{timeOf(message)}</span>
                          {message.role === "assistant" && text ? (
                            <button
                              type="button"
                              onClick={() => void copyToClipboard(text)}
                              className="inline-flex items-center gap-1 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                              aria-label="Copy reply"
                            >
                              <Copy className="h-3 w-3" aria-hidden="true" />
                              Copy
                            </button>
                          ) : null}
                        </div>
                      </MessageContent>
                    </Message>
                  );
                })
              )}
              {status === "submitted" ? (
                <Shimmer className="text-sm" aria-live="polite">
                  Aura is thinking…
                </Shimmer>
              ) : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Aura to draft, plan, summarize or explain…"
              autoFocus
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={isBusy || input.trim().length === 0} />
            </PromptInputFooter>
          </PromptInput>
        </CardContent>
      </Card>
    </>
  );
}