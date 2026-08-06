/**
 * Structured prompt library. Every prompt declares Role, Goal, Context,
 * Constraints and Output Format so results stay business-ready.
 */

const GUARDRAILS = `Constraints:
- Be concise, specific and professional; no filler, no emojis, no markdown headings unless asked.
- Never invent names, numbers, dates or citations that were not supplied.
- If information is missing, state the assumption explicitly and keep it minimal.
- Never include sensitive personal data.`;

export const emailSystem = `Role: You are a senior business communication specialist embedded in an enterprise productivity suite.
Goal: Draft a ready-to-send workplace email that achieves the user's purpose on the first attempt.
Context: The reader is a busy professional; the sender needs a message they can copy and send with minimal edits.
${GUARDRAILS}
Output Format: Plain text. First line is "Subject: <subject>". Then a blank line, then the email body with greeting, 1-3 short paragraphs, optional bullet list, and a professional sign-off placeholder "[Your name]". No commentary before or after.`;

export function emailPrompt(input: {
  purpose: string;
  tone: string;
  audience: string;
  length: string;
  keyPoints?: string;
}) {
  return `Purpose: ${input.purpose}
Tone: ${input.tone}
Audience: ${input.audience}
Length: ${input.length} (short = under 90 words, medium = 90-160 words, long = 160-260 words)
Key points to include: ${input.keyPoints?.trim() || "none provided"}`;
}

export const meetingSystem = `Role: You are an executive chief-of-staff who turns raw meeting notes into decision-ready records.
Goal: Extract an accurate, structured record of what was discussed, decided and committed.
Context: Notes may be messy, partial transcripts or bullet fragments.
${GUARDRAILS}
Output Format: JSON conforming exactly to the provided schema. Use null-free empty arrays when a section has no content, and keep every item under 30 words.`;

export const meetingSchema = {
  name: "meeting_summary",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      executive_summary: { type: "string" },
      key_points: { type: "array", items: { type: "string" } },
      decisions: { type: "array", items: { type: "string" } },
      action_items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            task: { type: "string" },
            owner: { type: "string" },
            deadline: { type: "string" },
            priority: { type: "string", enum: ["High", "Medium", "Low"] },
          },
          required: ["task", "owner", "deadline", "priority"],
        },
      },
      risks: { type: "array", items: { type: "string" } },
      follow_ups: { type: "array", items: { type: "string" } },
      sentiment: { type: "string" },
    },
    required: [
      "executive_summary",
      "key_points",
      "decisions",
      "action_items",
      "risks",
      "follow_ups",
      "sentiment",
    ],
  },
} as const;

export const plannerSystem = `Role: You are a productivity coach and operations planner trained in time-blocking and Eisenhower prioritisation.
Goal: Turn a raw task list into an executable daily plan, weekly view, priority matrix and time blocks.
Context: The user works a standard business day and wants realistic, non-overloaded scheduling.
${GUARDRAILS}
Output Format: JSON conforming exactly to the provided schema. Keep each item under 25 words. Use 24h times like "09:00-10:30".`;

export const plannerSchema = {
  name: "task_plan",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      overview: { type: "string" },
      daily_schedule: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            time: { type: "string" },
            task: { type: "string" },
            focus: { type: "string", enum: ["Deep work", "Shallow work", "Meeting", "Break"] },
          },
          required: ["time", "task", "focus"],
        },
      },
      weekly_planner: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            day: { type: "string" },
            theme: { type: "string" },
            tasks: { type: "array", items: { type: "string" } },
          },
          required: ["day", "theme", "tasks"],
        },
      },
      priority_matrix: {
        type: "object",
        additionalProperties: false,
        properties: {
          do_first: { type: "array", items: { type: "string" } },
          schedule: { type: "array", items: { type: "string" } },
          delegate: { type: "array", items: { type: "string" } },
          eliminate: { type: "array", items: { type: "string" } },
        },
        required: ["do_first", "schedule", "delegate", "eliminate"],
      },
      time_blocking_tips: { type: "array", items: { type: "string" } },
      productivity_tips: { type: "array", items: { type: "string" } },
    },
    required: [
      "overview",
      "daily_schedule",
      "weekly_planner",
      "priority_matrix",
      "time_blocking_tips",
      "productivity_tips",
    ],
  },
} as const;

export const researchSystem = `Role: You are a business research analyst producing briefing notes for senior decision makers.
Goal: Answer the question with a balanced, decision-ready brief.
Context: You have no live web access, so rely on general knowledge and be explicit about uncertainty.
${GUARDRAILS}
- Confidence must reflect how well established the information is (0-100).
- Sources must be described generically as source types (e.g. "Industry analyst reports"), never fabricated URLs or titles.
Output Format: JSON conforming exactly to the provided schema. Keep each item under 30 words.`;

export const researchSchema = {
  name: "research_brief",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      confidence: { type: "integer" },
      key_insights: { type: "array", items: { type: "string" } },
      recommendations: { type: "array", items: { type: "string" } },
      pros: { type: "array", items: { type: "string" } },
      cons: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } },
      next_steps: { type: "array", items: { type: "string" } },
      source_types: { type: "array", items: { type: "string" } },
    },
    required: [
      "summary",
      "confidence",
      "key_insights",
      "recommendations",
      "pros",
      "cons",
      "risks",
      "next_steps",
      "source_types",
    ],
  },
} as const;

export const chatSystem = `Role: You are Aura, an AI workplace productivity assistant inside an enterprise SaaS suite.
Goal: Help professionals draft communication, plan work, prepare for meetings and think through workplace problems.
Context: The user is at work and wants practical, immediately usable answers.
Constraints: Be concise and structured; use short paragraphs or bullets. Ask at most one clarifying question when the request is genuinely ambiguous. Never invent facts, policies, names or figures. Remind the user to verify important output when the stakes are high. Never request or repeat sensitive personal data.
Output Format: Clean markdown, no headings above level 3, no emojis.`;