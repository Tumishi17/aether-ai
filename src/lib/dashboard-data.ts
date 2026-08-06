export const kpis = [
  {
    key: "emails",
    label: "Emails Generated",
    value: 428,
    delta: "+12.4%",
    trend: "up" as const,
    progress: 86,
    hint: "Drafts created with the Smart Email Generator this month",
  },
  {
    key: "tasks",
    label: "Tasks Completed",
    value: 1264,
    delta: "+8.1%",
    trend: "up" as const,
    progress: 74,
    hint: "Tasks closed across all AI-generated plans",
  },
  {
    key: "meetings",
    label: "Meetings Summarized",
    value: 96,
    delta: "+21.7%",
    trend: "up" as const,
    progress: 62,
    hint: "Meeting notes turned into decision records",
  },
  {
    key: "research",
    label: "Research Requests",
    value: 187,
    delta: "+4.6%",
    trend: "up" as const,
    progress: 55,
    hint: "Briefs produced by the Research Assistant",
  },
  {
    key: "conversations",
    label: "AI Conversations",
    value: 742,
    delta: "-2.3%",
    trend: "down" as const,
    progress: 48,
    hint: "Chat sessions with the workplace assistant",
  },
  {
    key: "score",
    label: "Productivity Score",
    value: 92,
    suffix: "/100",
    delta: "+5.0 pts",
    trend: "up" as const,
    progress: 92,
    hint: "Composite of throughput, focus time and follow-through",
  },
];

export const weeklyPerformance = [
  { day: "Mon", emails: 42, tasks: 68, meetings: 6 },
  { day: "Tue", emails: 58, tasks: 82, meetings: 9 },
  { day: "Wed", emails: 71, tasks: 96, meetings: 12 },
  { day: "Thu", emails: 64, tasks: 88, meetings: 8 },
  { day: "Fri", emails: 82, tasks: 104, meetings: 11 },
  { day: "Sat", emails: 24, tasks: 31, meetings: 2 },
  { day: "Sun", emails: 16, tasks: 22, meetings: 1 },
];

export const focusBreakdown = [
  { label: "Deep work", value: 46 },
  { label: "Meetings", value: 24 },
  { label: "Communication", value: 18 },
  { label: "Admin", value: 12 },
];

export const activity = [
  {
    title: "Client renewal email drafted",
    detail: "Persuasive tone · Client audience · 148 words",
    time: "8 minutes ago",
    tag: "Email",
  },
  {
    title: "Q3 roadmap sync summarized",
    detail: "5 decisions · 7 action items · 2 risks flagged",
    time: "42 minutes ago",
    tag: "Meeting",
  },
  {
    title: "Weekly plan rebalanced",
    detail: "3 deep-work blocks protected, 2 tasks delegated",
    time: "2 hours ago",
    tag: "Planner",
  },
  {
    title: "Vendor consolidation brief",
    detail: "Confidence 78% · 4 recommendations",
    time: "Yesterday",
    tag: "Research",
  },
  {
    title: "Assistant session on performance reviews",
    detail: "12 messages · 3 templates generated",
    time: "Yesterday",
    tag: "Chat",
  },
];