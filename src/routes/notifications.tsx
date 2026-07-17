import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, MessageCircle, Rocket, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { notifications, type AppNotification } from "@/lib/mock-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · InsightFlow" },
      { name: "description", content: "All incidents, deployments, mentions and AI insights, grouped and filterable." },
    ],
  }),
  component: NotificationsPage,
});

const kindStyles: Record<AppNotification["kind"], { icon: any; tone: string; label: string }> = {
  incident: { icon: AlertTriangle, tone: "text-destructive bg-destructive/10", label: "Incident" },
  deploy: { icon: Rocket, tone: "text-info bg-info/10", label: "Deploy" },
  mention: { icon: MessageCircle, tone: "text-primary bg-primary/10", label: "Mention" },
  insight: { icon: Sparkles, tone: "text-success bg-success/10", label: "Insight" },
};

function NotificationsPage() {
  const grouped = notifications.reduce<Record<string, AppNotification[]>>((acc, n) => {
    (acc[n.read ? "Earlier" : "New"] ??= []).push(n);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Grouped by recency. Incidents, deploys, mentions and AI signals in one thread."
      />

      <div className="space-y-6">
        {(["New", "Earlier"] as const).map((section) =>
          grouped[section]?.length ? (
            <div key={section}>
              <div className="mb-2 px-1 text-xs font-medium uppercase tracking-widest text-muted-foreground/80">
                {section}
              </div>
              <div className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card shadow-soft">
                {grouped[section].map((n, i) => {
                  const s = kindStyles[n.kind];
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${s.tone}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{n.title}</span>
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                            {s.label}
                          </span>
                          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </div>
                        <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{n.time}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}