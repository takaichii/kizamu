import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { createOrientationSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function GET(request: NextRequest) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const orientations = await prisma.lifeOrientation.findMany({
      where: { userId: PLACEHOLDER_USER_ID },
      include: {
        recordLinks: { select: { id: true } },
        bucketItems: { select: { id: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return Response.json(orientations);
  } catch (err) {
    return handlePrismaError(err);
  }
}

export async function POST(request: NextRequest) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const body = await request.json();
    const parsed = createOrientationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, "VALIDATION");
    }
    const { title, description } = parsed.data;

    const orientation = await prisma.lifeOrientation.create({
      data: {
        userId: PLACEHOLDER_USER_ID,
        title,
        description: description ?? null,
      },
      include: {
        recordLinks: { select: { id: true } },
        bucketItems: { select: { id: true } },
      },
    });

    return Response.json(orientation, { status: 201 });
  } catch (err) {
    return handlePrismaError(err);
  }
}
