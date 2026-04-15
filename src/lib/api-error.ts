import { Prisma } from "@/generated/prisma/client";

export type ApiErrorResponse = {
  error: string;
  code?: string;
};

export function apiError(message: string, status: number, code?: string): Response {
  const body: ApiErrorResponse = { error: message, ...(code ? { code } : {}) };
  return Response.json(body, { status });
}

export function handlePrismaError(err: unknown): Response {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return apiError("すでに同じデータが存在します", 409, "CONFLICT");
      case "P2025":
        return apiError("データが見つかりません", 404, "NOT_FOUND");
      case "P2003":
        return apiError("関連データが存在しません", 400, "FOREIGN_KEY");
      default:
        return apiError("データベースエラーが発生しました", 500, "DB_ERROR");
    }
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return apiError("データベースに接続できませんでした", 503, "DB_UNAVAILABLE");
  }
  console.error("[API Error]", err);
  return apiError("予期しないエラーが発生しました", 500, "INTERNAL");
}
