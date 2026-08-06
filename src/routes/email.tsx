import { createFileRoute } from "@tanstack/react-router";
import { Copy, Eraser, Mail, RefreshCw, Sparkle } from "lucide-react";
import { useState } from "react";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard, useAiFeature } from "@/lib/use-ai-feature";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Aura Assist" },
      {
        name: "description",
        content:
          "Generate professional workplace emails by purpose, tone, audience and length, then copy or regenerate instantly.",
      },
      { property: "og:title", content: "Smart Email Generator — Aura Assist" },
      {
        property: "og:description",
        content: "Tone- and audience-aware AI email drafting for professionals.",
      },
    ],
  }),
  component: EmailGenerator,
});

const tones = [
  "Professional",
  "Friendly",
  "Persuasive",
  "Formal",
  "Casual",
  "Apologetic",
  "Confident",
];
const audiences = ["Client", "Manager", "HR", "Team", "Supplier", "Customer"];
const lengths = ["Short", "Medium", "Long"];

function EmailGenerator() {
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("Client");
  const [length, setLength] = useState("Medium");
  const [touched, setTouched] = useState(false);

  const { result, isLoading, run, reset } = useAiFeature<string>("email");
  const invalid = purpose.trim().length < 5;

  const generate = () => {
    setTouched(true);
    if (invalid) return;
    void run({ purpose, tone, audience, length, keyPoints });
  };

  const clear = () => {
    setPurpose("");
    setKeyPoints("");
    setTouched(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Mail}
        eyebrow="Communication"
        title="Smart Email Generator"
        description="Describe the situation and Aura writes a send-ready email."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="glass-panel animate-rise">
          <CardHeader>
            <CardTitle>Brief</CardTitle>
            <CardDescription>The more context you give, the better the draft.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                placeholder="e.g. Ask a client to approve the revised project timeline before Friday"
                rows={4}
                maxLength={1200}
                aria-invalid={touched && invalid}
                aria-describedby="purpose-help"
              />
              <p
                id="purpose-help"
                className={`text-xs ${touched && invalid ? "text-destructive" : "text-muted-foreground"}`}
              >
                {touched && invalid
                  ? "Please describe the purpose in at least a few words."
                  : `${purpose.length}/1200 characters`}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger id="audience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger id="length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengths.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-points">Key points (optional)</Label>
              <Textarea
                id="key-points"
                value={keyPoints}
                onChange={(event) => setKeyPoints(event.target.value)}
                placeholder="Dates, numbers, names or anything that must appear"
                rows={3}
                maxLength={1200}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={generate} disabled={isLoading} className="shadow-glow">
                <Sparkle className="h-4 w-4" aria-hidden="true" />
                {isLoading ? "Generating…" : "Generate email"}
              </Button>
              <Button
                variant="outline"
                onClick={generate}
                disabled={isLoading || !result}
                aria-label="Regenerate email"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Regenerate
              </Button>
              <Button variant="ghost" onClick={clear} disabled={isLoading}>
                <Eraser className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel animate-rise">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <div className="min-w-0">
              <CardTitle>Draft</CardTitle>
              <CardDescription>Review before sending.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!result}
              onClick={() => result && void copyToClipboard(result)}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2" aria-live="polite">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            ) : result ? (
              <pre className="whitespace-pre-wrap rounded-xl border border-border/60 bg-card/50 p-4 text-sm leading-relaxed">
                {result}
              </pre>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-12 text-center">
                <Mail className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold">No draft yet</p>
                <p className="text-xs text-muted-foreground">
                  Fill in the brief and generate your first email.
                </p>
              </div>
            )}
            <AiDisclaimer />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}