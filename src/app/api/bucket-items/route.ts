import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import { BucketStatus } from "@/generated/prisma/client";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function GET(request: NextRequest) {
  try {    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") as BucketStatus | null;
  
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
  try {    const body = await request.json();
    const { title, description, category, status, orientationId } = body;
  
    if (!title || typeof title !== "string" || !title.trim()) {
      return apiError("title is required" , 400, "VALIDATION");
    }
    if (!category || typeof category !== "string" || !category.trim()) {
      return apiError("category is required" , 400, "VALIDATION");
    }
  
    const item = await prisma.bucketItem.create({
      data: {
        userId: PLACEHOLDER_USER_ID,
        title: title.trim(),
        description: description?.trim() ?? null,
        category: category.trim(),
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
