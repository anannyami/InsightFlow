import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { GitCommit, GitFork, Search, Star, AlertCircle, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { repositories } from "@/lib/mock-data";

export const Route = createFileRoute("/repositories")({
  head: () => ({
    meta: [
      { title: "Repositories · InsightFlow" },
      { name: "description", content: "All repositories, activity, and contributors across your workspace." },
    ],
  }),
  component: RepositoriesPage,
});

function ActivityBars({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-10 items-end gap-0.5">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.03, duration: 0.5, ease: "easeOut" }}
          className="w-1.5 rounded-sm bg-gradient-to-t from-primary/40 to-primary"
        />
      ))}
    </div>
  );
}

function RepositoriesPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "TypeScript" | "Rust" | "Python" | "Go">("all");
  const filtered = repositories.filter(
    (r) =>
      (filter === "all" || r.language === filter) &&
      (r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.description.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Code"
        title="Repositories"
        description="Everything shipping to production, staging and dev — all in one place."
        actions={<Button className="rounded-xl">New repository</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search repositories…"
            className="rounded-xl pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "TypeScript", "Rust", "Python", "Go"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f === "all" ? "All languages" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft card-hover"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{r.org}</div>
                <div className="truncate text-base font-semibold">{r.name}</div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: r.languageColor }}
                />
                {r.language}
              </span>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground">{r.description}</p>

            <ActivityBars data={r.activity} />

            <div className="grid grid-cols-4 gap-2 border-t border-border/60 pt-3 text-xs">
              <Stat icon={Star} label={r.stars.toLocaleString()} sub="Stars" />
              <Stat icon={GitCommit} label={r.commits.toLocaleString()} sub="Commits" />
              <Stat icon={Users} label={String(r.contributors)} sub="Contribs" />
              <Stat icon={AlertCircle} label={String(r.issues)} sub="Issues" />
            </div>
            <div className="text-[11px] text-muted-foreground">Updated {r.updatedAt}</div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  sub,
}: {
  icon: any;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-foreground">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm font-medium tabular-nums">{label}</span>
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{sub}</div>
    </div>
  );
}