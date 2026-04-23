import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { calcStreak } from "@/lib/streak";
import CalendarClient from "./CalendarClient";
import type { CalendarData } from "./CalendarClient";

export const metadata: Metadata = {
  title: "カレンダー",
};

const PLACEHOLDER_USER_ID = "placeholder";

export default async function CalendarPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  let initialData: CalendarData = { entries: [], stats: { streak: 0, totalDays: 0 } };

  try {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 1);

    const [entries, allEntries] = await Promise.all([
      prisma.dailyEntry.findMany({
        where: { userId: PLACEHOLDER_USER_ID, date: { gte: from, lt: to } },
        include: { achievements: { select: { id: true, text: true, tags: true, isQuick: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.dailyEntry.findMany({
        where: { userId: PLACEHOLDER_USER_ID },
        select: { date: true },
        orderBy: { date: "desc" },
      }),
    ]);

    initialData = {
      entries: entries.map((e) => ({
        id: e.id,
        date: e.date.toISOString(),
        mood: e.mood,
        summary: e.summary,
        achievementCount: e.achievements.length,
        achievements: e.achievements,
      })),
      stats: {
        streak: calcStreak(allEntries.map((e) => e.date)),
        totalDays: allEntries.length,
      },
    };
  } catch {
    // DB未接続時は空データで表示
  }

  return (
    <CalendarClient
      initialData={initialData}
      initialYear={year}
      initialMonth={month}
    />
  );
}
