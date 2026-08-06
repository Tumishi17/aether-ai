import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BarChart3,
  BotMessageSquare,
  CalendarCheck,
  ListTodo,
  Mail,
  ScrollText,
  Sparkle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { activity, focusBreakdown, kpis, weeklyPerformance } from "@/lib/dashboard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aura Assist Workplace AI" },
      {
        name: "description",
        content:
          "Track emails generated, tasks completed, meetings summarized and your productivity score in one AI workspace.",
      },
      { property: "og:title", content: "Dashboard — Aura Assist Workplace AI" },
      {
        property: "og:description",
        content: "Track emails generated, tasks completed, meetings summarized and your productivity score in one AI workspace.",
      },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { title: "Draft an email", to: "/email", icon: Mail, blurb: "Tone, audience and length aware" },
  {
    title: "Summarize a meeting",
    to: "/meetings",
    icon: CalendarCheck,
    blurb: "Decisions and action items",
  },
  { title: "Plan my week", to: "/planner", icon: ListTodo, blurb: "Time blocks and priorities" },
  { title: "Research a topic", to: "/research", icon: ScrollText, blurb: "Briefs with confidence" },
  {
    title: "Ask the assistant",
    to: "/assistant",
    icon: BotMessageSquare,
    blurb: "Conversational help",
  },
] as const;

const chartConfig = {
  emails: { label: "Emails", color: "var(--chart-1)" },
  tasks: { label: "Tasks", color: "var(--chart-2)" },
  meetings: { label: "Meetings", color: "var(--chart-3)" },
  value: { label: "Share of week", color: "var(--chart-4)" },
} as const;

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        eyebrow="Workspace overview"
        title="Good to see you, Alex"
        description="Here is how AI moved your work forward this week."
        actions={
          <Button asChild variant="default" className="shadow-glow">
            <Link to="/assistant">
              <Sparkle className="h-4 w-4" aria-hidden="true" />
              Ask Aura
            </Link>
          </Button>
        }
      />

      <section aria-label="Key performance indicators">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi, index) => {
            const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;
            return (
              <li key={kpi.key} className="animate-rise" style={{ animationDelay: `${index * 45}ms` }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="glass-panel h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                      <CardHeader className="gap-1 pb-2">
                        <CardDescription className="text-xs font-medium uppercase tracking-[0.1em]">
                          {kpi.label}
                        </CardDescription>
                        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
                          <CardTitle className="font-display text-3xl">
                            {kpi.value.toLocaleString()}
                            {kpi.suffix ? (
                              <span className="text-base text-muted-foreground">{kpi.suffix}</span>
                            ) : null}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={
                              kpi.trend === "up"
                                ? "gap-1 bg-success/15 text-success"
                                : "gap-1 bg-destructive/15 text-destructive"
                            }
                          >
                            <TrendIcon className="h-3 w-3" aria-hidden="true" />
                            {kpi.delta}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Progress value={kpi.progress} aria-label={`${kpi.label} progress`} />
                        <p className="mt-2 text-xs text-muted-foreground">vs. monthly target</p>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>{kpi.hint}</TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="glass-panel animate-rise">
          <CardHeader>
            <CardTitle>Weekly performance</CardTitle>
            <CardDescription>AI-assisted output across the last seven days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={weeklyPerformance} margin={{ left: 4, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillEmails" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-emails)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--color-emails)" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="fillTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-tasks)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-tasks)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  dataKey="tasks"
                  type="monotone"
                  stroke="var(--color-tasks)"
                  fill="url(#fillTasks)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="emails"
                  type="monotone"
                  stroke="var(--color-emails)"
                  fill="url(#fillEmails)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel animate-rise">
          <CardHeader>
            <CardTitle>Where your week went</CardTitle>
            <CardDescription>Share of tracked working time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={focusBreakdown} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} strokeOpacity={0.15} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card className="glass-panel animate-rise">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump straight into an AI workflow</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <action.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{action.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {action.blurb}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-panel animate-rise">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>The latest AI runs in your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border/70 pl-5">
              {activity.map((item) => (
                <li key={item.title} className="relative">
                  <span
                    className="gradient-surface-brand absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background"
                    aria-hidden="true"
                  />
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <p className="min-w-0 text-sm font-semibold">{item.title}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {item.tag}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80">{item.time}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <AiDisclaimer />
    </div>
  );
}
