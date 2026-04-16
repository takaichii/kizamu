import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { createBucketItemSchema } from "@/lib/validations";
import { BucketStatus } from "@/generated/prisma/client";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function GET(request: NextRequest) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const { searchParams } = request.nextUrl;
    const statusParam = searchParams.get("status");
    const status =
      statusParam && Object.values(BucketStatus).includes(statusParam as BucketStatus)
        ? (statusParam as BucketStatus)
        : null;

    const items = await prisma.bucketItem.findMany({
      where: {
        userId: PLACEHOLDER_USER_ID,
        ...(status ? { status } : {}),
      },
      include: {
        orientation: { select: { id: true, title: true } },
        recordLinks: { select: { id: true, achievementId: true, note: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(items);
  } catch (err) {
    return handlePrismaError(err);
  }
}

export async function POST(request: NextRequest) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const body = await request.json();
    const parsed = createBucketItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, "VALIDATION");
    }
    const { title, description, category, status, orientationId } = parsed.data;

    const item = await prisma.bucketItem.create({
      data: {
        userId: PLACEHOLDER_USER_ID,
        title,
        description: description ?? null,
        category,
        status: status ?? BucketStatus.dream,
        orientationId: orientationId ?? null,
      },
      include: {
        orientation: { select: { id: true, title: true } },
      },
    });

    return Response.json(item, { status: 201 });
  } catch (err) {
    return handlePrismaError(err);
  }
}
