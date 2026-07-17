import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, SectionCard } from "@/components/shared/page-header";
import { trafficData, revenueData, performanceData, errorBreakdown, heatmap } from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · InsightFlow" },
      { name: "description", content: "Traffic, performance, errors, growth and revenue analytics with beautiful charts." },
    ],
  }),
  component: AnalyticsPage,
});

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-md)",
};

function Heatmap() {
  const max = Math.max(...heatmap.map((c) => c.value));
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
      <div className="grid grid-rows-7 gap-1 py-1 text-[10px] text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="flex items-center">{d}</div>
        ))}
      </div>
      <div>
        <div className="grid grid-cols-24 gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0,1fr))" }}>
          {heatmap.map((c, i) => (
            <div
              key={i}
              className="aspect-square rounded-[3px]"
              style={{
                background: `color-mix(in oklab, var(--color-primary) ${Math.round((c.value / max) * 90 + 5)}%, transparent)`,
              }}
              title={`${c.day} ${c.hour}:00 · ${c.value}`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Signals"
        title="Analytics"
        description="Traffic, performance, errors and growth across the entire platform."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Traffic" description="Visits and unique users">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="a1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="visits" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#a1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Errors" description="Error breakdown by type">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={errorBreakdown} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={3}>
                  {errorBreakdown.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {errorBreakdown.map((e) => (
              <div key={e.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: e.color }} />
                  <span className="text-muted-foreground">{e.name}</span>
                </div>
                <span className="font-medium tabular-nums">{e.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Performance" description="Latency percentiles across 24h">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="p50" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p95" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p99" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Revenue growth" description="Monthly recurring revenue">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Weekly activity heatmap" description="Requests per hour of day, by day of week">
        <Heatmap />
      </SectionCard>
    </div>
  );
}