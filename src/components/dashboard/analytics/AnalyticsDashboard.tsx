"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList,
} from "recharts";
import { TrendingUp, Building2, MessageSquare, CalendarCheck, Users2 } from "lucide-react";
import { LEAD_STAGE_LABELS, LEAD_SOURCE_LABELS } from "@/lib/utils/constants";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface AnalyticsDashboardProps {
  leadStats: {
    total: number; active: number; converted: number; lost: number;
    conversionRate: number; byStage: Record<string, number>; bySource: Record<string, number>;
  } | null;
  propertyStats: {
    total: number; active: number; sold: number; blocked: number;
    featured: number; byType: Record<string, number>;
  } | null;
  enquiryStats: { new: number; reviewed: number; converted: number; total: number } | null;
  visitStats: {
    total: number; scheduled: number; completed: number;
    noShow: number; thisWeek: number; conversionRate: number;
  } | null;
}

// ─── COLORS ───────────────────────────────────────────────────────────────────

const GOLD    = "#C9A96E";
const GOLD2   = "#E2C99A";
const EMERALD = "#34D399";
const BLUE    = "#60A5FA";
const PURPLE  = "#A78BFA";
const RED     = "#F87171";
const ORANGE  = "#FB923C";
const PINK    = "#F472B6";

const STAGE_COLORS: Record<string, string> = {
  new:                  BLUE,
  contacted:            "#FBBF24",
  qualified:            PURPLE,
  site_visit_scheduled: ORANGE,
  negotiation:          PINK,
  converted:            EMERALD,
  lost:                 RED,
};

const PIE_COLORS = [GOLD, EMERALD, BLUE, PURPLE, ORANGE, PINK, RED];

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name?: string }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-white/[0.1] rounded-xl px-4 py-3 shadow-xl">
      {label && <p className="text-xs text-[#5A7080] mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium text-white">
          {p.name && <span className="text-muted-foreground mr-1">{p.name}:</span>}
          {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── KPI CARD ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color, bg }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#5A7080] uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="font-serif text-3xl font-medium text-white">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-sm font-medium text-white mb-5 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function AnalyticsDashboard({
  leadStats, propertyStats, enquiryStats, visitStats,
}: AnalyticsDashboardProps) {

  // Pipeline funnel data
  const funnelData = leadStats?.byStage
    ? Object.entries(leadStats.byStage)
        .filter(([s]) => s !== "lost")
        .map(([stage, count]) => ({
          name: LEAD_STAGE_LABELS[stage] ?? stage,
          value: count as number,
          fill: STAGE_COLORS[stage] ?? GOLD,
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  // Source bar data
  const sourceData = leadStats?.bySource
    ? Object.entries(leadStats.bySource)
        .map(([source, count]) => ({
          source: LEAD_SOURCE_LABELS[source] ?? source,
          count: count as number,
        }))
        .sort((a, b) => b.count - a.count)
    : [];

  // Property type pie
  const typeData = propertyStats?.byType
    ? Object.entries(propertyStats.byType).map(([type, count]) => ({
        name: type, value: count as number,
      }))
    : [];

  // Enquiry status pie
  const enquiryData = enquiryStats
    ? [
        { name: "New",       value: enquiryStats.new,       fill: BLUE },
        { name: "Reviewed",  value: enquiryStats.reviewed,  fill: "#FBBF24" },
        { name: "Converted", value: enquiryStats.converted, fill: EMERALD },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-medium text-white">Analytics</h1>
        <p className="text-sm text-[#5A7080] mt-1">
          Business performance overview across all modules.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Leads"
          value={leadStats?.total ?? "—"}
          sub={`${leadStats?.conversionRate ?? 0}% conversion rate`}
          icon={Users2}
          color="text-primary"
          bg="bg-primary/10"
        />
        <KpiCard
          label="Enquiries"
          value={enquiryStats?.total ?? "—"}
          sub={`${enquiryStats?.converted ?? 0} converted to leads`}
          icon={MessageSquare}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <KpiCard
          label="Site Visits"
          value={visitStats?.total ?? "—"}
          sub={`${visitStats?.conversionRate ?? 0}% visit-to-convert rate`}
          icon={CalendarCheck}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <KpiCard
          label="Active Properties"
          value={propertyStats?.active ?? "—"}
          sub={`${propertyStats?.sold ?? 0} sold`}
          icon={Building2}
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Lead pipeline funnel */}
        <Section title="Lead Pipeline Funnel">
          {funnelData.length === 0
            ? <EmptyChart message="No leads yet to show pipeline data." />
            : (
              <ResponsiveContainer width="100%" height={240}>
                <FunnelChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Funnel data={funnelData} dataKey="value" isAnimationActive>
                    <LabelList
                      position="right"
                      fill="#8A9BAE"
                      stroke="none"
                      dataKey="name"
                      style={{ fontSize: 11 }}
                    />
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            )}
        </Section>

        {/* Lead sources */}
        <Section title="Lead Sources">
          {sourceData.length === 0
            ? <EmptyChart message="No leads yet to show source data." />
            : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sourceData} layout="vertical" margin={{ left: 8, right: 24 }}>
                  <XAxis type="number" tick={{ fill: "#3A5060", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="source" type="category" tick={{ fill: "#8A9BAE", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" fill={GOLD} radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </Section>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Property type distribution */}
        <Section title="Properties by Type">
          {typeData.length === 0
            ? <EmptyChart message="No property data." />
            : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {typeData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {typeData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </Section>

        {/* Enquiry status breakdown */}
        <Section title="Enquiry Status">
          {enquiryData.length === 0
            ? <EmptyChart message="No enquiry data." />
            : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={enquiryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {enquiryData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {enquiryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: item.fill }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </Section>

        {/* Site visit summary */}
        <Section title="Site Visit Outcomes">
          {!visitStats || visitStats.total === 0
            ? <EmptyChart message="No site visit data yet." />
            : (
              <div className="space-y-4 py-2">
                {[
                  { label: "Scheduled",  value: visitStats.scheduled,  color: BLUE,    max: visitStats.total },
                  { label: "Completed",  value: visitStats.completed,  color: EMERALD, max: visitStats.total },
                  { label: "No Show",    value: visitStats.noShow,     color: RED,     max: visitStats.total },
                  { label: "This Week",  value: visitStats.thisWeek,   color: GOLD,    max: Math.max(visitStats.thisWeek, visitStats.total) },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#5A7080]">{item.label}</span>
                      <span className="text-white font-medium">{item.value}</span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${item.max > 0 ? Math.round((item.value / item.max) * 100) : 0}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#5A7080]">Visit → Convert Rate</span>
                    <span className="text-primary font-medium">{visitStats.conversionRate}%</span>
                  </div>
                </div>
              </div>
            )}
        </Section>
      </div>

      {/* Stage breakdown table */}
      {leadStats && Object.keys(leadStats.byStage).length > 0 && (
        <Section title="Lead Stage Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Stage", "Count", "% of Total", "Status"].map((h) => (
                    <th key={h} className="text-left text-[10px] text-muted-foreground uppercase tracking-widest font-medium pb-3 pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(leadStats.byStage)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([stage, count]) => {
                    const pct = leadStats.total > 0 ? Math.round(((count as number) / leadStats.total) * 100) : 0;
                    const isGood = stage === "converted";
                    const isBad  = stage === "lost";
                    return (
                      <tr key={stage} className="border-b border-white/[0.04] last:border-0">
                        <td className="py-3 pr-6">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[stage] ?? GOLD }} />
                            <span className="text-sm text-muted-foreground">{LEAD_STAGE_LABELS[stage] ?? stage}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-6 text-sm font-medium text-white">{count as number}</td>
                        <td className="py-3 pr-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[100px] bg-accent rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full"
                                style={{ width: `${pct}%`, background: STAGE_COLORS[stage] ?? GOLD }}
                              />
                            </div>
                            <span className="text-xs text-[#5A7080] w-8">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isGood ? "bg-emerald-500/10 text-emerald-400" :
                            isBad  ? "bg-red-500/10 text-red-400" :
                                     "bg-accent text-[#5A7080]"
                          }`}>
                            {isGood ? "Closed Won" : isBad ? "Closed Lost" : "Active"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}
