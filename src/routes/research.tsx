import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookMarked,
  Eraser,
  Lightbulb,
  ScrollText,
  Sparkle,
  ThumbsDown,
  ThumbsUp,
  Target,
} from "lucide-react";
import { useState } from "react";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAiFeature } from "@/lib/use-ai-feature";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Aura Assist" },
      {
        name: "description",
        content:
          "Ask a business question and get a briefing with insights, recommendations, pros and cons, risks and next steps.",
      },
      { property: "og:title", content: "AI Research Assistant — Aura Assist" },
      {
        property: "og:description",
        content: "Decision-ready research briefs with confidence indicators.",
      },
    ],
  }),
  component: ResearchAssistant,
});

type Brief = {
  summary: string;
  confidence: number;
  key_insights: string[];
  recommendations: string[];
  pros: string[];
  cons: string[];
  risks: string[];
  next_steps: string[];
  source_types: string[];
};

function List({ items, icon: Icon, title }: { items: string[]; icon: typeof Target; title: string }) {
  return (
    <Card className="glass-panel animate-rise transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nothing noted.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
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
  );
}

function ResearchAssistant() {
  const [question, setQuestion] = useState("");
  const [depth, setDepth] = useState("Balanced");
  const [touched, setTouched] = useState(false);
  const { result, isLoading, run, reset } = useAiFeature<Brief>("research");
  const invalid = question.trim().length < 8;

  const research = () => {
    setTouched(true);
    if (invalid) return;
    void run({ question, depth });
  };

  const confidence = Math.max(0, Math.min(100, result?.confidence ?? 0));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ScrollText}
        eyebrow="Research"
        title="AI Research Assistant"
        description="Ask a workplace or market question and get a structured brief."
      />

      <Card className="glass-panel animate-rise">
        <CardHeader>
          <CardTitle>Research question</CardTitle>
          <CardDescription>
            Aura has no live web access, so treat findings as a starting point.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              rows={4}
              maxLength={1200}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="e.g. Should a 40-person consultancy consolidate its SaaS tooling this year?"
              aria-invalid={touched && invalid}
              aria-describedby="question-help"
            />
            <p
              id="question-help"
              className={`text-xs ${touched && invalid ? "text-destructive" : "text-muted-foreground"}`}
            >
              {touched && invalid
                ? "Please write a fuller question."
                : `${question.length}/1200 characters`}
            </p>
          </div>
          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="depth">Depth</Label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger id="depth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Quick scan", "Balanced", "Deep dive"].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={research} disabled={isLoading} className="shadow-glow">
              <Sparkle className="h-4 w-4" aria-hidden="true" />
              {isLoading ? "Researching…" : "Run research"}
            </Button>
            <Button
              variant="ghost"
              disabled={isLoading}
              onClick={() => {
                setQuestion("");
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
        <div className="grid gap-4 md:grid-cols-2" aria-live="polite">
          {[0, 1, 2, 3].map((index) => (
            <Card key={index} className="glass-panel">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-9/12" />
                <Skeleton className="h-4 w-7/12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : result ? (
        <div className="space-y-4">
          <Card className="glass-panel animate-rise">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Confidence indicator based on how well established the evidence is</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <p>{result.summary}</p>
              <div className="max-w-sm space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Confidence</span>
                  <span className="font-semibold text-foreground">{confidence}%</span>
                </div>
                <Progress value={confidence} aria-label="Confidence level" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.source_types.map((source) => (
                  <Badge key={source} variant="outline" className="gap-1 text-[11px]">
                    <BookMarked className="h-3 w-3" aria-hidden="true" />
                    {source}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <List items={result.key_insights} icon={Lightbulb} title="Key insights" />
            <List items={result.recommendations} icon={Target} title="Recommendations" />
            <List items={result.pros} icon={ThumbsUp} title="Pros" />
            <List items={result.cons} icon={ThumbsDown} title="Cons" />
            <List items={result.risks} icon={AlertTriangle} title="Risks" />
            <List items={result.next_steps} icon={ScrollText} title="Next steps" />
          </div>
        </div>
      ) : (
        <Card className="glass-panel">
          <CardContent className="py-12 text-center">
            <ScrollText className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">No brief yet</p>
            <p className="text-xs text-muted-foreground">
              Ask a question above to generate your first research brief.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}