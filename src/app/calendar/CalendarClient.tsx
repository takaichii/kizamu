"use client";

import { useState } from "react";

export type DayEntry = {
  id: string;
  date: string;
  mood: number | null;
  summary: string | null;
  achievementCount: number;
  achievements: { id: string; text: string; tags: string[]; isQuick: boolean }[];
};

export type CalendarData = {
  entries: DayEntry[];
  stats: { streak: number; totalDays: number };
};

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

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function getMoodColor(mood: number | null): string {
  if (mood === null) return "bg-stone-100 text-stone-400";
  if (mood >= 4) return "bg-emerald-400 text-white";
  if (mood >= 3) return "bg-amber-300 text-white";
  return "bg-rose-300 text-white";
}

function getActivityColor(count: number): string {
  if (count === 0) return "bg-stone-100";
  if (count <= 2) return "bg-amber-200";
  if (count <= 4) return "bg-amber-400";
  return "bg-amber-600";
}

export default function CalendarClient({
  initialData,
  initialYear,
  initialMonth,
}: {
  initialData: CalendarData;
  initialYear: number;
  initialMonth: number;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState<CalendarData>(initialData);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const entryMap = new Map(
    data.entries.map((e) => [e.date.slice(0, 10), e])
  );

  const selectedEntry = selectedDate ? entryMap.get(selectedDate) : null;

  async function navigate(dy: number, dm: number) {
    let m = month + dm;
    let y = year + dy;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setYear(y); setMonth(m); setSelectedDate(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?year=${y}&month=${m}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  // カレンダー構築
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=日
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // 6行になるようパディング
  while (cells.length % 7 !== 0) cells.push(null);

  const monthEntries = data.entries.length;
  const daysWithRecords = data.entries.filter((e) => e.achievementCount > 0).length;

  return (
    <div className="min-h-screen bg-[#f9f6ef]">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-10">

        {/* ヘッダー */}
        <header className="mb-10 border-b border-stone-200 pb-6">
          <p className="text-[10px] tracking-[0.25em] uppercase font-mono text-stone-400 mb-3">
            Calendar
          </p>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold text-stone-800 leading-tight">
            カレンダー
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            積み重ねた日々を振り返る
          </p>
        </header>

        {/* 統計 */}
        <section className="mb-8">
          <SectionLabel>記録の軌跡</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "連続記録", value: data.stats.streak, unit: "日" },
              { label: "累計記録日数", value: data.stats.totalDays, unit: "日" },
              { label: "今月の記録", value: daysWithRecords, unit: "日" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-stone-200 bg-white/70 p-3 text-center">
                <p className="font-[family-name:var(--font-serif)] text-xl font-bold text-stone-800">
                  {s.value}
                  <span className="text-xs font-sans font-normal text-stone-400 ml-0.5">{s.unit}</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* カレンダー */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(0, -1)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors"
            >
              ← 前月
            </button>
            <h2 className="font-[family-name:var(--font-serif)] text-lg font-bold text-stone-800">
              {year}年{month}月
            </h2>
            <button
              onClick={() => navigate(0, 1)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors"
            >
              次月 →
            </button>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white/70 p-4">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className={`text-center text-[10px] font-mono pb-2 ${i === 0 ? "text-rose-400" : i === 6 ? "text-sky-400" : "text-stone-400"}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* 日付セル */}
            {loading ? (
              <div className="h-40 flex items-center justify-center text-stone-300 text-sm">
                読み込み中...
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const entry = entryMap.get(dateStr);
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;
                  const count = entry?.achievementCount ?? 0;

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${
                        isSelected
                          ? "ring-2 ring-stone-800 ring-offset-1"
                          : "hover:ring-1 hover:ring-stone-300"
                      }`}
                    >
                      <span className={`text-[11px] font-mono leading-none ${
                        isToday ? "font-bold text-amber-600" : "text-stone-600"
                      }`}>
                        {day}
                      </span>
                      <span className={`w-4 h-1.5 rounded-full ${getActivityColor(count)}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* 凡例 */}
            <div className="mt-3 flex items-center gap-2 justify-end">
              <span className="text-[9px] text-stone-300">少</span>
              {["bg-stone-100", "bg-amber-200", "bg-amber-400", "bg-amber-600"].map((c) => (
                <span key={c} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
              <span className="text-[9px] text-stone-300">多</span>
            </div>
          </div>
        </section>

        {/* 選択した日の詳細 */}
        {selectedDate && (
          <section className="mb-8">
            <SectionLabel>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
            </SectionLabel>
            {selectedEntry ? (
              <div className="rounded-xl border border-stone-200 bg-white/70 p-5">
                {selectedEntry.mood !== null && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] text-stone-400">気分</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${getMoodColor(selectedEntry.mood)}`}>
                      {selectedEntry.mood} / 5
                    </span>
                  </div>
                )}
                {selectedEntry.summary && (
                  <p className="text-sm text-stone-600 leading-relaxed mb-3 pb-3 border-b border-stone-100">
                    {selectedEntry.summary}
                  </p>
                )}
                {selectedEntry.achievements.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {selectedEntry.achievements.map((a) => (
                      <li key={a.id} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-stone-400 shrink-0" />
                        <span className="text-sm text-stone-700">{a.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-400">達成記録はありません</p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center">
                <p className="text-sm text-stone-400">この日の記録はありません</p>
              </div>
            )}
          </section>
        )}

        {/* 月次サマリー */}
        {monthEntries > 0 && (
          <section>
            <SectionLabel>{month}月のサマリー</SectionLabel>
            <div className="rounded-xl border border-stone-200 bg-white/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-500">記録日数</span>
                <span className="font-mono text-sm font-bold text-stone-800">{daysWithRecords}日 / {daysInMonth}日</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-100 mb-4">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${Math.round((daysWithRecords / daysInMonth) * 100)}%` }}
                />
              </div>
              <ul className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {data.entries
                  .filter((e) => e.achievementCount > 0)
                  .map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center gap-3 cursor-pointer hover:text-stone-700 transition-colors"
                      onClick={() => setSelectedDate(e.date.slice(0, 10))}
                    >
                      <span className="text-[10px] font-mono text-stone-400 shrink-0">
                        {new Date(e.date).getDate()}日
                      </span>
                      <span className="flex-1 text-xs text-stone-600 truncate">
                        {e.achievements[0]?.text ?? "記録あり"}
                      </span>
                      <span className="text-[10px] font-mono text-stone-300">
                        {e.achievementCount}件
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
