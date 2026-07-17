import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Blocks,
  Boxes,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Cpu,
  DollarSign,
  FileText,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Lightbulb,
  MessageSquare,
  Send,
  Shield,
  Sparkles,
  Terminal,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  aiCommandExamples,
  aiDashboard,
  aiSuggestions,
  costBreakdown,
  idleResources,
  incidents,
  performanceSeries,
  pullRequests,
  repoHealth,
  type AiSuggestion,
} from "@/lib/ai-mock";
import { openAiChat } from "@/lib/ai-chat-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI Insights · InsightFlow" },
      {
        name: "description",
        content:
          "Ask InsightFlow AI. Repository health, deployment risk, incident analysis, cost optimization and live performance predictions in one place.",
      },
    ],
  }),
  component: AIInsightsPage,
});

function AIInsightsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="AI Insights"
        description="A single control room for models, predictions, incidents and cost — powered by InsightFlow AI."
        actions={
          <Button
            onClick={() => openAiChat()}
            className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Ask InsightFlow AI
          </Button>
        }
      />

      <HeroAndCommand />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RepositoryHealthWidget />
        <DeploymentRiskWidget />
        <AiDashboardWidget />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AiSuggestionsWidget />
        </div>
        <div className="lg:col-span-2">
          <IncidentAnalyzerWidget />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PerformanceInsightsWidget />
        </div>
        <div className="lg:col-span-2">
          <CostOptimizerWidget />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PullRequestReviewWidget />
        </div>
        <div className="lg:col-span-2">
          <CommitSummaryWidget />
        </div>
      </section>
    </div>
  );
}

/* ---------------- Hero + AI command palette ---------------- */

function HeroAndCommand() {
  const [q, setQ] = useState("");
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" />
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-primary opacity-30 blur-3xl"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="hidden h-24 w-24 place-items-center rounded-3xl bg-gradient-primary shadow-glow lg:grid"
        >
          <Sparkles className="h-10 w-10 text-primary-foreground" />
        </motion.div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-widest text-primary/80">
            AI command bar
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Type a command in plain English —{" "}
            <span className="text-gradient">we&apos;ll do the rest</span>
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              openAiChat(q || "Analyze insight-core repository health");
            }}
            className="mt-4 flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Terminal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="e.g. Deploy edge-runtime to staging"
                className="h-11 rounded-xl border-border/70 bg-background/60 pl-9 pr-24 text-sm shadow-soft backdrop-blur-xl focus-visible:ring-primary/40"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/60 bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </div>
            <Button
              type="submit"
              className="h-11 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
            >
              <Send className="mr-2 h-4 w-4" /> Run
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {aiCommandExamples.map((c) => (
              <button
                key={c}
                onClick={() => openAiChat(c)}
                className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ---------------- Repository Health ---------------- */

function AnimatedScore({ value }: { value: number }) {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative grid place-items-center">
      <svg width={112} height={112} viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={radius} stroke="var(--color-border)" strokeWidth={8} fill="none" />
        <defs>
          <linearGradient id="scoreGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" />
            <stop offset="100%" stopColor="var(--color-chart-5)" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="56"
          cy="56"
          r={radius}
          stroke="url(#scoreGrad)"
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute grid place-items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-semibold tabular-nums"
        >
          {value}
        </motion.div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">/100</div>
      </div>
    </div>
  );
}

function RepositoryHealthWidget() {
  const [active, setActive] = useState(repoHealth[0]);
  return (
    <SectionCard title="Repository health" description="Continuously scored by InsightFlow AI">
      <div className="flex items-center gap-5">
        <AnimatedScore value={active.score} />
        <div className="min-w-0 flex-1 space-y-2">
          {[
            { k: "Coverage", v: active.coverage },
            { k: "Security", v: active.security },
            { k: "Churn", v: 100 - active.churn, raw: active.churn },
          ].map((row) => (
            <div key={row.k}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{row.k}</span>
                <span className="font-medium tabular-nums">{row.raw ?? row.v}%</span>
              </div>
              <Progress value={row.v} className="mt-1 h-1.5" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {repoHealth.map((r) => (
          <button
            key={r.repo}
            onClick={() => setActive(r)}
            className={cn(
              "group rounded-xl border p-2 text-left text-[11px] transition-all",
              active.repo === r.repo
                ? "border-primary/60 bg-primary/5 shadow-glow"
                : "border-border/60 bg-card hover:border-border",
            )}
          >
            <div className="flex items-center gap-1.5 truncate font-medium">
              <GitBranch className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{r.repo}</span>
            </div>
            <div
              className={cn(
                "mt-1 text-lg font-semibold tabular-nums",
                r.score >= 90 ? "text-success" : r.score >= 80 ? "text-info" : "text-warning",
              )}
            >
              {r.score}
            </div>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

/* ---------------- Deployment Risk ---------------- */

function DeploymentRiskWidget() {
  const risk = 28; // 0-100
  const zone = risk < 33 ? "Safe" : risk < 66 ? "Medium" : "Critical";
  const color = risk < 33 ? "var(--color-success)" : risk < 66 ? "var(--color-warning)" : "var(--color-destructive)";
  return (
    <SectionCard title="Deployment risk" description="Next production release · insight-core">
      <div className="relative mx-auto mt-2 h-32 w-full max-w-[280px]">
        <svg viewBox="0 0 200 110" className="h-full w-full">
          <defs>
            <linearGradient id="riskGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--color-success)" />
              <stop offset="50%" stopColor="var(--color-warning)" />
              <stop offset="100%" stopColor="var(--color-destructive)" />
            </linearGradient>
          </defs>
          <path d="M20 100 A80 80 0 0 1 180 100" stroke="var(--color-border)" strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M20 100 A80 80 0 0 1 180 100" stroke="url(#riskGrad)" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.9} />
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: -90 + (risk / 100) * 180 }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ transformOrigin: "100px 100px" }}
          >
            <line x1="100" y1="100" x2="100" y2="34" stroke={color} strokeWidth={3} strokeLinecap="round" />
            <circle cx="100" cy="100" r="6" fill={color} />
          </motion.g>
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <div className="text-3xl font-semibold tabular-nums">{risk}</div>
          <div className="text-[11px] uppercase tracking-widest" style={{ color }}>
            {zone}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        {[
          { k: "Est. time", v: "6m 40s" },
          { k: "Downtime", v: "~0s" },
          { k: "Rollback", v: "Auto" },
        ].map((row) => (
          <div key={row.k} className="rounded-xl border border-border/60 bg-gradient-subtle p-2 text-center">
            <div className="text-muted-foreground">{row.k}</div>
            <div className="mt-0.5 text-sm font-semibold">{row.v}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ---------------- AI Dashboard ---------------- */

function AiDashboardWidget() {
  const items = [
    { k: "Models", v: aiDashboard.models, icon: Brain, tone: "from-violet-500 to-fuchsia-500" },
    { k: "Inference/day", v: aiDashboard.inference.toLocaleString(), icon: Cpu, tone: "from-sky-500 to-indigo-500" },
    { k: "Cache hit", v: `${aiDashboard.cacheHit}%`, icon: Zap, tone: "from-emerald-500 to-teal-500" },
    { k: "Confidence", v: `${aiDashboard.confidence}%`, icon: Sparkles, tone: "from-rose-500 to-orange-500" },
  ];
  return (
    <SectionCard title="AI dashboard" description="Live model & inference telemetry">
      <div className="grid grid-cols-2 gap-2">
        {items.map((it, i) => (
          <motion.div
            key={it.k}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-3"
          >
            <div className={cn("mb-2 grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br text-white shadow-soft", it.tone)}>
              <it.icon className="h-4 w-4" />
            </div>
            <div className="text-[11px] text-muted-foreground">{it.k}</div>
            <div className="mt-0.5 text-base font-semibold tabular-nums">{it.v}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-border/60 bg-gradient-subtle p-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Token usage · this month</span>
          <span className="font-medium text-foreground">
            {(aiDashboard.tokens / 1_000_000).toFixed(1)}M / 120M
          </span>
        </div>
        <Progress value={(aiDashboard.tokens / 120_000_000) * 100} className="mt-2 h-1.5" />
      </div>
    </SectionCard>
  );
}

/* ---------------- AI Suggestions ---------------- */

const categoryStyles: Record<AiSuggestion["category"], { label: string; className: string; Icon: typeof Zap }> = {
  performance: { label: "Performance", className: "bg-sky-500/10 text-info", Icon: Zap },
  security: { label: "Security", className: "bg-destructive/10 text-destructive", Icon: Shield },
  cost: { label: "Cost", className: "bg-emerald-500/10 text-success", Icon: DollarSign },
  reliability: { label: "Reliability", className: "bg-amber-500/10 text-warning-foreground", Icon: Boxes },
  devx: { label: "DevX", className: "bg-primary/10 text-primary", Icon: Blocks },
};

function AiSuggestionsWidget() {
  const [applied, setApplied] = useState<Set<string>>(new Set());
  return (
    <SectionCard
      title="AI suggestions"
      description="Ranked by projected impact"
      actions={<span className="text-[11px] text-muted-foreground">{aiSuggestions.length} active</span>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {aiSuggestions.map((s, i) => {
          const cat = categoryStyles[s.category];
          const isApplied = applied.has(s.id);
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-2">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", cat.className)}>
                  <cat.Icon className="h-3 w-3" /> {cat.label}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    s.impact === "high" ? "bg-destructive/10 text-destructive" : s.impact === "medium" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {s.impact}
                </span>
              </div>
              <div className="mt-2 text-sm font-semibold leading-snug">{s.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.detail}</div>
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" /> {s.confidence}% · {s.eta}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openAiChat(`Explain: ${s.title}`)}
                    className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Explain
                  </button>
                  <button
                    onClick={() => setApplied((set) => new Set(set).add(s.id))}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors",
                      isApplied
                        ? "bg-success/15 text-success"
                        : "bg-primary/10 text-primary hover:bg-primary/15",
                    )}
                  >
                    {isApplied ? <><Check className="h-3 w-3" /> Applied</> : <><CheckCircle2 className="h-3 w-3" /> Apply</>}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ---------------- Incident Analyzer ---------------- */

function IncidentAnalyzerWidget() {
  const inc = incidents[0];
  return (
    <SectionCard title="Incident analyzer" description={`${inc.id} · ${inc.severity.toUpperCase()} · ${inc.region}`}>
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-gradient-subtle px-3 py-2">
        <div className="text-sm font-medium">{inc.title}</div>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">
          {inc.status}
        </span>
      </div>

      <ol className="relative mt-4 space-y-3 pl-6">
        <span className="absolute bottom-1 left-2 top-1 w-px bg-gradient-to-b from-primary/50 via-border to-transparent" />
        {inc.timeline.map((t, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative"
          >
            <div
              className={cn(
                "absolute -left-6 top-1 grid h-4 w-4 place-items-center rounded-full bg-card ring-2",
                t.kind === "alert" ? "ring-destructive" : t.kind === "ok" ? "ring-success" : "ring-primary",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  t.kind === "alert" ? "bg-destructive" : t.kind === "ok" ? "bg-success" : "bg-primary",
                )}
              />
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-mono text-muted-foreground">{t.at}</span>
              <span className="text-foreground/90">{t.event}</span>
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="mt-4 space-y-2 rounded-xl border border-border/60 bg-card p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <Lightbulb className="h-3 w-3" /> Root cause · {inc.confidence}% confidence
        </div>
        <div className="text-xs text-foreground/90">{inc.rootCause}</div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-success">
          <CheckCircle2 className="h-3 w-3" /> Suggested fix
        </div>
        <div className="text-xs text-foreground/90">{inc.fix}</div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openAiChat(`Root cause of incident ${inc.id}`)}
          className="mt-2 h-8 w-full rounded-lg"
        >
          Ask AI for deeper analysis <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </SectionCard>
  );
}

/* ---------------- Performance Insights ---------------- */

const perfTabs = [
  { k: "latency", label: "Latency", color: "var(--color-chart-1)", unit: "ms" },
  { k: "memory", label: "Memory", color: "var(--color-chart-2)", unit: "%" },
  { k: "cpu", label: "CPU", color: "var(--color-chart-5)", unit: "%" },
  { k: "network", label: "Network", color: "var(--color-chart-3)", unit: "MB/s" },
] as const;

function PerformanceInsightsWidget() {
  const [tab, setTab] = useState<(typeof perfTabs)[number]["k"]>("latency");
  const active = perfTabs.find((t) => t.k === tab)!;
  const values = performanceSeries.map((d) => d[tab]);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const predicted = Math.round(avg * 0.78);
  return (
    <SectionCard
      title="Performance insights"
      description="Predicted vs. actual across the last 24h"
      actions={
        <div className="flex rounded-lg border border-border/60 bg-card p-0.5">
          {perfTabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                tab === t.k ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[11px] text-muted-foreground">Current avg</div>
          <div className="text-2xl font-semibold tabular-nums">
            {avg}
            <span className="ml-1 text-sm font-normal text-muted-foreground">{active.unit}</span>
          </div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" /> AI prediction · next hour
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-sm font-semibold">
            {predicted} {active.unit}
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
              <TrendingDown className="h-3 w-3" /> −22%
            </span>
          </div>
        </div>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceSeries} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="perfGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={active.color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={active.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={3} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey={tab} stroke={active.color} strokeWidth={2} fill="url(#perfGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

/* ---------------- Cost Optimizer ---------------- */

function CostOptimizerWidget() {
  const total = costBreakdown.reduce((a, b) => a + b.value, 0);
  const savings = costBreakdown.reduce((a, b) => a + b.savings, 0);
  return (
    <SectionCard title="Cost optimizer" description="Estimated monthly spend & AI-detected savings">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/60 bg-gradient-subtle p-3">
          <div className="text-[11px] text-muted-foreground">Est. monthly spend</div>
          <div className="mt-0.5 text-xl font-semibold tabular-nums">${total.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-3">
          <div className="text-[11px] text-success">Potential savings</div>
          <div className="mt-0.5 flex items-center gap-1 text-xl font-semibold tabular-nums text-success">
            ${savings.toLocaleString()}
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={costBreakdown} dataKey="value" innerRadius={30} outerRadius={52} paddingAngle={3} strokeWidth={0}>
                {costBreakdown.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          {costBreakdown.map((c) => (
            <div key={c.name} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: c.color }} />
                <span className="text-muted-foreground">{c.name}</span>
              </div>
              <span className="tabular-nums">${c.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Idle resources
        </div>
        {idleResources.map((r) => (
          <div key={r.name} className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-2.5 py-1.5 text-[11px]">
            <div className="min-w-0">
              <div className="truncate font-medium">{r.name}</div>
              <div className="truncate text-muted-foreground">
                {r.kind} · {r.region} · {r.utilization}% util
              </div>
            </div>
            <div className="text-right font-semibold tabular-nums">${r.monthly}/mo</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ---------------- Pull Request Review ---------------- */

function PullRequestReviewWidget() {
  const [id, setId] = useState(pullRequests[0].id);
  const pr = pullRequests.find((p) => p.id === id)!;
  return (
    <SectionCard title="Pull request review" description="AI-generated summary, complexity & risk">
      <div className="flex flex-wrap gap-2">
        {pullRequests.map((p) => (
          <button
            key={p.id}
            onClick={() => setId(p.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              id === p.id
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            #{p.id.split("-")[1]} · {p.repo}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pr.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <GitPullRequest className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{pr.title}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {pr.repo} · {pr.branch} · @{pr.author.split(" ")[0].toLowerCase()}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-gradient-subtle p-3 text-xs leading-relaxed text-foreground/90">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" /> AI summary
            </div>
            {pr.summary}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Files" value={pr.files} />
            <Stat label="Additions" value={`+${pr.additions}`} tone="success" />
            <Stat label="Deletions" value={`−${pr.deletions}`} tone="destructive" />
            <Stat
              label="Complexity"
              value={pr.complexity}
              tone={pr.complexity === "high" ? "destructive" : pr.complexity === "medium" ? "warning" : "success"}
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Risk score</span>
              <span className="font-medium text-foreground">{pr.risk}/100</span>
            </div>
            <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pr.risk}%` }}
                transition={{ duration: 0.8 }}
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full",
                  pr.risk > 60 ? "bg-destructive" : pr.risk > 30 ? "bg-warning" : "bg-success",
                )}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">Suggested reviewers</span>
                <div className="flex -space-x-1.5">
                  {pr.reviewers.map((r) => (
                    <div
                      key={r}
                      className="grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-semibold text-white"
                    >
                      {r.split(" ").map((w) => w[0]).join("")}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAiChat(`Review PR ${pr.id} in ${pr.repo}`)}
                className="h-8 rounded-lg"
              >
                Ask AI to review <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </SectionCard>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "success" | "destructive" | "warning";
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-sm font-semibold capitalize tabular-nums",
          tone === "success" && "text-success",
          tone === "destructive" && "text-destructive",
          tone === "warning" && "text-warning-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------- Commit Summary ---------------- */

const rawCommits = [
  "fix login bug when refresh token expired",
  "batch inference calls on hot path",
  "update readme with streaming example",
  "add worker pool reuse benchmark",
];

const summarized = [
  { type: "fix", scope: "auth", message: "handle expired refresh tokens", raw: rawCommits[0] },
  { type: "feat", scope: "inference", message: "dynamic batching on hot path", raw: rawCommits[1] },
  { type: "docs", scope: "readme", message: "streaming API example", raw: rawCommits[2] },
  { type: "perf", scope: "edge", message: "reuse worker pool across requests", raw: rawCommits[3] },
];

const typeTone: Record<string, string> = {
  fix: "bg-destructive/10 text-destructive",
  feat: "bg-primary/10 text-primary",
  docs: "bg-info/10 text-info",
  perf: "bg-success/10 text-success",
};

function CommitSummaryWidget() {
  return (
    <SectionCard title="Commit summaries" description="Human-friendly rewrites & conventional commit suggestions">
      <div className="space-y-2">
        {summarized.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border/60 bg-card p-3"
          >
            <div className="flex items-center gap-2 text-[11px]">
              <GitCommit className="h-3 w-3 text-muted-foreground" />
              <span className={cn("rounded-md px-1.5 py-0.5 font-mono font-semibold", typeTone[c.type])}>
                {c.type}({c.scope})
              </span>
              <span className="truncate font-medium">{c.message}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono">raw</span>
              <span className="truncate">{c.raw}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => openAiChat("Generate release notes for v4.2.0")}
        className="mt-3 h-8 w-full rounded-lg"
      >
        <FileText className="mr-1.5 h-3 w-3" /> Generate release notes
        <ArrowUpRight className="ml-auto h-3 w-3" />
      </Button>
    </SectionCard>
  );
}
