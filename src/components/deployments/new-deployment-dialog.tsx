import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Gauge,
  GitBranch,
  GitCommit,
  Globe,
  History,
  Layers,
  Loader2,
  Package,
  Play,
  Rocket,
  RotateCcw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { repositories, type Repo } from "@/lib/mock-data";
import { pushDeployment, pushNotification } from "@/lib/deployment-store";

type Env = "production" | "staging" | "development";
type Strategy = "rolling" | "blue-green" | "canary";

const branchesByRepo: Record<string, { name: string; commit: string; message: string; when: string; author: string }[]> = {
  default: [
    { name: "main", commit: "a3f21c9", message: "feat(inference): batch attention masks", when: "2m ago", author: "Anannya Mitra" },
    { name: "release/2026.07", commit: "72cb1a4", message: "perf: reuse worker pools", when: "1h ago", author: "Sajani Chandar" },
    { name: "feat/streaming-v2", commit: "9de8014", message: "chore: bump zod to 3.24", when: "4h ago", author: "Ian Prescott" },
    { name: "fix/refresh-token", commit: "ff01234", message: "fix(login): expired refresh", when: "1d ago", author: "Noah Weber" },
    { name: "wip/augmentation", commit: "1a2b3c4", message: "wip: new augmentation", when: "2d ago", author: "Priya Rao" },
    { name: "docs/streaming", commit: "0abc123", message: "docs: rewrite streaming guide", when: "3d ago", author: "Elena Gilbert" },
  ],
};

const environments: {
  key: Env;
  label: string;
  region: string;
  version: string;
  health: number;
  from: string;
  to: string;
  ring: string;
}[] = [
  { key: "production", label: "Production", region: "us-east-1 · eu-west-1", version: "v4.12.3", health: 99.98, from: "from-emerald-500", to: "to-teal-500", ring: "ring-emerald-500/30" },
  { key: "staging", label: "Staging", region: "us-east-1", version: "v4.13.0-rc.2", health: 99.4, from: "from-amber-500", to: "to-orange-500", ring: "ring-amber-500/30" },
  { key: "development", label: "Development", region: "local · preview", version: "v4.13.0-dev", health: 97.1, from: "from-sky-500", to: "to-indigo-500", ring: "ring-sky-500/30" },
];

const strategies: {
  key: Strategy;
  label: string;
  tag: string;
  description: string;
  downtime: string;
  risk: number;
}[] = [
  {
    key: "rolling",
    label: "Rolling",
    tag: "Zero downtime",
    description: "Gradually replace instances one batch at a time. Safe, steady, low blast radius.",
    downtime: "0s",
    risk: 15,
  },
  {
    key: "blue-green",
    label: "Blue / Green",
    tag: "Instant switch",
    description: "Spin up a parallel environment, run smoke tests, then flip traffic in a single atomic switch.",
    downtime: "0s",
    risk: 22,
  },
  {
    key: "canary",
    label: "Canary",
    tag: "Progressive",
    description: "Route 5% → 25% → 50% → 100% of traffic while watching SLOs. Auto-rollback on regression.",
    downtime: "0s",
    risk: 8,
  },
];

type ConfigKey =
  | "tests"
  | "docker"
  | "releaseNotes"
  | "migration"
  | "healthChecks"
  | "slack"
  | "rollback"
  | "autoscale";

const configItems: { key: ConfigKey; label: string; description: string; icon: any; recommended?: boolean }[] = [
  { key: "tests", label: "Run tests", description: "Unit, integration and contract tests before build.", icon: ShieldCheck, recommended: true },
  { key: "docker", label: "Build Docker image", description: "Multi-stage build, cached layers, signed manifest.", icon: Package, recommended: true },
  { key: "releaseNotes", label: "Generate release notes", description: "AI-summarised changelog from commits since last deploy.", icon: Sparkles },
  { key: "migration", label: "Database migration", description: "Run pending migrations inside a transaction with backup.", icon: Layers },
  { key: "healthChecks", label: "Health checks", description: "Wait for /healthz to return 200 across all replicas.", icon: Activity, recommended: true },
  { key: "slack", label: "Slack notification", description: "Post start / success / failure to #deploys.", icon: Bell },
  { key: "rollback", label: "Rollback on failure", description: "Automatically revert to the previous version if checks fail.", icon: RotateCcw, recommended: true },
  { key: "autoscale", label: "Auto-scale after deploy", description: "Warm capacity for the next 15 minutes.", icon: Gauge },
];

type Config = Record<ConfigKey, boolean>;
const defaultConfig: Config = {
  tests: true,
  docker: true,
  releaseNotes: true,
  migration: false,
  healthChecks: true,
  slack: true,
  rollback: true,
  autoscale: false,
};

const pipelineStages = [
  { key: "init", label: "Initializing", logs: ["$ flow deploy --env {env}", "› Session opened", "› Loading pipeline config"] },
  { key: "deps", label: "Resolving dependencies", logs: ["› Locking 428 packages", "› Warming build cache", "✔ Cache hit ratio 92%"] },
  { key: "build", label: "Building container", logs: ["› docker buildx build .", "› layer 1/7 ✔ base", "› layer 5/7 ✔ deps", "✔ Image built (238MB)"] },
  { key: "tests", label: "Running tests", logs: ["› vitest run --coverage", "✔ 1,842 tests passed", "✔ Coverage 94.2%"] },
  { key: "publish", label: "Publishing image", logs: ["› pushing to registry.insightflow.io", "› sha256:9f2c…3a1d signed", "✔ Manifest published"] },
  { key: "deploy", label: "Deploying", logs: ["› Rolling out to {env}", "› replica 1/6 ready", "› replica 3/6 ready", "› replica 6/6 ready"] },
  { key: "health", label: "Health checks", logs: ["› GET /healthz 200 (12ms)", "› GET /ready 200 (8ms)", "✔ All probes green"] },
  { key: "traffic", label: "Traffic switch", logs: ["› shifting 25% traffic", "› shifting 100% traffic", "✔ Cutover complete"] },
];

type StageState = "pending" | "running" | "done";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function NewDeploymentDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(0);
  const [repo, setRepo] = useState<Repo | null>(null);
  const [branchQuery, setBranchQuery] = useState("");
  const [branchOpen, setBranchOpen] = useState(false);
  const [branch, setBranch] = useState<(typeof branchesByRepo)["default"][number] | null>(null);
  const [env, setEnv] = useState<Env>("staging");
  const [strategy, setStrategy] = useState<Strategy>("canary");
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [phase, setPhase] = useState<"wizard" | "deploying" | "success">("wizard");

  useEffect(() => {
    if (!open) {
      // Reset after close animation
      const t = setTimeout(() => {
        setStep(0);
        setRepo(null);
        setBranch(null);
        setEnv("staging");
        setStrategy("canary");
        setConfig(defaultConfig);
        setPhase("wizard");
        setBranchQuery("");
      }, 240);
      return () => clearTimeout(t);
    }
  }, [open]);

  const branches = branchesByRepo.default;
  const filteredBranches = useMemo(
    () => branches.filter((b) => b.name.toLowerCase().includes(branchQuery.toLowerCase())),
    [branches, branchQuery],
  );

  const enabledSteps: number[] = [0, 1, 2, 3, 4, 5];
  const canAdvance =
    (step === 0 && !!repo) ||
    (step === 1 && !!branch) ||
    (step === 2 && !!env) ||
    (step === 3 && !!strategy) ||
    step === 4 ||
    step === 5;

  const estTime = useMemo(() => {
    let s = 45;
    if (config.tests) s += 60;
    if (config.docker) s += 90;
    if (config.migration) s += 30;
    if (config.healthChecks) s += 20;
    if (strategy === "canary") s += 90;
    if (strategy === "blue-green") s += 45;
    return s;
  }, [config, strategy]);

  const risk = useMemo(() => {
    const base = strategies.find((s) => s.key === strategy)!.risk;
    let r = base;
    if (!config.tests) r += 20;
    if (!config.rollback) r += 15;
    if (!config.healthChecks) r += 10;
    if (config.migration) r += 8;
    if (env === "production") r += 6;
    return Math.min(99, r);
  }, [config, strategy, env]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[min(1080px,96vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-elevated backdrop-blur-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
        >
          {/* Ambient gradient */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-mesh opacity-70" />

          <DialogHeader
            phase={phase}
            step={step}
            onClose={() => onOpenChange(false)}
            repo={repo}
            env={env}
          />

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 md:px-8">
            <AnimatePresence mode="wait">
              {phase === "wizard" && (
                <motion.div key={`w-${step}`} {...fade}>
                  {step === 0 && <StepRepo repo={repo} onChange={setRepo} />}
                  {step === 1 && (
                    <StepBranch
                      branches={filteredBranches}
                      value={branch}
                      onChange={setBranch}
                      query={branchQuery}
                      onQuery={setBranchQuery}
                      open={branchOpen}
                      setOpen={setBranchOpen}
                    />
                  )}
                  {step === 2 && <StepEnv value={env} onChange={setEnv} />}
                  {step === 3 && <StepStrategy value={strategy} onChange={setStrategy} />}
                  {step === 4 && <StepConfig value={config} onChange={setConfig} />}
                  {step === 5 && (
                    <StepReview
                      repo={repo!}
                      branch={branch!}
                      env={env}
                      strategy={strategy}
                      config={config}
                      estTime={estTime}
                      risk={risk}
                    />
                  )}
                </motion.div>
              )}
              {phase === "deploying" && (
                <motion.div key="deploy" {...fade}>
                  <DeployPipeline
                    env={env}
                    repo={repo!}
                    onComplete={() => setPhase("success")}
                  />
                </motion.div>
              )}
              {phase === "success" && (
                <motion.div key="success" {...fade}>
                  <SuccessScreen
                    repo={repo!}
                    branch={branch!}
                    env={env}
                    strategy={strategy}
                    onDeployAgain={() => {
                      setPhase("wizard");
                      setStep(0);
                    }}
                    onClose={() => onOpenChange(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {phase === "wizard" && (
            <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-background/40 px-6 py-4 backdrop-blur-xl md:px-8">
              <div className="hidden text-xs text-muted-foreground sm:block">
                Step {step + 1} of {enabledSteps.length}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {step === 0 ? "Cancel" : "Back"}
                </Button>
                {step < 5 ? (
                  <Button
                    disabled={!canAdvance}
                    onClick={() => setStep(step + 1)}
                    className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setPhase("deploying")}
                    className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
                  >
                    <Rocket className="mr-2 h-4 w-4" /> Deploy
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] as const },
};

/* ------------------------------ HEADER ------------------------------- */
function DialogHeader({
  phase,
  step,
  onClose,
  repo,
  env,
}: {
  phase: "wizard" | "deploying" | "success";
  step: number;
  onClose: () => void;
  repo: Repo | null;
  env: Env;
}) {
  const stepLabels = ["Repository", "Branch", "Environment", "Strategy", "Configuration", "Review"];
  return (
    <div className="relative border-b border-border/60 bg-background/40 px-6 py-5 backdrop-blur-xl md:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary/80">
            <Rocket className="h-3.5 w-3.5" /> New deployment
          </div>
          <div className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
            {phase === "wizard" && stepLabels[step]}
            {phase === "deploying" && (
              <>
                Deploying{repo ? ` ${repo.name}` : ""}
                <span className="text-muted-foreground">to {env}</span>
              </>
            )}
            {phase === "success" && (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" /> Deployment complete
              </>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {phase === "wizard" && (
        <div className="mt-5 grid grid-cols-6 gap-2">
          {stepLabels.map((label, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="relative h-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={false}
                    animate={{ width: done ? "100%" : active ? "60%" : "0%" }}
                    transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                    className="h-full rounded-full bg-gradient-primary"
                  />
                </div>
                <div
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider transition-colors",
                    active ? "text-foreground" : done ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {i + 1}. {label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------- STEP 1: REPO --------------------------- */
function StepRepo({ repo, onChange }: { repo: Repo | null; onChange: (r: Repo) => void }) {
  return (
    <div className="pt-6">
      <div className="mb-4 text-sm text-muted-foreground">
        Choose the repository you want to deploy. Health, contributors and last commit are computed live.
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {repositories.map((r, i) => {
          const active = repo?.id === r.id;
          const health = 96 + ((i * 7) % 4);
          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onChange(r)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 text-left shadow-soft transition-all",
                "hover:-translate-y-0.5 hover:shadow-elevated",
                active
                  ? "border-primary bg-gradient-to-br from-primary/10 to-primary-glow/5 ring-2 ring-primary/40"
                  : "border-border/60 bg-card hover:border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: r.languageColor }}
                    />
                    <div className="truncate text-sm font-semibold">{r.name}</div>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{r.org}</div>
                </div>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-3 line-clamp-2 text-xs text-muted-foreground">{r.description}</div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                <GitCommit className="h-3 w-3" />
                <span className="font-mono text-foreground">a3f21c9</span>
                <span className="truncate">· latest on main</span>
                <span className="ml-auto shrink-0">{r.updatedAt}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <MiniStat label="Language" value={r.language} />
                <MiniStat label="Contributors" value={r.contributors.toString()} />
                <MiniStat
                  label="Health"
                  value={`${health}%`}
                  tone={health >= 98 ? "success" : "warning"}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/30 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 truncate text-xs font-semibold",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* -------------------------- STEP 2: BRANCH -------------------------- */
function StepBranch({
  branches,
  value,
  onChange,
  query,
  onQuery,
  open,
  setOpen,
}: {
  branches: (typeof branchesByRepo)["default"];
  value: (typeof branchesByRepo)["default"][number] | null;
  onChange: (b: (typeof branchesByRepo)["default"][number]) => void;
  query: string;
  onQuery: (s: string) => void;
  open: boolean;
  setOpen: (b: boolean) => void;
}) {
  const recent = branches.slice(0, 3);
  return (
    <div className="pt-6">
      <div className="mb-4 text-sm text-muted-foreground">
        Search branches or pick a recent one. We'll show the commit that ships.
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left shadow-soft transition-colors hover:border-border"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <GitBranch className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            {value ? (
              <>
                <div className="truncate text-sm font-semibold">{value.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono text-foreground">{value.commit}</span>
                  <span className="truncate">· {value.message}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-medium">Select a branch</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  We'll deploy the tip commit
                </div>
              </>
            )}
          </div>
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-border/70 bg-popover shadow-elevated"
            >
              <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  placeholder="Search branches…"
                  className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  autoFocus
                />
              </div>
              <div className="max-h-72 overflow-y-auto p-1">
                {branches.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground">No branches match.</div>
                )}
                {branches.map((b) => {
                  const isDefault = b.name === "main";
                  const isRecent = recent.includes(b);
                  return (
                    <button
                      key={b.name}
                      onClick={() => {
                        onChange(b);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-accent",
                        value?.name === b.name && "bg-accent",
                      )}
                    >
                      <GitBranch className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium">{b.name}</span>
                          {isDefault && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                              default
                            </span>
                          )}
                          {isRecent && !isDefault && (
                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                              recent
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="font-mono">{b.commit}</span>
                          <span className="truncate">· {b.message}</span>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{b.when}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {value && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-border/60 bg-background/40 p-4"
        >
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Commit preview
          </div>
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 font-mono text-[10px] font-bold text-primary">
              {value.commit.slice(0, 3)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{value.message}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {value.author} · <span className="font-mono">{value.commit}</span> · {value.when}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------ STEP 3: ENVIRONMENT ----------------------- */
function StepEnv({ value, onChange }: { value: Env; onChange: (e: Env) => void }) {
  return (
    <div className="pt-6">
      <div className="mb-4 text-sm text-muted-foreground">
        Where should this ship? Each environment has its own region, quota and current version.
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {environments.map((e, i) => {
          const active = value === e.key;
          return (
            <motion.button
              key={e.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onChange(e.key)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-5 text-left shadow-soft transition-all",
                "hover:-translate-y-0.5 hover:shadow-elevated",
                active
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border/60 bg-card hover:border-border",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-10 transition-opacity",
                  e.from,
                  e.to,
                  active ? "opacity-20" : "group-hover:opacity-15",
                )}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-glow",
                      e.from,
                      e.to,
                    )}
                  >
                    <Globe className="h-5 w-5" />
                  </div>
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-3 text-base font-semibold">{e.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{e.region}</div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-mono font-medium">{e.version}</span>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Health</span>
                      <span className="font-medium">{e.health}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${e.health}%` }}
                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                        className={cn("h-full rounded-full bg-gradient-to-r", e.from, e.to)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------- STEP 4: STRATEGY ------------------------- */
function StepStrategy({ value, onChange }: { value: Strategy; onChange: (s: Strategy) => void }) {
  return (
    <div className="pt-6">
      <div className="mb-4 text-sm text-muted-foreground">
        Pick how the new version rolls out. Each strategy has a different downtime and risk profile.
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {strategies.map((s, i) => {
          const active = value === s.key;
          return (
            <motion.button
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onChange(s.key)}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-5 text-left shadow-soft transition-all",
                "hover:-translate-y-0.5 hover:shadow-elevated",
                active
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border/60 bg-card hover:border-border",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {s.tag}
                </span>
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.div>
                )}
              </div>
              <div className="mt-3 text-lg font-semibold">{s.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>

              <StrategyVisual kind={s.key} />

              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <MiniStat label="Downtime" value={s.downtime} tone="success" />
                <MiniStat label="Base risk" value={`${s.risk}%`} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StrategyVisual({ kind }: { kind: Strategy }) {
  if (kind === "rolling") {
    return (
      <div className="mt-4 flex items-end gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ backgroundColor: "var(--color-muted)" }}
            animate={{ backgroundColor: ["var(--color-muted)", "var(--color-primary)", "var(--color-primary)"] }}
            transition={{ delay: i * 0.15, duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
            className="h-6 flex-1 rounded-md"
          />
        ))}
      </div>
    );
  }
  if (kind === "blue-green") {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        <motion.div
          animate={{ opacity: [1, 0.4, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-10 rounded-lg bg-info/60"
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-10 rounded-lg bg-success/70"
        />
      </div>
    );
  }
  return (
    <div className="mt-4 h-10 overflow-hidden rounded-lg bg-muted">
      <motion.div
        animate={{ width: ["5%", "25%", "50%", "100%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="h-full bg-gradient-primary"
      />
    </div>
  );
}

/* ------------------------ STEP 5: CONFIG ---------------------------- */
function StepConfig({ value, onChange }: { value: Config; onChange: (c: Config) => void }) {
  return (
    <div className="pt-6">
      <div className="mb-4 text-sm text-muted-foreground">
        Fine-tune the pipeline. Recommended defaults keep production shipping green.
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {configItems.map((item, i) => {
          const Icon = item.icon;
          const on = value[item.key];
          return (
            <motion.label
              key={item.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all",
                on
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/60 bg-card hover:border-border",
              )}
            >
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors",
                  on ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{item.label}</div>
                  {item.recommended && (
                    <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-success">
                      recommended
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{item.description}</div>
              </div>
              <Switch checked={on} onCheckedChange={(v) => onChange({ ...value, [item.key]: v })} />
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------ STEP 6: REVIEW ---------------------------- */
function StepReview({
  repo,
  branch,
  env,
  strategy,
  config,
  estTime,
  risk,
}: {
  repo: Repo;
  branch: (typeof branchesByRepo)["default"][number];
  env: Env;
  strategy: Strategy;
  config: Config;
  estTime: number;
  risk: number;
}) {
  const envInfo = environments.find((e) => e.key === env)!;
  const strat = strategies.find((s) => s.key === strategy)!;
  const enabled = configItems.filter((c) => config[c.key]);

  return (
    <div className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-40" />
          <div className="relative flex items-center gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded-xl"
              style={{ backgroundColor: repo.languageColor + "22" }}
            >
              <div
                className="mx-auto mt-3 h-4 w-4 rounded-full"
                style={{ backgroundColor: repo.languageColor }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold">{repo.name}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <GitBranch className="h-3 w-3" />
                {branch.name}
                <span>·</span>
                <span className="font-mono">{branch.commit}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {strat.label}
              </div>
              <div className="mt-0.5 text-xs">→ {envInfo.label}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="mb-3 text-sm font-semibold">Environment comparison</div>
          <div className="grid grid-cols-3 gap-3">
            <ComparePill label="Region" from={envInfo.region.split(" · ")[0]} to={envInfo.region.split(" · ")[0]} />
            <ComparePill label="Version" from={envInfo.version} to={`${envInfo.version.split("-")[0]}+${branch.commit.slice(0, 4)}`} />
            <ComparePill label="Replicas" from="6" to="6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Diff summary</div>
            <span className="text-[11px] text-muted-foreground">since last deploy · 14 commits</span>
          </div>
          <div className="space-y-2 text-xs">
            <DiffRow op="+" file="src/inference/batcher.ts" delta="+142 −8" />
            <DiffRow op="~" file="src/runtime/worker-pool.ts" delta="+34 −22" />
            <DiffRow op="+" file="src/api/streaming.ts" delta="+88 −0" />
            <DiffRow op="−" file="src/legacy/tokenizer-v1.ts" delta="+0 −310" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <StatBox label="Estimated deploy time" value={`${Math.floor(estTime / 60)}m ${estTime % 60}s`} icon={Zap} />
        <StatBox label="Estimated downtime" value="0s" tone="success" icon={ShieldCheck} />
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">Risk score</span>
            <span
              className={cn(
                "text-lg font-bold tabular-nums",
                risk < 25 ? "text-success" : risk < 55 ? "text-warning-foreground" : "text-destructive",
              )}
            >
              {risk}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${risk}%` }}
              transition={{ duration: 0.6 }}
              className={cn(
                "h-full rounded-full",
                risk < 25 ? "bg-success" : risk < 55 ? "bg-warning" : "bg-destructive",
              )}
            />
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {risk < 25 ? "Low — safe to ship." : risk < 55 ? "Moderate — monitor closely." : "High — consider canary."}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pipeline steps
          </div>
          <ul className="space-y-1.5">
            {enabled.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.key} className="flex items-center gap-2 text-xs">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span>{c.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ComparePill({ label, from, to }: { label: string; from: string; to: string }) {
  const changed = from !== to;
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-1 text-xs">
        <span className="truncate text-muted-foreground line-through">{from}</span>
        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className={cn("truncate font-medium", changed ? "text-primary" : "")}>{to}</span>
      </div>
    </div>
  );
}

function DiffRow({ op, file, delta }: { op: "+" | "−" | "~"; file: string; delta: string }) {
  const tone = op === "+" ? "text-success" : op === "−" ? "text-destructive" : "text-info";
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/30 px-2.5 py-1.5">
      <span className={cn("w-3 text-center font-mono font-bold", tone)}>{op}</span>
      <span className="min-w-0 flex-1 truncate font-mono text-[11px]">{file}</span>
      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{delta}</span>
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "success";
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            tone === "success" ? "bg-success/10 text-success" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

/* ----------------------- DEPLOY PIPELINE ---------------------------- */
function DeployPipeline({
  env,
  repo,
  onComplete,
}: {
  env: Env;
  repo: Repo;
  onComplete: () => void;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{ t: string; line: string; tone: "muted" | "ok" | "info" }[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let cancelled = false;

    async function run() {
      const start = Date.now();
      for (let i = 0; i < pipelineStages.length; i++) {
        if (cancelled) return;
        setStageIndex(i);
        const stage = pipelineStages[i];
        // stream logs
        for (let j = 0; j < stage.logs.length; j++) {
          if (cancelled) return;
          await sleep(280 + Math.random() * 240);
          const line = stage.logs[j].replace("{env}", env);
          const tone: "muted" | "ok" | "info" = line.startsWith("✔")
            ? "ok"
            : line.startsWith("$")
              ? "info"
              : "muted";
          setLogs((l) => [
            ...l,
            {
              t: fmtElapsed(Date.now() - start),
              line,
              tone,
            },
          ]);
          setProgress(((i + (j + 1) / stage.logs.length) / pipelineStages.length) * 100);
        }
        await sleep(180);
      }
      if (!cancelled) {
        setProgress(100);
        await sleep(400);
        // Push to store
        pushDeployment({
          id: `d-${Date.now()}`,
          service: repo.name,
          env,
          status: "success",
          commit: Math.random().toString(16).slice(2, 9),
          message: "feat: new deployment via pipeline",
          author: "Anannya Mitra",
          duration: fmtElapsed(Date.now() - start),
          time: "just now",
        });
        pushNotification({
          id: `n-${Date.now()}`,
          kind: "deploy",
          title: `${repo.name} deployed to ${env}`,
          body: "Deployment completed successfully.",
          time: "just now",
          read: false,
        });
        onComplete();
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [env, repo, onComplete]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="grid grid-cols-1 gap-4 pt-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Pipeline</div>
            <div className="text-[11px] font-mono text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="mb-4 h-1.5" />
          <ol className="space-y-1.5">
            {pipelineStages.map((s, i) => {
              const state: StageState = i < stageIndex ? "done" : i === stageIndex ? "running" : "pending";
              return (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
                    state === "done" && "border-success/30 bg-success/5",
                    state === "running" && "border-primary/40 bg-primary/5",
                    state === "pending" && "border-border/50 bg-background/30",
                  )}
                >
                  <div className="grid h-6 w-6 place-items-center">
                    {state === "done" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </motion.div>
                    )}
                    {state === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {state === "pending" && (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      state === "pending" && "text-muted-foreground",
                      state === "running" && "font-medium",
                    )}
                  >
                    {s.label}
                    {state === "running" && "…"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="lg:col-span-3">
        <TerminalPanel logs={logs} innerRef={logRef} />
      </div>
    </div>
  );
}

function fmtElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/* ----------------------- TERMINAL ---------------------------- */
function TerminalPanel({
  logs,
  innerRef,
  compact,
}: {
  logs: { t: string; line: string; tone: "muted" | "ok" | "info" }[];
  innerRef?: React.RefObject<HTMLDivElement | null>;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = query ? logs.filter((l) => l.line.toLowerCase().includes(query.toLowerCase())) : logs;

  return (
    <div className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-[oklch(0.12_0.02_265)] shadow-elevated">
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/30 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="ml-2 flex items-center gap-1.5 text-[11px] font-medium text-white/70">
          <Terminal className="h-3 w-3" /> pipeline.log
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 sm:flex">
            <Search className="h-3 w-3 text-white/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-4 w-28 border-0 bg-transparent text-[11px] text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(logs.map((l) => l.line).join("\n"))}
            className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Copy logs"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              const blob = new Blob([logs.map((l) => `[${l.t}] ${l.line}`).join("\n")], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "deployment-logs.txt";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Download logs"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div
        ref={innerRef}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed",
          compact && "max-h-72",
        )}
      >
        {filtered.length === 0 && <div className="text-white/40">Waiting for logs…</div>}
        {filtered.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <span className="w-12 shrink-0 text-white/30">{l.t}</span>
            <span
              className={cn(
                "min-w-0 flex-1 whitespace-pre-wrap break-words",
                l.tone === "muted" && "text-white/75",
                l.tone === "ok" && "text-emerald-300",
                l.tone === "info" && "text-sky-300",
              )}
            >
              {l.line}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- SUCCESS ---------------------------- */
function SuccessScreen({
  repo,
  branch,
  env,
  strategy,
  onDeployAgain,
  onClose,
}: {
  repo: Repo;
  branch: (typeof branchesByRepo)["default"][number];
  env: Env;
  strategy: Strategy;
  onDeployAgain: () => void;
  onClose: () => void;
}) {
  const deployId = useMemo(
    () => "dep_" + Math.random().toString(36).slice(2, 10),
    [],
  );
  const stats = [
    { label: "Deployment ID", value: deployId, mono: true },
    { label: "Commit", value: branch.commit, mono: true },
    { label: "Version", value: `v4.13.0+${branch.commit.slice(0, 4)}`, mono: true },
    { label: "Environment", value: environments.find((e) => e.key === env)!.label },
    { label: "Duration", value: "2m 48s" },
    { label: "Pipeline time", value: "3m 12s" },
  ];
  return (
    <div className="pt-8">
      <div className="relative mx-auto mb-6 grid h-28 w-28 place-items-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.6, 1.3], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-success/40"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-glow"
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.svg>
        </motion.div>
      </div>
      <div className="text-center">
        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-semibold tracking-tight"
        >
          <span className="text-gradient">{repo.name}</span> is live on {env}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-1 text-sm text-muted-foreground"
        >
          {strategies.find((s) => s.key === strategy)!.label} rollout completed with all health checks green.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
            <div
              className={cn("mt-1 truncate text-sm font-semibold", s.mono && "font-mono")}
            >
              {s.value}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" className="rounded-xl">
          <History className="mr-2 h-4 w-4" /> View logs
        </Button>
        <Button variant="outline" className="rounded-xl">
          <RotateCcw className="mr-2 h-4 w-4" /> Rollback
        </Button>
        <Button
          onClick={onDeployAgain}
          className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
        >
          <Play className="mr-2 h-4 w-4" /> Deploy again
        </Button>
        <Button variant="ghost" className="rounded-xl" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Confetti dots */}
      <div className="pointer-events-none absolute inset-x-0 top-24 -z-0 flex justify-center gap-2 overflow-hidden">
        {[...Array(18)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 240, opacity: [0, 1, 0], rotate: 360 }}
            transition={{ duration: 1.6 + (i % 5) * 0.3, delay: i * 0.05, repeat: 0 }}
            style={{
              background: ["#8b5cf6", "#22d3ee", "#f472b6", "#34d399", "#f59e0b"][i % 5],
            }}
            className="block h-1.5 w-1.5 rounded-sm"
          />
        ))}
      </div>
    </div>
  );
}
