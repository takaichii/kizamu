import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { createMandalaSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function GET(request: NextRequest) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const { searchParams } = request.nextUrl;
    const yearParam = searchParams.get("year");
    const quarterParam = searchParams.get("quarter");

    const year = yearParam ? Number(yearParam) : undefined;
    const quarter = quarterParam ? Number(quarterParam) : undefined;

    if ((yearParam && isNaN(year!)) || (quarterParam && isNaN(quarter!))) {
      return apiError("year と quarter は数値で指定してください", 400, "VALIDATION");
    }

    const mandala = await prisma.quarterlyMandala.findFirst({
      where: {
        userId: PLACEHOLDER_USER_ID,
        ...(year !== undefined ? { year } : {}),
        ...(quarter !== undefined ? { quarter } : {}),
      },
      include: {
        cells: {
          orderBy: { position: "asc" },
          include: {
            orientation: { select: { id: true, title: true } },
            bucketItem: { select: { id: true, title: true } },
            recordLinks: { select: { id: true } },
          },
        },
      },
    });

    return Response.json(mandala);
  } catch (err) {
    return handlePrismaError(err);
  }
}

export async function POST(request: NextRequest) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const body = await request.json();
    const parsed = createMandalaSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, "VALIDATION");
    }
    const { year, quarter, centerTheme } = parsed.data;

    const mandala = await prisma.quarterlyMandala.upsert({
      where: {
        userId_year_quarter: {
          userId: PLACEHOLDER_USER_ID,
          year,
          quarter,
        },
      },
      update: { centerTheme: centerTheme ?? "" },
      create: {
        userId: PLACEHOLDER_USER_ID,
        year,
        quarter,
        centerTheme: centerTheme ?? "",
      },
      include: {
        cells: {
          orderBy: { position: "asc" },
          include: {
            orientation: { select: { id: true, title: true } },
            bucketItem: { select: { id: true, title: true } },
            recordLinks: { select: { id: true } },
          },
        },
      },
    });

    return Response.json(mandala, { status: 201 });
  } catch (err) {
    return handlePrismaError(err);
  }
}
