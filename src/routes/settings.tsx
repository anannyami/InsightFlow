import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · InsightFlow" },
      { name: "description", content: "Workspace, profile, notifications and API settings for InsightFlow." },
    ],
  }),
  component: SettingsPage,
});

const tabs = ["Profile", "Workspace", "Notifications", "API keys", "Billing"] as const;

function SettingsPage() {
  const [active, setActive] = useState<(typeof tabs)[number]>("Profile");
  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Tune your workspace, profile and notification preferences."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex flex-row gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card p-2 shadow-soft lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                active === t ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {active === "Profile" && (
            <SectionCard title="Profile" description="How you appear across InsightFlow">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-semibold text-white">
                  AC
                </div>
                <div>
                  <Button variant="outline" size="sm" className="rounded-xl">Upload photo</Button>
                  <div className="mt-1 text-xs text-muted-foreground">PNG or JPG · up to 2 MB</div>
                </div>
              </div>
              <Separator className="my-5" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input defaultValue="Anannya Mitra" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input defaultValue="anannya@insightflow.ai" />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input defaultValue="Staff Engineer · ML" />
                </div>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Input defaultValue="India/Bengaluru" />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <Button className="rounded-xl">Save changes</Button>
              </div>
            </SectionCard>
          )}

          {active === "Workspace" && (
            <SectionCard title="Workspace" description="Shared settings for everyone in InsightFlow">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Workspace name</Label>
                  <Input defaultValue="InsightFlow" />
                </div>
                <div className="space-y-1.5">
                  <Label>Subdomain</Label>
                  <Input defaultValue="insightflow.app" />
                </div>
              </div>
            </SectionCard>
          )}

          {active === "Notifications" && (
            <SectionCard title="Notifications" description="Choose what reaches you and where">
              {[
                { k: "Deployments", d: "Every deploy, with status and duration" },
                { k: "Incidents", d: "Elevated errors, degraded latency, on-call pages" },
                { k: "Mentions", d: "When teammates @mention you in threads" },
                { k: "AI insights", d: "Weekly summary of high-impact recommendations" },
              ].map((r, i) => (
                <div key={r.k}>
                  {i > 0 && <Separator className="my-4" />}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">{r.k}</div>
                      <div className="text-xs text-muted-foreground">{r.d}</div>
                    </div>
                    <Switch defaultChecked={i !== 3} />
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {active === "API keys" && (
            <SectionCard title="API keys" description="Programmatic access to the InsightFlow API">
              <div className="space-y-2">
                {[
                  { name: "Production", key: "sk_live_••••••••ab21", used: "12m ago" },
                  { name: "Staging", key: "sk_test_••••••••9f04", used: "2h ago" },
                ].map((k) => (
                  <div key={k.name} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                    <div>
                      <div className="text-sm font-medium">{k.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{k.key}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Last used {k.used}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" className="rounded-xl">Create new key</Button>
              </div>
            </SectionCard>
          )}

          {active === "Billing" && (
            <SectionCard title="Billing" description="You're on the Scale plan">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-semibold">$1,240 <span className="text-sm font-normal text-muted-foreground">/ mo</span></div>
                  <div className="text-xs text-muted-foreground">Renews Dec 1 · 42 seats</div>
                </div>
                <Button variant="outline" className="rounded-xl">Manage plan</Button>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}