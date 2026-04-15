import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function GET() {
  try {    const orientations = await prisma.lifeOrientation.findMany({
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
  try {    const body = await request.json();
    const { title, description } = body;
  
    if (!title || typeof title !== "string" || !title.trim()) {
      return apiError("title is required" , 400, "VALIDATION");
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
  } catch (err) {
    return handlePrismaError(err);
  }
}
