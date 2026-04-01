import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use Edge-compatible config (no Prisma) in middleware
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
