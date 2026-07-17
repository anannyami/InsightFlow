import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Blocks,
  Copy,
  GitBranch,
  Rocket,
  Send,
  Shield,
  Sparkles,
  Square,
  Zap,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { chatQuickPrompts, mockAssistantAnswer } from "@/lib/ai-mock";
import { consumeSeed, useAiChatState, closeAiChat } from "@/lib/ai-chat-store";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  time: string;
};

const iconMap = { GitBranch, AlertTriangle, Blocks, Zap, Shield, Rocket } as const;

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <div key={i} className="mt-2 text-sm font-semibold text-foreground">
          {line.slice(2, -2)}
        </div>
      );
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-2 text-sm text-foreground/90">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span>{inline(line.slice(2))}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      return (
        <div key={i} className="text-sm text-foreground/90">
          {inline(line)}
        </div>
      );
    }
    return (
      <div key={i} className="text-sm leading-relaxed text-foreground/90">
        {inline(line)}
      </div>
    );
  });
}

function inline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={i} className="rounded-md bg-muted px-1 py-0.5 font-mono text-[12px] text-foreground">
          {p.slice(1, -1)}
        </code>
      );
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      );
    return <span key={i}>{p}</span>;
  });
}

export function AiChatPanel() {
  const { open } = useAiChatState();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const stopRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const seed = consumeSeed();
    if (seed) send(seed);
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setInput("");
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: clean, time: nowTime() };
    const asstId = crypto.randomUUID();
    const asstMsg: Msg = { id: asstId, role: "assistant", content: "", streaming: true, time: nowTime() };
    setMessages((m) => [...m, userMsg, asstMsg]);
    setBusy(true);
    stopRef.current = false;

    const full = mockAssistantAnswer(clean);
    // simulate streaming
    let i = 0;
    const step = Math.max(2, Math.floor(full.length / 90));
    await new Promise((r) => setTimeout(r, 450));
    while (i < full.length) {
      if (stopRef.current) break;
      i = Math.min(full.length, i + step);
      const chunk = full.slice(0, i);
      setMessages((m) => m.map((x) => (x.id === asstId ? { ...x, content: chunk } : x)));
      await new Promise((r) => setTimeout(r, 22));
    }
    setMessages((m) => m.map((x) => (x.id === asstId ? { ...x, streaming: false } : x)));
    setBusy(false);
  }

  const isEmpty = messages.length === 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && closeAiChat()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-border/60 bg-background/95 p-0 backdrop-blur-2xl sm:max-w-[520px]"
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 6, -4, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow"
            >
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <div className="min-w-0 flex-1 text-left">
              <SheetTitle className="text-sm font-semibold tracking-tight">
                InsightFlow AI
              </SheetTitle>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                Online · gpt-flow-4o · 94% confidence
              </div>
            </div>
          </div>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {isEmpty ? <EmptyState onPick={send} /> : (
            <div className="space-y-4">
              {messages.map((m) => (
                <Bubble key={m.id} msg={m} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border/60 bg-card/40 p-3">
          <div className="rounded-2xl border border-border/70 bg-card shadow-soft focus-within:border-primary/50 focus-within:shadow-glow">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about a repo, incident, deployment…"
              rows={1}
              className="max-h-40 min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between gap-2 px-3 pb-2">
              <div className="text-[11px] text-muted-foreground">
                Shift + Enter for newline
              </div>
              {busy ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => (stopRef.current = true)}
                  className="h-8 rounded-lg"
                >
                  <Square className="mr-1.5 h-3 w-3 fill-current" /> Stop
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => send(input)}
                  disabled={!input.trim()}
                  className="h-8 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow"
                >
                  <Send className="mr-1.5 h-3 w-3" /> Send
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EmptyState({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="flex h-full flex-col justify-center py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="mt-4 text-lg font-semibold tracking-tight">
          Ask <span className="text-gradient">InsightFlow AI</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Code, deployments, incidents, architecture, security — grounded in your platform.
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2">
        {chatQuickPrompts.map((q, i) => {
          const Icon = iconMap[q.icon as keyof typeof iconMap] ?? Sparkles;
          return (
            <motion.button
              key={q.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              onClick={() => onPick(q.prompt)}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-3 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              <Icon className="mb-2 h-4 w-4 text-primary" />
              <div className="text-xs font-semibold">{q.label}</div>
              <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                {q.prompt}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  const canCopy = useMemo(() => !msg.streaming && !isUser, [msg.streaming, isUser]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div className={cn("group max-w-[85%]", isUser ? "text-right" : "")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm shadow-soft",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border/60 bg-card",
          )}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{msg.content}</div>
          ) : (
            <div className="space-y-0.5">
              {msg.content ? (
                renderMarkdown(msg.content)
              ) : (
                <TypingDots />
              )}
              {msg.streaming && msg.content && (
                <motion.span
                  className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 rounded-sm bg-primary"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
              )}
            </div>
          )}
        </div>
        <div className={cn("mt-1 flex items-center gap-2 text-[10px] text-muted-foreground", isUser ? "justify-end" : "")}>
          <span>{msg.time}</span>
          <AnimatePresence>
            {canCopy && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => navigator.clipboard.writeText(msg.content)}
                className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-muted hover:text-foreground"
              >
                <Copy className="h-3 w-3" /> Copy
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}
