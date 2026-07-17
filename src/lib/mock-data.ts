export type MetricTrend = {
  label: string;
  value: string;
  raw: number;
  delta: number;
  spark: number[];
};

export const metrics: MetricTrend[] = [
  { label: "Total Users", value: "48,291", raw: 48291, delta: 12.4, spark: [12, 18, 15, 22, 26, 24, 30, 34, 32, 38, 42, 48] },
  { label: "Active Sessions", value: "3,842", raw: 3842, delta: 8.1, spark: [20, 24, 22, 28, 26, 30, 32, 30, 36, 34, 38, 40] },
  { label: "API Requests", value: "1.28M", raw: 1_280_000, delta: 24.6, spark: [40, 44, 42, 50, 55, 58, 60, 68, 66, 72, 78, 82] },
  { label: "Revenue", value: "$284,120", raw: 284120, delta: 6.2, spark: [30, 28, 32, 36, 38, 40, 42, 44, 43, 48, 52, 56] },
  { label: "AI Accuracy", value: "97.4%", raw: 97.4, delta: 1.8, spark: [92, 93, 92, 94, 94, 95, 95, 96, 96, 97, 97, 97] },
  { label: "Deployments", value: "126", raw: 126, delta: -3.4, spark: [14, 16, 15, 18, 17, 16, 15, 14, 15, 13, 14, 12] },
];

export const trafficData = [
  { name: "Mon", visits: 4200, uniques: 2900, apiCalls: 18400 },
  { name: "Tue", visits: 4800, uniques: 3200, apiCalls: 21200 },
  { name: "Wed", visits: 5100, uniques: 3600, apiCalls: 23800 },
  { name: "Thu", visits: 4700, uniques: 3300, apiCalls: 22100 },
  { name: "Fri", visits: 6200, uniques: 4100, apiCalls: 28900 },
  { name: "Sat", visits: 5400, uniques: 3700, apiCalls: 24200 },
  { name: "Sun", visits: 5900, uniques: 4000, apiCalls: 26400 },
];

export const revenueData = [
  { month: "Jan", revenue: 18400, target: 20000 },
  { month: "Feb", revenue: 22800, target: 22000 },
  { month: "Mar", revenue: 21100, target: 24000 },
  { month: "Apr", revenue: 28900, target: 26000 },
  { month: "May", revenue: 32200, target: 28000 },
  { month: "Jun", revenue: 34800, target: 32000 },
  { month: "Jul", revenue: 41200, target: 36000 },
  { month: "Aug", revenue: 39900, target: 38000 },
  { month: "Sep", revenue: 44100, target: 42000 },
];

export const performanceData = [
  { time: "00:00", p50: 82, p95: 210, p99: 380 },
  { time: "04:00", p50: 78, p95: 195, p99: 340 },
  { time: "08:00", p50: 96, p95: 240, p99: 420 },
  { time: "12:00", p50: 128, p95: 320, p99: 560 },
  { time: "16:00", p50: 142, p95: 358, p99: 610 },
  { time: "20:00", p50: 108, p95: 268, p99: 460 },
  { time: "23:59", p50: 88, p95: 220, p99: 380 },
];

export const errorBreakdown = [
  { name: "4xx Client", value: 1240, color: "var(--color-warning)" },
  { name: "5xx Server", value: 320, color: "var(--color-destructive)" },
  { name: "Timeouts", value: 180, color: "var(--color-info)" },
  { name: "Validation", value: 640, color: "var(--color-chart-5)" },
];

export const trafficSources = [
  { name: "Organic", value: 4820, color: "var(--color-chart-1)" },
  { name: "Referral", value: 2140, color: "var(--color-chart-2)" },
  { name: "Direct", value: 3210, color: "var(--color-chart-3)" },
  { name: "Social", value: 1680, color: "var(--color-chart-5)" },
];

export const heatmap = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => ({
    day: d,
    hour: h,
    value: Math.round(
      40 +
        60 * Math.sin((h - 6) / 3) * Math.cos(d / 2) +
        Math.random() * 30 +
        (h >= 9 && h <= 18 ? 40 : 0),
    ),
  })),
).flat();

export type Repo = {
  id: string;
  name: string;
  org: string;
  description: string;
  stars: number;
  commits: number;
  contributors: number;
  issues: number;
  language: string;
  languageColor: string;
  updatedAt: string;
  activity: number[];
};

export const repositories: Repo[] = [
  {
    id: "1",
    name: "insight-core",
    org: "insightflow",
    description: "Realtime ML inference engine powering all customer-facing predictions.",
    stars: 2840,
    commits: 18420,
    contributors: 42,
    issues: 18,
    language: "TypeScript",
    languageColor: "#3178c6",
    updatedAt: "2h ago",
    activity: [3, 5, 4, 6, 8, 7, 9, 12, 10, 14, 12, 16, 18, 15],
  },
  {
    id: "2",
    name: "edge-runtime",
    org: "insightflow",
    description: "Edge worker runtime with sub-10ms cold starts and streaming responses.",
    stars: 1620,
    commits: 9840,
    contributors: 28,
    issues: 7,
    language: "Rust",
    languageColor: "#dea584",
    updatedAt: "1h ago",
    activity: [2, 3, 4, 3, 5, 6, 5, 7, 6, 8, 9, 8, 10, 12],
  },
  {
    id: "3",
    name: "flow-sdk",
    org: "insightflow",
    description: "Type-safe SDK for the InsightFlow API. Ships with React, Vue and Svelte bindings.",
    stars: 984,
    commits: 4210,
    contributors: 18,
    issues: 12,
    language: "TypeScript",
    languageColor: "#3178c6",
    updatedAt: "5h ago",
    activity: [1, 2, 2, 3, 4, 3, 4, 5, 4, 6, 5, 7, 6, 8],
  },
  {
    id: "4",
    name: "vision-models",
    org: "insightflow",
    description: "Training and evaluation pipelines for the vision foundation models.",
    stars: 3120,
    commits: 6820,
    contributors: 34,
    issues: 24,
    language: "Python",
    languageColor: "#3572A5",
    updatedAt: "12m ago",
    activity: [4, 6, 5, 7, 8, 10, 9, 11, 13, 12, 14, 16, 15, 18],
  },
  {
    id: "5",
    name: "flow-cli",
    org: "insightflow",
    description: "Developer CLI for scaffolding, deployments and log streaming.",
    stars: 612,
    commits: 2140,
    contributors: 12,
    issues: 4,
    language: "Go",
    languageColor: "#00ADD8",
    updatedAt: "1d ago",
    activity: [1, 1, 2, 2, 3, 2, 3, 4, 3, 4, 5, 4, 5, 6],
  },
  {
    id: "6",
    name: "insight-docs",
    org: "insightflow",
    description: "Documentation site, API reference and interactive playgrounds.",
    stars: 428,
    commits: 1820,
    contributors: 22,
    issues: 9,
    language: "MDX",
    languageColor: "#f9ac00",
    updatedAt: "3h ago",
    activity: [2, 2, 3, 3, 4, 4, 5, 4, 6, 5, 7, 6, 7, 8],
  },
];

export type Deployment = {
  id: string;
  service: string;
  env: "production" | "staging" | "development";
  status: "success" | "running" | "queued" | "failed";
  commit: string;
  message: string;
  author: string;
  duration: string;
  time: string;
};

export const deployments: Deployment[] = [
  { id: "d1", service: "insight-core", env: "production", status: "success", commit: "a3f21c9", message: "feat(inference): batch attention masks", author: "Anannya Mitra", duration: "3m 42s", time: "2m ago" },
  { id: "d2", service: "edge-runtime", env: "production", status: "running", commit: "72cb1a4", message: "perf: reuse worker pools across requests", author: "Sajani Chandar", duration: "1m 12s", time: "just now" },
  { id: "d3", service: "flow-sdk", env: "staging", status: "queued", commit: "9de8014", message: "chore: bump zod to 3.24", author: "Ian Prescott", duration: "—", time: "4m ago" },
  { id: "d4", service: "vision-models", env: "development", status: "failed", commit: "1a2b3c4", message: "wip: try new augmentation strategy", author: "Priya Rao", duration: "6m 08s", time: "18m ago" },
  { id: "d5", service: "flow-cli", env: "production", status: "success", commit: "ff01234", message: "fix(login): handle expired refresh tokens", author: "Noah Weber", duration: "2m 04s", time: "1h ago" },
  { id: "d6", service: "insight-docs", env: "staging", status: "success", commit: "0abc123", message: "docs: rewrite streaming guide", author: "Elena Gilbert", duration: "48s", time: "2h ago" },
  { id: "d7", service: "insight-core", env: "staging", status: "success", commit: "bc98765", message: "test: add regression suite for batching", author: "Anannya Mitra", duration: "4m 22s", time: "3h ago" },
];

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  availability: "online" | "focus" | "away" | "offline";
  performance: number;
  activity: number[];
  location: string;
};

export const team: TeamMember[] = [
  { id: "u1", name: "Anannya Mitra", role: "Staff Engineer · ML", initials: "AM", color: "from-violet-500 to-fuchsia-500", availability: "online", performance: 94, activity: [4, 6, 5, 7, 8, 10, 9], location:"Bengaluru" },
  { id: "u2", name: "Sajani Chandar", role: "Principal · Runtime", initials: "SC", color: "from-sky-500 to-indigo-500", availability: "focus", performance: 91, activity: [3, 5, 6, 5, 7, 6, 8], location: "Tamil Nadu" },
  { id: "u3", name: "Ian Prescott", role: "Senior · SDK", initials: "IP", color: "from-emerald-500 to-teal-500", availability: "online", performance: 88, activity: [2, 3, 4, 3, 5, 4, 6], location: "Seoul" },
  { id: "u4", name: "Priya Rao", role: "Research · Vision", initials: "PR", color: "from-rose-500 to-orange-500", availability: "away", performance: 96, activity: [5, 4, 6, 7, 6, 8, 7], location: "Ahmedabad" },
  { id: "u5", name: "Noah Weber", role: "Senior · Platform", initials: "NW", color: "from-amber-500 to-rose-500", availability: "online", performance: 85, activity: [3, 2, 4, 3, 5, 4, 5], location: "Berlin" },
  { id: "u6", name: "Rajani Agnihotri", role: "DX Lead", initials: "RA", color: "from-cyan-500 to-blue-500", availability: "focus", performance: 92, activity: [2, 3, 3, 4, 5, 4, 6], location: "Canada" },
  { id: "u7", name: "Kai Nakamura", role: "SRE", initials: "KN", color: "from-indigo-500 to-purple-500", availability: "offline", performance: 89, activity: [4, 4, 5, 6, 5, 7, 6], location: "Osaka" },
  { id: "u8", name: "Elena Gilbert", role: "Design Engineer", initials: "EG", color: "from-pink-500 to-rose-500", availability: "online", performance: 90, activity: [3, 4, 4, 5, 6, 5, 7], location: "Mexico City" },
];

export type Task = {
  id: string;
  title: string;
  status: "backlog" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: string;
  due: string;
  progress: number;
  tag: string;
};

export const tasks: Task[] = [
  { id: "t1", title: "Reduce p95 latency on inference edge nodes", status: "in-progress", priority: "urgent", assignee: "AM", due: "Fri", progress: 62, tag: "Performance" },
  { id: "t2", title: "Draft the streaming responses migration guide", status: "review", priority: "medium", assignee: "SC", due: "Mon", progress: 90, tag: "Docs" },
  { id: "t3", title: "Ship dark mode for the customer console", status: "done", priority: "medium", assignee: "IP", due: "Yesterday", progress: 100, tag: "Design" },
  { id: "t4", title: "Instrument new billing events into warehouse", status: "backlog", priority: "high", assignee: "NW", due: "Next week", progress: 12, tag: "Platform" },
  { id: "t5", title: "Retrain vision-v4 on curated dataset", status: "in-progress", priority: "high", assignee: "PR", due: "Wed", progress: 44, tag: "Research" },
  { id: "t6", title: "SDK: add Svelte 5 runes bindings", status: "backlog", priority: "low", assignee: "AM", due: "—", progress: 0, tag: "SDK" },
  { id: "t7", title: "Audit worker pool memory pressure", status: "review", priority: "high", assignee: "RA", due: "Fri", progress: 78, tag: "Runtime" },
  { id: "t8", title: "On-call runbook for cascading timeouts", status: "done", priority: "medium", assignee: "KN", due: "Tue", progress: 100, tag: "Ops" },
  { id: "t9", title: "Design metric card v2 with sparklines", status: "in-progress", priority: "low", assignee: "EG", due: "Thu", progress: 30, tag: "Design" },
];

export type AppNotification = {
  id: string;
  kind: "deploy" | "incident" | "mention" | "insight";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const notifications: AppNotification[] = [
  { id: "n1", kind: "incident", title: "Elevated error rate — us-east-1", body: "5xx errors on insight-core rose to 2.1% for 4 minutes. Auto-mitigated.", time: "3m ago", read: false },
  { id: "n2", kind: "deploy", title: "edge-runtime deployed to production", body: "72cb1a4 by Ian Prescott · 1m 12s", time: "12m ago", read: false },
  { id: "n3", kind: "mention", title: "Sajani Chandar mentioned Anannya Mitra in a comment", body: "\"Let's align on the batching threshold before Friday's rollout.\"", time: "1h ago", read: false },
  { id: "n4", kind: "insight", title: "New AI insight available", body: "Weekend traffic pattern shifted 18% earlier vs. last week.", time: "2h ago", read: true },
  { id: "n5", kind: "deploy", title: "insight-docs deployed to staging", body: "0abc123 by Anannya Mitra · 48s", time: "3h ago", read: true },
  { id: "n6", kind: "incident", title: "Resolved: elevated queue depth", body: "Root cause: retry storm from flow-cli 4.2.1", time: "yesterday", read: true },
];

export type AIRecommendation = {
  id: string;
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  time: string;
};

export const aiInsights = {
  accuracy: 97.4,
  confidence: 92.1,
  detected: 14,
  risk: "Low" as const,
  recommendations: [
    { id: "a1", title: "Enable request batching for /predict", detail: "Model shows 34% lower cost per call with dynamic batching windows of 16ms.", impact: "high", confidence: 96, time: "12m ago" },
    { id: "a2", title: "Rotate embedding cache in us-east-1", detail: "Hit rate has dropped from 91% to 76% over the last 48 hours.", impact: "medium", confidence: 88, time: "1h ago" },
    { id: "a3", title: "Retrain intent-classifier v3.2", detail: "Drift detected on 4 top intents. Suggested threshold: 0.82 confidence.", impact: "high", confidence: 91, time: "3h ago" },
    { id: "a4", title: "Deprecate legacy tokenizer path", detail: "Only 0.4% of traffic still uses the v1 tokenizer. Est. savings: 12% memory.", impact: "low", confidence: 82, time: "yesterday" },
  ] as AIRecommendation[],
};

export const reports = [
  { id: "r1", title: "Weekly platform health", period: "Nov 4 – Nov 10", size: "2.4 MB", type: "PDF", updatedAt: "2h ago" },
  { id: "r2", title: "AI model performance", period: "October", size: "3.8 MB", type: "PDF", updatedAt: "1d ago" },
  { id: "r3", title: "Cost & efficiency review", period: "Q3", size: "5.1 MB", type: "PDF", updatedAt: "5d ago" },
  { id: "r4", title: "Deployment reliability", period: "Last 30 days", size: "1.8 MB", type: "CSV", updatedAt: "1w ago" },
  { id: "r5", title: "Customer engagement", period: "Last 90 days", size: "4.2 MB", type: "PDF", updatedAt: "2w ago" },
];