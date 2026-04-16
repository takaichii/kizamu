import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { updateOrientationSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateOrientationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, "VALIDATION");
    }
    const { title, description } = parsed.data;

    const existing = await prisma.lifeOrientation.findFirst({
      where: { id, userId: PLACEHOLDER_USER_ID },
    });
    if (!existing) {
      return apiError("データが見つかりません", 404, "NOT_FOUND");
    }

    const updated = await prisma.lifeOrientation.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description ?? null }),
      },
      include: {
        recordLinks: { select: { id: true } },
        bucketItems: { select: { id: true } },
      },
    });

    return Response.json(updated);
  } catch (err) {
    return handlePrismaError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const { id } = await params;

    const existing = await prisma.lifeOrientation.findFirst({
      where: { id, userId: PLACEHOLDER_USER_ID },
    });
    if (!existing) {
      return apiError("データが見つかりません", 404, "NOT_FOUND");
    }

    await prisma.lifeOrientation.delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (err) {
    return handlePrismaError(err);
  }
}
