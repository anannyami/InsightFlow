import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

function Sparkline({ data }: { data: number[] }) {
  const w = 100;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2}`)
    .join(" ");
  const area = `M0,${h} L${points.replaceAll(" ", " L")} L${w},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-24 overflow-visible">
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#spark)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

function AnimatedValue({ value }: { value: string }) {
  // For pure numeric values, animate. Otherwise render as-is.
  const numeric = value.replace(/[^0-9.]/g, "");
  const num = parseFloat(numeric);
  const prefix = value.startsWith("$") ? "$" : "";
  const suffixMatch = value.match(/(M|K|%)$/);
  const suffix = suffixMatch ? suffixMatch[1] : "";
  const isPlain = !Number.isNaN(num) && !value.includes(",") === false || !Number.isNaN(num);
  const [display, setDisplay] = useState(isPlain ? "0" : value);

  useEffect(() => {
    if (Number.isNaN(num)) {
      setDisplay(value);
      return;
    }
    const mv = { v: 0 };
    const controls = animate(mv.v, num, {
      duration: 1.1,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (latest) => {
        const formatted =
          suffix === "%"
            ? latest.toFixed(1)
            : suffix === "M"
              ? latest.toFixed(2)
              : suffix === "K"
                ? latest.toFixed(1)
                : Math.round(latest).toLocaleString();
        setDisplay(`${prefix}${formatted}${suffix}`);
      },
    });
    return () => controls.stop();
  }, [num, prefix, suffix, value]);

  return <span className="tabular-nums">{display}</span>;
}

export function MetricCard({
  label,
  value,
  delta,
  spark,
  index = 0,
}: {
  label: string;
  value: string;
  delta: number;
  spark: number[];
  index?: number;
}) {
  const positive = delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft card-hover"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div
          className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(delta).toFixed(1)}%
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold tracking-tight">
          <AnimatedValue value={value} />
        </div>
        <Sparkline data={spark} />
      </div>
    </motion.div>
  );
}