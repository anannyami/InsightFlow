import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, GitCommit, Rocket, Sparkles, Zap } from "lucide-react";
import { format } from "date-fns";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader, SectionCard } from "@/components/shared/page-header";
import { metrics, trafficData, revenueData, trafficSources, deployments, aiInsights } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useExtraDeploymentCount } from "@/lib/deployment-store";
import { NewDeploymentDialog } from "@/components/deployments/new-deployment-dialog";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const today = format(new Date(), "EEEE, MMMM d");
  const [deployOpen, setDeployOpen] = useState(false);
  const extra = useExtraDeploymentCount();
  const liveMetrics = metrics.map((m) => {
    if (m.label !== "Deployments") return m;
    const newRaw = m.raw + extra;
    return { ...m, raw: newRaw, value: newRaw.toString() };
  });
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-70" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-widest text-primary/80">
              {today}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, <span className="text-gradient">Anannya</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Your platform shipped 12 deployments and processed 1.28M API requests since yesterday. Two AI insights need your attention.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              <Sparkles className="mr-2 h-4 w-4" /> Ask InsightFlow AI
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setDeployOpen(true)}>
              <Rocket className="mr-2 h-4 w-4" /> New deployment
            </Button>
          </div>
        </div>
      </motion.section>
      <NewDeploymentDialog open={deployOpen} onOpenChange={setDeployOpen} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {liveMetrics.map((m, i) => (
          <MetricCard key={m.label} {...m} index={i} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Weekly activity"
          description="Visits, unique users and API calls over the last 7 days"
          actions={
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Last 7 days <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gVisits" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gUniques" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Area type="monotone" dataKey="visits" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#gVisits)" />
                <Area type="monotone" dataKey="uniques" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#gUniques)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Traffic sources" description="Distribution across channels">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSources}
                  dataKey="value"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {trafficSources.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {trafficSources.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-medium tabular-nums">{s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Revenue vs target"
          description="Monthly recurring revenue against the plan"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="target" fill="var(--color-muted)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="AI recommendations" description="Ranked by projected impact">
          <div className="space-y-3">
            {aiInsights.recommendations.slice(0, 3).map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-subtle p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-tight">{r.title}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {r.detail}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                        {r.confidence}% conf.
                      </span>
                      <span>{r.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Recent deployments"
        description="Latest activity across environments"
        actions={
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        }
      >
        <div className="divide-y divide-border/60">
          {deployments.slice(0, 5).map((d) => (
            <div key={d.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
              <div
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  d.status === "success"
                    ? "bg-success"
                    : d.status === "running"
                      ? "bg-info animate-pulse"
                      : d.status === "queued"
                        ? "bg-warning"
                        : "bg-destructive"
                }`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{d.service}</span>
                  <span className="rounded-md border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {d.env}
                  </span>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  <GitCommit className="mr-1 inline h-3 w-3" />
                  {d.commit.slice(0, 7)} · {d.message}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>{d.author}</div>
                <div>{d.time}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
