import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { GitCommit, Rocket } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { type Deployment } from "@/lib/mock-data";
import { useDeployments } from "@/lib/deployment-store";
import { Button } from "@/components/ui/button";
import { NewDeploymentDialog } from "@/components/deployments/new-deployment-dialog";

export const Route = createFileRoute("/deployments")({
  head: () => ({
    meta: [
      { title: "Deployments · InsightFlow" },
      { name: "description", content: "Deployment timeline across production, staging and development environments." },
    ],
  }),
  component: DeploymentsPage,
});

const statusStyle: Record<Deployment["status"], { dot: string; label: string; pill: string }> = {
  success: { dot: "bg-success", label: "Success", pill: "bg-success/10 text-success" },
  running: { dot: "bg-info animate-pulse", label: "Running", pill: "bg-info/10 text-info" },
  queued: { dot: "bg-warning", label: "Queued", pill: "bg-warning/15 text-warning-foreground" },
  failed: { dot: "bg-destructive", label: "Failed", pill: "bg-destructive/10 text-destructive" },
};

const envStyle: Record<Deployment["env"], string> = {
  production: "bg-primary/10 text-primary",
  staging: "bg-warning/15 text-warning-foreground",
  development: "bg-muted text-muted-foreground",
};

function DeploymentsPage() {
  const deployments = useDeployments();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <PageHeader
        eyebrow="Shipping"
        title="Deployments"
        description="Every deploy across every environment, wired into logs, traces and rollbacks."
        actions={
          <Button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
          >
            <Rocket className="mr-2 h-4 w-4" /> New deployment
          </Button>
        }
      />
      <NewDeploymentDialog open={open} onOpenChange={setOpen} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["success", "running", "queued", "failed"] as const).map((s, i) => {
          const count = deployments.filter((d: Deployment) => d.status === s).length;
          const st = statusStyle[s];
          return (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />
                <span className="text-xs font-medium text-muted-foreground">{st.label}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{count}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="mb-4 text-sm font-semibold">Deployment timeline</div>
        <ol className="relative space-y-4 pl-6">
          <span className="absolute bottom-2 left-2 top-2 w-px bg-border" />
          <AnimatePresence initial={false}>
          {deployments.map((d: Deployment, i: number) => {
            const st = statusStyle[d.status];
            return (
              <motion.li
                key={d.id}
                layout
                initial={{ opacity: 0, x: -12, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: Math.min(i, 6) * 0.04, type: "spring", stiffness: 300, damping: 28 }}
                className="relative"
              >
                <div className="absolute -left-6 top-2 grid h-4 w-4 place-items-center rounded-full bg-card ring-2 ring-border">
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                </div>
                <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/40 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{d.service}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${envStyle[d.env]}`}>
                        {d.env}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${st.pill}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <GitCommit className="mr-1 inline h-3 w-3" />
                      <span className="font-mono text-xs">{d.commit}</span> · {d.message}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground sm:text-right">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide">Author</div>
                      <div className="font-medium text-foreground">{d.author}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide">Duration</div>
                      <div className="font-medium text-foreground">{d.duration}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide">When</div>
                      <div className="font-medium text-foreground">{d.time}</div>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
          </AnimatePresence>
        </ol>
      </div>
    </div>
  );
}