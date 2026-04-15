import type { Metadata } from "next";
import CalendarClient from "./CalendarClient";
import type { CalendarData } from "./CalendarClient";

export const metadata: Metadata = {
  title: "カレンダー",
};

// ダミーデータ（認証・DB実装後に差し替え）
function buildMockData(year: number, month: number): CalendarData {
  const daysInMonth = new Date(year, month, 0).getDate();
  const entries = [];

  // 過去の記録をランダムに生成
  const recordDays = [1, 2, 3, 5, 6, 8, 10, 11, 12, 13, 14, 15, 17, 18, 20, 21, 22, 25, 26, 28];
  for (const day of recordDays) {
    if (day > daysInMonth) break;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00.000Z`;
    const achievementCount = Math.floor(Math.random() * 4) + 1;
    entries.push({
      id: `entry-${day}`,
      date: dateStr,
      mood: Math.floor(Math.random() * 3) + 3,
      summary: day % 5 === 0 ? "今日も一歩前進できた。小さなことを大切に。" : null,
      achievementCount,
      achievements: Array.from({ length: achievementCount }, (_, i) => ({
        id: `ach-${day}-${i}`,
        text: ["30分読書した", "散歩した", "健康的な食事", "家族と話した", "コードを書いた"][i % 5],
        tags: [],
        isQuick: i % 2 === 0,
      })),
    });
  }

  return {
    entries,
    stats: { streak: 5, totalDays: 38 },
  };
}

export default function CalendarPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  return (
    <CalendarClient
      initialData={buildMockData(year, month)}
      initialYear={year}
      initialMonth={month}
    />
  );
}
