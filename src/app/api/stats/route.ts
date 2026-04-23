import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { statsQuerySchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

const PLACEHOLDER_USER_ID = "placeholder";

export async function GET(request: NextRequest) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const parsed = statsQuerySchema.safeParse({
      days: request.nextUrl.searchParams.get("days") ?? undefined,
    });
    if (!parsed.success) {
      return apiError("days は 7〜365 の整数で指定してください", 400, "VALIDATION");
    }
    const { days } = parsed.data;

    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const entries = await prisma.dailyEntry.findMany({
      where: { userId: PLACEHOLDER_USER_ID, date: { gte: from } },
      include: { achievements: { select: { tags: true } } },
      orderBy: { date: "asc" },
    });

    const daily = entries.map((e) => ({
      date: e.date.toISOString().slice(0, 10),
      mood: e.mood,
      achievementCount: e.achievements.length,
    }));

    const tagCounts = new Map<string, number>();
    for (const entry of entries) {
      for (const a of entry.achievements) {
        for (const tag of a.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        }
      }
    }
    const tagDistribution = [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return Response.json({ daily, tagDistribution });
  } catch (err) {
    return handlePrismaError(err);
  }
}
