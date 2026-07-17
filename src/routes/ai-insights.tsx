import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Shield, TrendingUp, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/page-header";
import { aiInsights } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI Insights · InsightFlow" },
      { name: "description", content: "AI-powered recommendations, model accuracy, drift detection and risk analysis." },
    ],
  }),
  component: AIInsightsPage,
});

function AIInsightsPage() {
  const stats = [
    { label: "Model accuracy", value: `${aiInsights.accuracy}%`, icon: Brain, tone: "from-violet-500 to-fuchsia-500" },
    { label: "Prediction confidence", value: `${aiInsights.confidence}%`, icon: TrendingUp, tone: "from-sky-500 to-indigo-500" },
    { label: "Detected issues", value: String(aiInsights.detected), icon: Zap, tone: "from-amber-500 to-rose-500" },
    { label: "Risk level", value: aiInsights.risk, icon: Shield, tone: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="AI Insights"
        description="Continuously trained recommendations across your platform, models and infrastructure."
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row">
          <motion.div
            animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gradient-primary shadow-glow"
          >
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="text-xs font-medium uppercase tracking-widest text-primary/80">
              Insight assistant
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your platform is running <span className="text-gradient">calm and confident</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              4 new recommendations · 2 mark as high impact. Enabling request batching alone would reduce inference cost by an estimated 34%.
            </p>
          </div>
        </div>
      </motion.div>

      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft card-hover"
          >
            <div
              className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.tone} text-white shadow-soft`}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</div>
          </motion.div>
        ))}
      </section>

      <SectionCard
        title="Recent recommendations"
        description="Sorted by projected impact on cost and reliability"
      >
        <ol className="relative space-y-4 pl-6">
          <span className="absolute bottom-2 left-2 top-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
          {aiInsights.recommendations.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative"
            >
              <div className="absolute -left-6 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-card ring-2 ring-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-gradient-subtle p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        r.impact === "high"
                          ? "bg-destructive/10 text-destructive"
                          : r.impact === "medium"
                            ? "bg-warning/15 text-warning-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.impact} impact
                    </span>
                    <span className="text-[11px] text-muted-foreground">{r.time}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium">{r.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{r.detail}</div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-52">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Confidence</span>
                    <span className="font-medium text-foreground">{r.confidence}%</span>
                  </div>
                  <Progress value={r.confidence} className="h-1.5" />
                  <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary/10 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/15">
                    <CheckCircle2 className="h-3 w-3" /> Apply
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}