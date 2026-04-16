import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { calendarQuerySchema } from "@/lib/validations";
import { calcStreak } from "@/lib/streak";
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

    const allEntries = await prisma.dailyEntry.findMany({
      where: { userId: PLACEHOLDER_USER_ID },
      select: { date: true },
      orderBy: { date: "desc" },
    });

    const streak = calcStreak(allEntries.map((e) => e.date));
    const totalDays = allEntries.length;

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
