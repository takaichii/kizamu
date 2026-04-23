"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type DailyStat = { date: string; mood: number | null; achievementCount: number };
type TagStat = { tag: string; count: number };
type StatsData = { daily: DailyStat[]; tagDistribution: TagStat[] };

type Period = "4weeks" | "3months";

const PERIOD_DAYS: Record<Period, number> = { "4weeks": 28, "3months": 90 };

const PIE_COLORS = [
  "#d97706", "#b45309", "#92400e", "#78350f",
  "#a16207", "#ca8a04", "#eab308", "#fbbf24",
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getISOWeekKey(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

function groupByWeek(daily: DailyStat[]) {
  const weeks = new Map<string, { moods: number[]; count: number }>();
  for (const d of daily) {
    const key = getISOWeekKey(d.date);
    const w = weeks.get(key) ?? { moods: [], count: 0 };
    if (d.mood !== null) w.moods.push(d.mood);
    w.count += d.achievementCount;
    weeks.set(key, w);
  }
  return [...weeks.entries()].map(([date, { moods, count }]) => ({
    date,
    label: formatDate(date) + "週",
    mood: moods.length ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10 : null,
    achievementCount: count,
  }));
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
        {children}
      </span>
      <span className="flex-1 border-t border-stone-200" />
    </div>
  );
}

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-mono text-stone-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-stone-700">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function StatsView() {
  const [period, setPeriod] = useState<Period>("4weeks");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stats?days=${PERIOD_DAYS[period]}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const chartData = (() => {
    if (!data) return [];
    if (period === "4weeks") {
      return data.daily.map((d) => ({
        ...d,
        label: formatDate(d.date),
      }));
    }
    return groupByWeek(data.daily);
  })();

  const moodData = chartData.filter((d) => d.mood !== null);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-stone-300">
        読み込み中…
      </div>
    );
  }

  if (!data || data.daily.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-200 text-center">
        <p className="text-sm text-stone-400">まだ記録がありません</p>
        <p className="text-xs text-stone-300">チェックインをはじめると統計が表示されます</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 期間セレクタ */}
      <div className="flex gap-2">
        {(["4weeks", "3months"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-mono transition-colors ${
              period === p
                ? "border-stone-800 bg-stone-800 text-white"
                : "border-stone-200 text-stone-400 hover:border-stone-400"
            }`}
          >
            {p === "4weeks" ? "4週間" : "3ヶ月"}
          </button>
        ))}
      </div>

      {/* 気分推移 */}
      {moodData.length > 0 && (
        <section>
          <SectionLabel>気分の推移</SectionLabel>
          <div className="rounded-xl border border-stone-200 bg-white/70 p-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "#a8a29e", fontFamily: "monospace" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 9, fill: "#a8a29e" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="気分"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#d97706" }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 達成数 */}
      <section>
        <SectionLabel>達成数</SectionLabel>
        <div className="rounded-xl border border-stone-200 bg-white/70 p-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "#a8a29e", fontFamily: "monospace" }}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 9, fill: "#a8a29e" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="achievementCount" name="達成数" fill="#92400e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* タグ分布 */}
      {data.tagDistribution.length > 0 && (
        <section>
          <SectionLabel>タグ別の達成分布</SectionLabel>
          <div className="rounded-xl border border-stone-200 bg-white/70 p-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.tagDistribution}
                  dataKey="count"
                  nameKey="tag"
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    (percent ?? 0) > 0.05 ? `${name} ${Math.round((percent ?? 0) * 100)}%` : ""
                  }
                  labelLine={false}
                  fontSize={10}
                >
                  {data.tagDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: "10px", color: "#78716c" }}
                />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ fontSize: "11px", borderColor: "#e7e5e4" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}
