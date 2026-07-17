import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { team, type TeamMember } from "@/lib/mock-data";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team · InsightFlow" },
      { name: "description", content: "Your engineering team — availability, performance and activity at a glance." },
    ],
  }),
  component: TeamPage,
});

const availLabel: Record<TeamMember["availability"], { label: string; dot: string; tone: string }> = {
  online: { label: "Online", dot: "bg-success", tone: "text-success" },
  focus: { label: "In focus", dot: "bg-info", tone: "text-info" },
  away: { label: "Away", dot: "bg-warning", tone: "text-warning-foreground" },
  offline: { label: "Offline", dot: "bg-muted-foreground/40", tone: "text-muted-foreground" },
};

function Bars({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-8 items-end gap-1">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.04, duration: 0.4 }}
          className="w-1.5 rounded-sm bg-primary/60"
        />
      ))}
    </div>
  );
}

function TeamPage() {
  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Team"
        description="8 people building the InsightFlow platform across 6 time zones."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {team.map((m, i) => {
          const a = availLabel[m.availability];
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft card-hover"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${m.color} text-sm font-semibold text-white shadow-soft`}
                  >
                    {m.initials}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${a.dot}`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{m.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.role}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className={`flex items-center gap-1.5 ${a.tone}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
                  {a.label}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {m.location}
                </div>
              </div>
              <div className="flex items-end justify-between border-t border-border/60 pt-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Performance
                  </div>
                  <div className="text-lg font-semibold tabular-nums">{m.performance}</div>
                </div>
                <Bars data={m.activity} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}