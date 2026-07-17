import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { reports } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · InsightFlow" },
      { name: "description", content: "Scheduled and on-demand engineering reports, ready to download or share." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Reports"
        title="Reports"
        description="Curated exports of the metrics your leadership team asks about most."
        actions={
          <Button className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <FileText className="mr-2 h-4 w-4" /> New report
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft card-hover"
          >
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {r.type}
              </span>
            </div>
            <div>
              <div className="text-base font-semibold">{r.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{r.period}</div>
            </div>
            <div className="mt-auto flex items-end justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <div>
                <div className="text-[10px] uppercase tracking-wide">Last generated</div>
                <div className="font-medium text-foreground">{r.updatedAt}</div>
              </div>
              <Button size="sm" variant="ghost" className="h-8 rounded-lg">
                <Download className="mr-1.5 h-3.5 w-3.5" /> {r.size}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}