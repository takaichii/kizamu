import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckinForm } from "./checkin-form";

// 認証実装後（Issue #4）に差し替え
const MOCK_USER_ID = "mock-user-id";

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return { title: `${date} のチェックイン` };
}

function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

function formatDateJa(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default async function DailyPage({ params }: Props) {
  const { date } = await params;

  if (!isValidDate(date)) notFound();

  let entry = null;
  try {
    entry = await prisma.dailyEntry.findUnique({
      where: { userId_date: { userId: MOCK_USER_ID, date: new Date(date) } },
      include: { achievements: { orderBy: { createdAt: "asc" } } },
    });
  } catch {
    // DB未接続時はフォームのみ表示
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg px-4 pb-12 pt-8">
        {/* ヘッダー */}
        <header className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ← ホームへ
          </Link>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            {formatDateJa(date)}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            今日を刻む
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            どんな小さなことでも、記録に価値があります。
          </p>
        </header>

        <CheckinForm
          date={date}
          initialMood={entry?.mood}
          initialSummary={entry?.summary}
          initialTomorrowNote={entry?.tomorrowNote}
          initialAchievements={entry?.achievements.map((a) => ({
            text: a.text,
            tags: a.tags,
          }))}
        />
      </div>
    </div>
  );
}
