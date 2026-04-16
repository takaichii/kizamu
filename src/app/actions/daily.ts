"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// 認証実装後（Issue #4）に差し替え
const PLACEHOLDER_USER_ID = "placeholder";

const achievementInput = z.object({
  text: z.string().min(1, "達成内容を入力してください").max(200),
  tags: z.array(z.string().max(20)).max(5),
});

const upsertEntryInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.coerce.number().int().min(1).max(5).nullable().optional(),
  summary: z.string().max(500).optional(),
  tomorrowNote: z.string().max(500).optional(),
  achievements: z.array(achievementInput),
});

export type ActionState = { error?: string; success?: boolean };

export async function upsertDailyEntry(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const moodRaw = formData.get("mood");
  const raw = {
    date: formData.get("date"),
    mood: moodRaw ? Number(moodRaw) : null,
    summary: formData.get("summary") || undefined,
    tomorrowNote: formData.get("tomorrowNote") || undefined,
    achievements: JSON.parse((formData.get("achievements") as string) ?? "[]"),
  };

  const parsed = upsertEntryInput.safeParse(raw);
  if (!parsed.success) {
    return { error: "入力内容に誤りがあります" };
  }

  const { date, mood, summary, tomorrowNote, achievements } = parsed.data;

  try {
    const entry = await prisma.dailyEntry.upsert({
      where: {
        userId_date: { userId: PLACEHOLDER_USER_ID, date: new Date(date) },
      },
      update: { mood: mood ?? null, summary, tomorrowNote },
      create: {
        userId: PLACEHOLDER_USER_ID,
        date: new Date(date),
        mood: mood ?? null,
        summary,
        tomorrowNote,
      },
    });

    // 既存の達成を全削除して再作成
    await prisma.achievement.deleteMany({ where: { entryId: entry.id } });
    if (achievements.length > 0) {
      await prisma.achievement.createMany({
        data: achievements.map((a) => ({
          entryId: entry.id,
          text: a.text,
          tags: a.tags,
        })),
      });
    }

    revalidatePath("/");
    revalidatePath(`/daily/${date}`);
    return { success: true };
  } catch {
    return { error: "保存に失敗しました。DB接続を確認してください。" };
  }
}
