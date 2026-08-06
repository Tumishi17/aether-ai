import { createFileRoute } from "@tanstack/react-router";
import { Eye, Lock, ShieldCheck, TriangleAlert, UserCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — Aura Assist" },
      {
        name: "description",
        content:
          "How Aura Assist handles AI accuracy, human review, data sensitivity and transparency in the workplace.",
      },
      { property: "og:title", content: "Responsible AI — Aura Assist" },
      {
        property: "og:description",
        content: "Our commitments on accuracy, review and data handling.",
      },
    ],
  }),
  component: ResponsibleAi,
});

const principles = [
  {
    icon: TriangleAlert,
    title: "AI may produce inaccurate information",
    body: "Models generate plausible language, not verified facts. Dates, figures, names and policy details can be wrong even when the output reads confidently.",
  },
  {
    icon: UserCheck,
    title: "Verify important outputs",
    body: "Treat every draft as a first pass. Anything that reaches a client, a regulator, HR or a financial system should be reviewed by a person accountable for it.",
  },
  {
    icon: Lock,
    title: "Do not share sensitive information",
    body: "Avoid entering personal identifiers, health data, credentials, or confidential contracts. Summarize or anonymise before pasting notes.",
  },
  {
    icon: Eye,
    title: "Transparency by default",
    body: "Every AI surface in Aura is labelled, and research briefs show a confidence indicator plus the type of evidence relied on rather than fabricated citations.",
  },
];

function ResponsibleAi() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        eyebrow="Governance"
        title="Responsible AI"
        description="How to use Aura safely and keep humans accountable."
      />

      <Card className="glass-panel animate-rise border-warning/40">
        <CardContent className="py-6 text-center">
          <p className="font-display text-lg font-bold sm:text-xl">
            AI-generated content may require human review.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            This notice appears on every AI surface in the product because it applies to every
            output Aura produces.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {principles.map((principle) => (
          <Card
            key={principle.title}
            className="glass-panel animate-rise transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
          >
            <CardHeader>
              <span className="gradient-surface-brand grid h-10 w-10 place-items-center rounded-xl text-primary-foreground shadow-glow">
                <principle.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <CardTitle className="mt-2 text-base">{principle.title}</CardTitle>
              <CardDescription className="leading-relaxed">{principle.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}