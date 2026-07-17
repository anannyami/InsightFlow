import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { NotificationsPanel } from "./notifications-panel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AiChatPanel } from "@/components/ai/ai-chat-panel";
import { openAiChat } from "@/lib/ai-chat-store";

export function AppShell({ children }: { children: ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative flex min-h-screen w-full bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-mesh opacity-60" />

      <div className="hidden md:block sticky top-0 h-screen">
        <AppSidebar />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 md:hidden">
          <AppSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar
          onOpenSearch={() => setCmdOpen(true)}
          onOpenNotifications={() => setNotifOpen(true)}
          onOpenMobileNav={() => setMobileOpen(true)}
          onOpenChat={() => openAiChat()}
        />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="mx-auto w-full max-w-7xl"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <AiChatPanel />
    </div>
  );
}