import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; position: string }> }
) {
  const { id, position } = await params;
  const pos = Number(position);
  const body = await request.json();
  const { title, memo, orientationId, bucketItemId } = body;

  // マンダラの所有権チェック
  const mandala = await prisma.quarterlyMandala.findFirst({
    where: { id, userId: PLACEHOLDER_USER_ID },
  });
  if (!mandala) {
    return apiError("not found" , 404, "VALIDATION");
  }

  const cell = await prisma.mandalaCell.upsert({
    where: { mandalaId_position: { mandalaId: id, position: pos } },
    update: {
      title: title ?? "",
      memo: memo?.trim() ?? null,
      orientationId: orientationId ?? null,
      bucketItemId: bucketItemId ?? null,
    },
    create: {
      mandalaId: id,
      position: pos,
      title: title ?? "",
      memo: memo?.trim() ?? null,
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
}
