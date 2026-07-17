import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle, Rocket, MessageCircle, Sparkles } from "lucide-react";
import { type AppNotification } from "@/lib/mock-data";
import { useNotifications } from "@/lib/deployment-store";

const kindStyles: Record<AppNotification["kind"], { icon: any; tone: string }> = {
  incident: { icon: AlertTriangle, tone: "text-destructive bg-destructive/10" },
  deploy: { icon: Rocket, tone: "text-info bg-info/10" },
  mention: { icon: MessageCircle, tone: "text-primary bg-primary/10" },
  insight: { icon: Sparkles, tone: "text-success bg-success/10" },
};

export function NotificationsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const notifications = useNotifications();
  const unread = notifications.filter((n: AppNotification) => !n.read).length;
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-3 top-3 bottom-3 z-50 flex w-[380px] max-w-[calc(100vw-1.5rem)] flex-col rounded-3xl border border-border/70 bg-card shadow-elevated"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <div className="text-sm font-semibold">Notifications</div>
                <div className="text-xs text-muted-foreground">
                  {unread} unread · updated a moment ago
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto p-3">
              {notifications.map((n: AppNotification, i: number) => {
                const style = kindStyles[n.kind];
                const Icon = style.icon;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-muted/60"
                  >
                    <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${style.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1 text-sm font-medium leading-snug">
                          {n.title}
                        </div>
                        {!n.read && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground/80">{n.time}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}