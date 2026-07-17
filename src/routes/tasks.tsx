import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { tasks, type Task } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks · InsightFlow" },
      { name: "description", content: "Kanban board of engineering tasks with priority, assignees and due dates." },
    ],
  }),
  component: TasksPage,
});

const columns: { key: Task["status"]; label: string; tone: string }[] = [
  { key: "backlog", label: "Backlog", tone: "bg-muted text-muted-foreground" },
  { key: "in-progress", label: "In progress", tone: "bg-info/10 text-info" },
  { key: "review", label: "In review", tone: "bg-warning/15 text-warning-foreground" },
  { key: "done", label: "Done", tone: "bg-success/10 text-success" },
];

const priorityStyle: Record<Task["priority"], string> = {
  urgent: "bg-destructive/10 text-destructive",
  high: "bg-warning/15 text-warning-foreground",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

function TasksPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Work"
        title="Tasks"
        description="Everything in flight across the platform, research and DX teams."
        actions={
          <Button className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> New task
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="flex min-h-[400px] flex-col rounded-2xl border border-border/60 bg-card/60 p-3 shadow-soft">
              <div className="mb-2 flex items-center justify-between px-2 pt-1">
                <div className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${col.tone}`}>
                  {col.label}
                  <span className="rounded-full bg-background/80 px-1.5 py-0 text-[10px] text-foreground">
                    {items.length}
                  </span>
                </div>
                <button className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-muted">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-1">
                {items.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -2 }}
                    className="cursor-grab rounded-xl border border-border/60 bg-card p-3 shadow-soft"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${priorityStyle[t.priority]}`}>
                        {t.priority}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{t.tag}</span>
                    </div>
                    <div className="text-sm font-medium leading-snug">{t.title}</div>
                    {t.progress > 0 && t.progress < 100 && (
                      <div className="mt-2">
                        <Progress value={t.progress} className="h-1" />
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-semibold text-white">
                        {t.assignee}
                      </div>
                      <div className="text-[11px] text-muted-foreground">Due {t.due}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}