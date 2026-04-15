import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month")); // 1-12

  if (!year || !month) {
    return Response.json({ error: "year and month are required" }, { status: 400 });
  }

  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);

  const entries = await prisma.dailyEntry.findMany({
    where: {
      userId: PLACEHOLDER_USER_ID,
      date: { gte: from, lt: to },
    },
    include: {
      achievements: { select: { id: true, text: true, tags: true, isQuick: true } },
    },
    orderBy: { date: "asc" },
  });

  // ストリーク計算（直近の連続日数）
  const allEntries = await prisma.dailyEntry.findMany({
    where: { userId: PLACEHOLDER_USER_ID },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  let streak = 0;
  let totalDays = allEntries.length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < allEntries.length; i++) {
    const d = new Date(allEntries[i].date);
    d.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (d.getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return Response.json({
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date,
      mood: e.mood,
      summary: e.summary,
      achievementCount: e.achievements.length,
      achievements: e.achievements,
    })),
    stats: { streak, totalDays },
  });
}
