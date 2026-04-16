import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { updateMandalaCellSchema } from "@/lib/validations";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; position: string }> }
) {
  const { ok } = rateLimit(getRateLimitKey(request));
  if (!ok) return apiError("リクエストが多すぎます", 429, "RATE_LIMIT");

  try {
    const { id, position } = await params;
    const pos = Number(position);
    if (isNaN(pos) || pos < 0 || pos > 80) {
      return apiError("position は 0〜80 の整数で指定してください", 400, "VALIDATION");
    }

    const body = await request.json();
    const parsed = updateMandalaCellSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, "VALIDATION");
    }
    const { title, memo, orientationId, bucketItemId } = parsed.data;

    const mandala = await prisma.quarterlyMandala.findFirst({
      where: { id, userId: PLACEHOLDER_USER_ID },
    });
    if (!mandala) {
      return apiError("データが見つかりません", 404, "NOT_FOUND");
    }

    const cell = await prisma.mandalaCell.upsert({
      where: { mandalaId_position: { mandalaId: id, position: pos } },
      update: {
        title: title ?? "",
        memo: memo ?? null,
        orientationId: orientationId ?? null,
        bucketItemId: bucketItemId ?? null,
      },
      create: {
        mandalaId: id,
        position: pos,
        title: title ?? "",
        memo: memo ?? null,
        orientationId: orientationId ?? null,
        bucketItemId: bucketItemId ?? null,
      },
      include: {
        orientation: { select: { id: true, title: true } },
        bucketItem: { select: { id: true, title: true } },
        recordLinks: { select: { id: true } },
      },
    });

    return Response.json(cell);
  } catch (err) {
    return handlePrismaError(err);
  }
}
