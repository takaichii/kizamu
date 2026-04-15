import { prisma } from "@/lib/prisma";
import { apiError, handlePrismaError } from "@/lib/api-error";
import type { NextRequest } from "next/server";

// TODO: 認証実装後に実際のユーザーIDを取得する
const PLACEHOLDER_USER_ID = "placeholder";

export async function GET(request: NextRequest) {
  try {    const { searchParams } = request.nextUrl;
    const year = searchParams.get("year");
    const quarter = searchParams.get("quarter");
  
    const where = {
      userId: PLACEHOLDER_USER_ID,
      ...(year ? { year: Number(year) } : {}),
      ...(quarter ? { quarter: Number(quarter) } : {}),
    };
  
    const mandala = await prisma.quarterlyMandala.findFirst({
      where,
      include: {
        cells: {
          orderBy: { position: "asc" },
          include: {
            orientation: { select: { id: true, title: true } },
            bucketItem: { select: { id: true, title: true } },
            recordLinks: { select: { id: true } },
          },
        },
      },
    });
  
    return Response.json(mandala);
  } catch (err) {
    return handlePrismaError(err);
  }
}

export async function POST(request: NextRequest) {
  try {    const body = await request.json();
    const { year, quarter, centerTheme } = body;
  
    if (!year || !quarter) {
      return apiError("year and quarter are required" , 400, "VALIDATION");
    }
  
    const mandala = await prisma.quarterlyMandala.upsert({
      where: {
        userId_year_quarter: {
          userId: PLACEHOLDER_USER_ID,
          year: Number(year),
          quarter: Number(quarter),
        },
      },
      update: { centerTheme: centerTheme ?? "" },
      create: {
        userId: PLACEHOLDER_USER_ID,
        year: Number(year),
        quarter: Number(quarter),
        centerTheme: centerTheme ?? "",
      },
      include: {
        cells: {
          orderBy: { position: "asc" },
          include: {
            orientation: { select: { id: true, title: true } },
            bucketItem: { select: { id: true, title: true } },
            recordLinks: { select: { id: true } },
          },
        },
      },
    });
  
    return Response.json(mandala, { status: 201 });
  } catch (err) {
    return handlePrismaError(err);
  }
}
