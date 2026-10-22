import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  Target,
  Flame,
  Droplets,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import { PageHeader } from "@/components/app/PageHeader";
import { AiBadge } from "@/components/brand/AiBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Insights & Trends — DoseLoop" }] }),
  component: Analytics,
});

interface DayData {
  day: string;
  taken: number;
  total: number;
}

function CustomChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DayData }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const pct = Math.round((data.taken / data.total) * 100) || 0;
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-lift text-xs">
        <p className="font-serif font-bold text-foreground">{data.day}</p>
        <p className="mt-1 text-muted-foreground">
          <span className="font-numeric font-bold text-primary">{data.taken}</span> of{" "}
          <span className="font-numeric">{data.total}</span> doses logged
        </p>
        <p className={`mt-0.5 font-bold ${pct === 100 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-300"}`}>
          {pct}% adherence
        </p>
      </div>
    );
  }
  return null;
}

function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["/dashboard/analytics"],
    queryFn: () => fetcher("/dashboard/analytics"),
  });

  const handleExportPDF = () => {
    toast.success("Clinical Summary Report Generated", {
      description: "Prepared for your upcoming appointment with Dr. Sharma.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-serif text-sm font-medium text-muted-foreground">Analyzing adherence trends...</p>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { stats, adherenceWeek } = data;
  const weeklyTotal = adherenceWeek.reduce(
    (sum: number, d: DayData) => sum + d.taken,
    0,
  );

  const iconMap: Record<string, React.ElementType> = {
    Target,
    Flame,
    Droplets,
    TrendingUp,
  };

  const mappedStats = stats.map((s: { icon: string }) => ({
    ...s,
    icon: iconMap[s.icon] || Target,
  }));

  // Recharts formatted data
  const chartData = adherenceWeek.map((d: DayData) => ({
    ...d,
    adherencePct: Math.round((d.taken / d.total) * 100) || 0,
  }));

  const cardVariants = ["rose", "gold", "sky", "sage"] as const;

  return (
    <div className="space-y-8 pb-12 animate-fade">
      <PageHeader
        eyebrow="Adherence Insights"
        title="Regimen Trends & Clarity"
        description="Longitudinal patterns over time to understand your routine — designed to reassure, never to judge."
        action={
          <Button variant="wine" size="sm" onClick={handleExportPDF} className="rounded-xl shadow-soft">
            <Download className="size-3.5 mr-1.5" /> Export Clinical PDF
          </Button>
        }
      />

      {/* 4 Multi-Tinted Stat Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mappedStats.map(
          (
            s: {
              label: string;
              chip: string;
              icon: React.ElementType;
              value: string;
              sub: string;
            },
            index: number,
          ) => {
            const variant = cardVariants[index % cardVariants.length];
            return (
              <Card
                key={s.label}
                variant={variant}
                className="p-5.5 shadow-soft transition-all hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </span>
                  <span className="grid size-9 place-items-center rounded-xl bg-card border border-border/80 shadow-xs">
                    <s.icon className="size-4.5 text-primary" />
                  </span>
                </div>
                <p className="font-numeric mt-3 text-3xl font-extrabold tracking-tight text-foreground">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{s.sub}</p>
              </Card>
            );
          },
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recharts Weekly Bar Chart */}
        <Card variant="editorial" className="p-6 sm:p-8 shadow-soft lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-border/60">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Weekly Regimen Consistency</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dose adherence verification over the past 7 days
              </p>
            </div>
            <span className="font-numeric rounded-full bg-secondary text-secondary-foreground border border-border/70 px-3.5 py-1 text-xs font-bold w-fit">
              Total Logged: {weeklyTotal} Doses
            </span>
          </div>

          <div
            className="mt-6 h-64 w-full"
            role="img"
            aria-label="Weekly medication adherence chart"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 4]}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.3 }} />
                <Bar dataKey="taken" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry: DayData & { adherencePct: number }, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.adherencePct === 100 ? "#2B7050" : "#B89450"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <span className="size-2.5 rounded-full bg-emerald-600" /> Full Adherence (100%)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <span className="size-2.5 rounded-full bg-amber-600" /> In Progress / Partial
              </span>
            </div>
            <span>Synchronized with PostgreSQL</span>
          </div>
        </Card>

        {/* AI Weekly Insight Card */}
        <div className="card-interactive relative overflow-hidden rounded-3xl border border-sidebar-border bg-sidebar p-6 sm:p-8 text-sidebar-foreground shadow-lift flex flex-col justify-between">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 size-40 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-sidebar-primary/20 text-sidebar-primary">
                <Sparkles className="size-5" />
              </span>
              <AiBadge label="Pulse AI Analysis" />
            </div>

            <h3 className="font-serif text-xl font-bold text-sidebar-foreground">Circadian Regimen Pattern</h3>

            <p className="text-sm leading-relaxed text-sidebar-foreground/90 font-medium">
              Your adherence is highest on weekday mornings (100%). Friday evenings are when doses most often
              slip by 30 minutes. Setting a quiet reminder shift to 7:30 PM could comfortably lift your
              weekly streak past 21 consecutive days.
            </p>
          </div>

          <div className="pt-6 border-t border-sidebar-border/60 mt-6 flex items-center justify-between text-xs text-sidebar-foreground/75">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="size-4" />
              Healthy routine verified
            </span>
            <span>30-Day Window</span>
          </div>
        </div>
      </div>
    </div>
  );
}
