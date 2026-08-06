import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Eraser, LayoutGrid, Lightbulb, ListTodo, Sparkle, Timer } from "lucide-react";
import { useState } from "react";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAiFeature } from "@/lib/use-ai-feature";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Aura Assist" },
      {
        name: "description",
        content:
          "Turn a raw task list into a daily schedule, weekly planner, priority matrix and time-blocking plan.",
      },
      { property: "og:title", content: "AI Task Planner — Aura Assist" },
      {
        property: "og:description",
        content: "Realistic AI scheduling with priorities and protected focus time.",
      },
    ],
  }),
  component: TaskPlanner,
});

type Plan = {
  overview: string;
  daily_schedule: { time: string; task: string; focus: string }[];
  weekly_planner: { day: string; theme: string; tasks: string[] }[];
  priority_matrix: {
    do_first: string[];
    schedule: string[];
    delegate: string[];
    eliminate: string[];
  };
  time_blocking_tips: string[];
  productivity_tips: string[];
};

const focusStyles: Record<string, string> = {
  "Deep work": "bg-primary/15 text-primary",
  "Shallow work": "bg-accent text-accent-foreground",
  Meeting: "bg-warning/20 text-foreground",
  Break: "bg-success/15 text-success",
};

const quadrants = [
  { key: "do_first", label: "Do first", hint: "Urgent + important" },
  { key: "schedule", label: "Schedule", hint: "Important, not urgent" },
  { key: "delegate", label: "Delegate", hint: "Urgent, not important" },
  { key: "eliminate", label: "Eliminate", hint: "Neither" },
] as const;

function TaskPlanner() {
  const [tasks, setTasks] = useState("");
  const [workingHours, setWorkingHours] = useState("09:00-17:30");
  const [touched, setTouched] = useState(false);
  const { result, isLoading, run, reset } = useAiFeature<Plan>("planner");
  const invalid = tasks.trim().length < 10;

  const plan = () => {
    setTouched(true);
    if (invalid) return;
    void run({ tasks, workingHours });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ListTodo}
        eyebrow="Planning"
        title="AI Task Planner"
        description="One task per line with deadline, priority and estimated duration."
      />

      <Card className="glass-panel animate-rise">
        <CardHeader>
          <CardTitle>Your tasks</CardTitle>
          <CardDescription>
            Example: “Finish Q3 report — due Thu — high — 3h”
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tasks">Task list</Label>
            <Textarea
              id="tasks"
              rows={8}
              maxLength={8000}
              value={tasks}
              onChange={(event) => setTasks(event.target.value)}
              placeholder={"Finish Q3 report — due Thu — high — 3h\nPrep client demo — due Fri — medium — 2h"}
              aria-invalid={touched && invalid}
              aria-describedby="tasks-help"
            />
            <p
              id="tasks-help"
              className={`text-xs ${touched && invalid ? "text-destructive" : "text-muted-foreground"}`}
            >
              {touched && invalid
                ? "Add at least one task to plan."
                : `${tasks.length}/8000 characters`}
            </p>
          </div>
          <div className="grid gap-4 sm:max-w-xs">
            <div className="space-y-2">
              <Label htmlFor="hours">Working hours</Label>
              <Input
                id="hours"
                value={workingHours}
                onChange={(event) => setWorkingHours(event.target.value)}
                maxLength={60}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={plan} disabled={isLoading} className="shadow-glow">
              <Sparkle className="h-4 w-4" aria-hidden="true" />
              {isLoading ? "Building plan…" : "Build my plan"}
            </Button>
            <Button
              variant="ghost"
              disabled={isLoading}
              onClick={() => {
                setTasks("");
                setTouched(false);
                reset();
              }}
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          </div>
          <AiDisclaimer />
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="glass-panel" aria-live="polite">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : result ? (
        <div className="space-y-4">
          <Card className="glass-panel animate-rise">
            <CardHeader>
              <CardTitle>Plan overview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">{result.overview}</CardContent>
          </Card>

          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">
                <Timer className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <CalendarRange className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="matrix">
                <LayoutGrid className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Priorities
              </TabsTrigger>
              <TabsTrigger value="tips">
                <Lightbulb className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Tips
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-4">
              <ol className="space-y-2">
                {result.daily_schedule.map((slot) => (
                  <li
                    key={`${slot.time}-${slot.task}`}
                    className="glass-panel grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {slot.time}
                    </span>
                    <span className="min-w-0 text-sm font-medium">{slot.task}</span>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 ${focusStyles[slot.focus] ?? "bg-accent"}`}
                    >
                      {slot.focus}
                    </Badge>
                  </li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="weekly" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {result.weekly_planner.map((day) => (
                  <Card
                    key={day.day}
                    className="glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{day.day}</CardTitle>
                      <CardDescription>{day.theme}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {day.tasks.map((task) => (
                        <p
                          key={task}
                          className="rounded-lg border border-border/60 bg-card/50 px-2.5 py-2 text-xs"
                        >
                          {task}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="matrix" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {quadrants.map((quadrant) => (
                  <Card key={quadrant.key} className="glass-panel">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{quadrant.label}</CardTitle>
                      <CardDescription>{quadrant.hint}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {result.priority_matrix[quadrant.key].length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nothing here.</p>
                      ) : (
                        <ul className="space-y-1.5 text-sm">
                          {result.priority_matrix[quadrant.key].map((item) => (
                            <li key={item} className="flex gap-2">
                              <span
                                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                              <span className="min-w-0">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tips" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="glass-panel">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Time blocking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {result.time_blocking_tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="glass-panel">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Productivity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {result.productivity_tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card className="glass-panel">
          <CardContent className="py-12 text-center">
            <ListTodo className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">No plan yet</p>
            <p className="text-xs text-muted-foreground">
              Add your tasks above and Aura will schedule them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}