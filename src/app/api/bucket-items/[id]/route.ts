import { prisma } from "@/lib/prisma";
import { BucketStatus } from "@/generated/prisma/client";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, description, category, status, orientationId, doneAt } = body;

  const existing = await prisma.bucketItem.findFirst({
    where: { id, userId: PLACEHOLDER_USER_ID },
  });
  if (!existing) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const updated = await prisma.bucketItem.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() ?? null }),
      ...(category !== undefined && { category: category.trim() }),
      ...(status !== undefined && { status: status as BucketStatus }),
      ...(orientationId !== undefined && { orientationId: orientationId ?? null }),
      ...(doneAt !== undefined && { doneAt: doneAt ? new Date(doneAt) : null }),
    },
    include: {
      orientation: { select: { id: true, title: true } },
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.bucketItem.findFirst({
    where: { id, userId: PLACEHOLDER_USER_ID },
  });
  if (!existing) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  await prisma.bucketItem.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
