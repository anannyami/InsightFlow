import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, LifeBuoy, MessageCircle, Sparkles, Search } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help · InsightFlow" },
      { name: "description", content: "Documentation, guides, and support for the InsightFlow platform." },
    ],
  }),
  component: HelpPage,
});

const shortcuts = [
  { icon: BookOpen, title: "Documentation", body: "Guides, API references and SDK examples.", tone: "from-violet-500 to-fuchsia-500" },
  { icon: Sparkles, title: "What's new", body: "The latest features and improvements.", tone: "from-sky-500 to-indigo-500" },
  { icon: MessageCircle, title: "Community", body: "Join 8,400+ engineers on Discord.", tone: "from-emerald-500 to-teal-500" },
  { icon: LifeBuoy, title: "Contact support", body: "Priority response within 2 hours.", tone: "from-amber-500 to-rose-500" },
];

const faqs = [
  { q: "How do I invite teammates to my workspace?", a: "Head to Settings → Workspace → Members. You can invite by email or share a workspace-scoped invite link." },
  { q: "Where can I find my API keys?", a: "Settings → API keys. Keys are scoped per environment and can be rotated at any time." },
  { q: "How is AI accuracy calculated?", a: "We evaluate model outputs against a rolling window of labeled samples and expose the confidence interval on the AI Insights page." },
  { q: "Can I export dashboards as reports?", a: "Yes — every dashboard has a 'Generate report' action that produces a PDF or CSV under the Reports tab." },
  { q: "What is the SLA for production deployments?", a: "99.99% uptime with automated rollback on error-rate thresholds above 1%." },
];

function HelpPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Help"
        title="How can we help?"
        description="Search the docs, browse guides, or talk to a real human."
      />

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documentation, guides, API…"
          className="h-12 rounded-2xl border-border/60 bg-card pl-11 text-sm shadow-soft"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft card-hover">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.tone} text-white shadow-soft`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold">{s.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.body}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Frequently asked" description="The 5 most common questions this week">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`}>
              <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionCard>
    </div>
  );
}