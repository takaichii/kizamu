import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function GET() {
  const orientations = await prisma.lifeOrientation.findMany({
    where: { userId: PLACEHOLDER_USER_ID },
    include: {
      recordLinks: { select: { id: true } },
      bucketItems: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(orientations);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const orientation = await prisma.lifeOrientation.create({
    data: {
      userId: PLACEHOLDER_USER_ID,
      title: title.trim(),
      description: description?.trim() ?? null,
    },
    include: {
      recordLinks: { select: { id: true } },
      bucketItems: { select: { id: true } },
    },
  });

  return Response.json(orientation, { status: 201 });
}
