export type AiSuggestion = {
  id: string;
  title: string;
  detail: string;
  category: "performance" | "security" | "cost" | "reliability" | "devx";
  impact: "high" | "medium" | "low";
  eta: string;
  confidence: number;
};

export const aiSuggestions: AiSuggestion[] = [
  { id: "s1", title: "Reduce /predict API latency", detail: "Batch inference calls in 16ms windows to cut p95 latency by 34%.", category: "performance", impact: "high", eta: "2h", confidence: 96 },
  { id: "s2", title: "Archive 3 unused repositories", detail: "flow-legacy, vision-v2 and old-docs haven't seen commits in 90+ days.", category: "devx", impact: "low", eta: "10m", confidence: 88 },
  { id: "s3", title: "Bump 12 dependencies with security patches", detail: "openssl, node, sharp and 9 others have available minor updates.", category: "security", impact: "medium", eta: "30m", confidence: 92 },
  { id: "s4", title: "Rotate exposed API keys in edge-runtime", detail: "Detected a legacy Segment write key committed to git history.", category: "security", impact: "high", eta: "20m", confidence: 99 },
  { id: "s5", title: "Idle GPU nodes in eu-west-1", detail: "3 A10 instances averaging 4% utilization over 7d. Consolidate or downsize.", category: "cost", impact: "high", eta: "1h", confidence: 90 },
  { id: "s6", title: "Add circuit breaker for embeddings cache", detail: "Cascading timeouts observed when Redis latency exceeds 40ms.", category: "reliability", impact: "medium", eta: "3h", confidence: 84 },
];

export type RepoHealth = {
  repo: string;
  score: number;
  coverage: number;
  churn: number;
  bus: number;
  security: number;
};

export const repoHealth: RepoHealth[] = [
  { repo: "insight-core", score: 92, coverage: 88, churn: 22, bus: 4, security: 95 },
  { repo: "edge-runtime", score: 88, coverage: 81, churn: 34, bus: 3, security: 91 },
  { repo: "flow-sdk", score: 79, coverage: 72, churn: 41, bus: 2, security: 84 },
  { repo: "vision-models", score: 74, coverage: 63, churn: 58, bus: 2, security: 78 },
  { repo: "flow-cli", score: 86, coverage: 78, churn: 18, bus: 3, security: 92 },
  { repo: "insight-docs", score: 95, coverage: 94, churn: 12, bus: 5, security: 98 },
];

export type PullRequest = {
  id: string;
  title: string;
  repo: string;
  author: string;
  branch: string;
  files: number;
  additions: number;
  deletions: number;
  complexity: "low" | "medium" | "high";
  risk: number;
  reviewers: string[];
  summary: string;
  status: "open" | "review" | "merged";
};

export const pullRequests: PullRequest[] = [
  {
    id: "pr-1428",
    title: "feat(inference): dynamic batching for /predict",
    repo: "insight-core",
    author: "Anannya Mitra",
    branch: "am/dynamic-batching",
    files: 18,
    additions: 642,
    deletions: 128,
    complexity: "high",
    risk: 72,
    reviewers: ["Sajani Chandar", "Kai Nakamura"],
    summary:
      "Introduces a 16ms adaptive batching window on the inference hot path. Adds a scheduler, benchmarks and a feature flag. High blast radius — touches request lifecycle.",
    status: "review",
  },
  {
    id: "pr-1427",
    title: "fix(edge): reuse worker pool across requests",
    repo: "edge-runtime",
    author: "Ian Prescott",
    branch: "ip/worker-pool",
    files: 6,
    additions: 88,
    deletions: 54,
    complexity: "medium",
    risk: 38,
    reviewers: ["Anannya Mitra"],
    summary:
      "Small, focused refactor. Reduces cold-start allocations by ~40%. Includes updated bench script and CHANGELOG entry.",
    status: "open",
  },
  {
    id: "pr-1425",
    title: "docs: rewrite streaming guide",
    repo: "insight-docs",
    author: "Elena Gilbert",
    branch: "eg/streaming-docs",
    files: 4,
    additions: 214,
    deletions: 190,
    complexity: "low",
    risk: 8,
    reviewers: ["Rajani Agnihotri"],
    summary: "Copy-only. Rewritten SSE section and added a fetch-based example. Zero runtime impact.",
    status: "review",
  },
];

export type Incident = {
  id: string;
  title: string;
  severity: "sev1" | "sev2" | "sev3";
  status: "resolved" | "mitigating" | "investigating";
  detected: string;
  resolved: string;
  region: string;
  confidence: number;
  rootCause: string;
  fix: string;
  timeline: { at: string; event: string; kind: "alert" | "action" | "ok" }[];
};

export const incidents: Incident[] = [
  {
    id: "INC-2041",
    title: "Elevated 5xx on insight-core us-east-1",
    severity: "sev2",
    status: "resolved",
    detected: "14:02",
    resolved: "14:11",
    region: "us-east-1",
    confidence: 94,
    rootCause:
      "Retry storm from flow-cli 4.2.1 exhausted the inference worker pool. Backpressure was not signalled upstream.",
    fix: "Ship worker-pool reuse (PR-1427) and add exponential backoff to flow-cli 4.2.2. Add Redis-backed circuit breaker.",
    timeline: [
      { at: "14:02", event: "PagerDuty alert: 5xx > 1% for 60s", kind: "alert" },
      { at: "14:03", event: "Auto-scale added 4 workers", kind: "action" },
      { at: "14:05", event: "SRE on-call acknowledged", kind: "action" },
      { at: "14:07", event: "Root cause identified via trace correlation", kind: "action" },
      { at: "14:09", event: "Traffic drained from unhealthy pod", kind: "action" },
      { at: "14:11", event: "Error rate back to baseline", kind: "ok" },
    ],
  },
];

export const performanceSeries = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  latency: 80 + Math.round(30 * Math.sin(i / 3) + Math.random() * 20 + (i >= 9 && i <= 18 ? 40 : 0)),
  memory: 40 + Math.round(15 * Math.cos(i / 4) + Math.random() * 8),
  cpu: 30 + Math.round(20 * Math.sin(i / 5) + Math.random() * 12 + (i >= 10 && i <= 20 ? 15 : 0)),
  network: 20 + Math.round(10 * Math.sin(i / 3) + Math.random() * 8),
}));

export const costBreakdown = [
  { name: "Compute", value: 12400, savings: 2100, color: "var(--color-chart-1)" },
  { name: "Storage", value: 3200, savings: 180, color: "var(--color-chart-2)" },
  { name: "Network", value: 2100, savings: 340, color: "var(--color-chart-3)" },
  { name: "AI Inference", value: 8800, savings: 1900, color: "var(--color-chart-5)" },
  { name: "Observability", value: 1600, savings: 90, color: "var(--color-chart-4)" },
];

export type IdleResource = {
  name: string;
  kind: string;
  region: string;
  monthly: number;
  utilization: number;
};

export const idleResources: IdleResource[] = [
  { name: "gpu-a10-pool-3", kind: "GPU cluster", region: "eu-west-1", monthly: 1840, utilization: 4 },
  { name: "warehouse-staging", kind: "Warehouse", region: "us-east-1", monthly: 620, utilization: 12 },
  { name: "flow-cli-preview", kind: "Deployment", region: "us-west-2", monthly: 180, utilization: 0 },
  { name: "vision-eval-jobs", kind: "Batch jobs", region: "us-east-1", monthly: 940, utilization: 8 },
];

export const aiDashboard = {
  models: 12,
  inference: 1_280_412,
  requests: 4_920_118,
  tokens: 84_210_400,
  cacheHit: 87.4,
  confidence: 94.2,
  predictions: 26_400,
};

export const aiCommandExamples = [
  "Deploy edge-runtime to staging",
  "Show failed deployments this week",
  "Analyze insight-core repository health",
  "Generate release notes for v4.2.0",
  "Find performance bottlenecks in the inference path",
  "Summarize incident INC-2041",
  "Suggest architecture improvements for flow-sdk",
  "Which repos have exposed secrets?",
];

export const chatQuickPrompts: { label: string; icon: string; prompt: string }[] = [
  { label: "Analyze repository", icon: "GitBranch", prompt: "Analyze the health of insight-core" },
  { label: "Explain last incident", icon: "AlertTriangle", prompt: "Root cause of incident INC-2041" },
  { label: "Suggest architecture", icon: "Blocks", prompt: "Suggest architecture improvements for vision-models" },
  { label: "Optimize performance", icon: "Zap", prompt: "How can we reduce p95 latency on /predict?" },
  { label: "Security review", icon: "Shield", prompt: "Do a security review of edge-runtime" },
  { label: "DevOps advice", icon: "Rocket", prompt: "Best strategy to deploy insight-core to production" },
];

// Deterministic, mocked assistant responses. Keyed by lowercased prompt substring.
export function mockAssistantAnswer(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("inc-2041") || p.includes("incident")) {
    return [
      "**Incident INC-2041 — Elevated 5xx on insight-core (us-east-1)**",
      "",
      "**Root cause** — A retry storm from `flow-cli 4.2.1` saturated the inference worker pool. Backpressure wasn't signalled upstream, so requests kept queuing until the pool starved.",
      "",
      "**Timeline (9 min)**",
      "- 14:02 — 5xx > 1% for 60s (PagerDuty)",
      "- 14:03 — Auto-scale added 4 workers",
      "- 14:07 — Root cause identified via trace correlation",
      "- 14:11 — Error rate back to baseline",
      "",
      "**Suggested fix** — Ship PR-1427 (worker-pool reuse), release `flow-cli 4.2.2` with exponential backoff, and add a Redis-backed circuit breaker on the embeddings cache. Confidence **94%**.",
    ].join("\n");
  }
  if (p.includes("latency") || p.includes("bottleneck") || p.includes("performance")) {
    return [
      "**Performance analysis — /predict**",
      "",
      "Top three opportunities, ordered by projected impact:",
      "1. **Dynamic batching** (16ms window) — cuts p95 by ~34%, cost by ~28%. Blueprint in PR-1428.",
      "2. **Reuse worker pools** across requests — removes ~40% of cold-start allocations.",
      "3. **Warm embedding cache in us-east-1** — hit rate fell 91% → 76% in 48h. A background prefetch fixes it.",
      "",
      "Combined, expected p95 drops from **320ms → 205ms**. Confidence **91%**.",
    ].join("\n");
  }
  if (p.includes("security")) {
    return [
      "**Security review — edge-runtime**",
      "",
      "- 🔴 Legacy Segment write key present in git history (`config/legacy.ts`, commit `1a2b3c4`). Rotate and purge with `git filter-repo`.",
      "- 🟡 12 dependencies have minor security patches available. Auto-PR ready.",
      "- 🟢 RLS-equivalent policies on the control plane look correct.",
      "",
      "Overall posture: **B+**, up from B- last week.",
    ].join("\n");
  }
  if (p.includes("release notes") || p.includes("commit")) {
    return [
      "**Release notes — v4.2.0**",
      "",
      "**Highlights**",
      "- ⚡ Dynamic batching on the inference hot path (up to 34% lower p95)",
      "- 🧵 Reused edge worker pools reduce cold-start allocations by ~40%",
      "- 📚 Rewritten streaming guide with a fetch-based example",
      "",
      "**Fixes**",
      "- Handle expired refresh tokens in `flow-cli`",
      "- Prevent retry storms with exponential backoff",
      "",
      "**Conventional commit suggestion** — `feat(inference)!: dynamic batching (#1428)`",
    ].join("\n");
  }
  if (p.includes("architecture")) {
    return [
      "**Architecture suggestions — vision-models**",
      "",
      "1. Split training and evaluation pipelines into separate services; today they share a queue and evaluation blocks fresh training.",
      "2. Introduce a feature store (Redis + Parquet) — 3 pipelines currently re-derive the same embeddings.",
      "3. Move augmentation to the data loader with a WebDataset shard layout — I/O is the current bottleneck, not GPU.",
      "",
      "Confidence **88%**. Estimated effort **2 sprints**.",
    ].join("\n");
  }
  if (p.includes("deploy")) {
    return [
      "**DevOps recommendation**",
      "",
      "For `insight-core → production` prefer a **canary** rollout: 5% → 25% → 100% over 30 min, guarded by p95 and error-rate SLOs.",
      "Enable rollback-on-failure and Slack notifications. Estimated deploy time **6m 40s**, downtime **~0s**, risk score **28/100**.",
    ].join("\n");
  }
  if (p.includes("repo") || p.includes("health") || p.includes("insight-core")) {
    return [
      "**Repository health — insight-core**",
      "",
      "- Score **92/100** (↑ 3 this week)",
      "- Test coverage **88%**, churn moderate (22 files/wk)",
      "- Bus factor **4** — healthy",
      "- Security posture **95** — no critical advisories",
      "",
      "Watchpoints: 3 hot files exceed 600 LOC (`scheduler.ts`, `router.ts`, `metrics.ts`). Consider splitting `scheduler.ts`.",
    ].join("\n");
  }
  return [
    "Here's what I found based on your current platform state:",
    "",
    "- 4 recommendations are ranked high-impact this week",
    "- Enabling request batching alone would cut inference cost by ~34%",
    "- No critical incidents in the last 24h",
    "",
    "Ask me about a specific repository, deployment, or incident and I'll dig in.",
  ].join("\n");
}
