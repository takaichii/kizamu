import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { calendarQuerySchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function GET(request: NextRequest) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const { searchParams } = request.nextUrl;
    const parsed = calendarQuerySchema.safeParse({
      year: searchParams.get("year") ?? "",
      month: searchParams.get("month") ?? "",
    });
    if (!parsed.success) {
      return apiError("year と month は正しい数値で指定してください", 400, "VALIDATION");
    }
    const { year, month } = parsed.data;

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
    const totalDays = allEntries.length;
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
  } catch (err) {
    return handlePrismaError(err);
  }
}
