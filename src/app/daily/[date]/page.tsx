import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckinForm } from "./checkin-form";

// 認証実装後（Issue #4）に差し替え
const PLACEHOLDER_USER_ID = "placeholder";

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
      where: { userId_date: { userId: PLACEHOLDER_USER_ID, date: new Date(date) } },
      include: { achievements: { orderBy: { createdAt: "asc" } } },
    });
  } catch {
    // DB未接続時はフォームのみ表示
  }

  return (
    <div className="min-h-screen bg-[#f9f6ef]">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-10">

        <header className="mb-10 border-b border-stone-200 pb-6">
          <Link
            href="/"
            className="mb-4 inline-block text-xs font-mono text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← ホームへ
          </Link>
          <p className="text-[10px] tracking-[0.25em] uppercase font-mono text-stone-400 mb-3">
            {formatDateJa(date)}
          </p>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold text-stone-800 leading-tight">
            今日を刻む
          </h1>
          <p className="mt-2 text-sm text-stone-500">
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
