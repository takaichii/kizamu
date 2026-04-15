import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, description } = body;

  const existing = await prisma.lifeOrientation.findFirst({
    where: { id, userId: PLACEHOLDER_USER_ID },
  });
  if (!existing) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const updated = await prisma.lifeOrientation.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() ?? null }),
    },
    include: {
      recordLinks: { select: { id: true } },
      bucketItems: { select: { id: true } },
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.lifeOrientation.findFirst({
    where: { id, userId: PLACEHOLDER_USER_ID },
  });
  if (!existing) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  await prisma.lifeOrientation.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
