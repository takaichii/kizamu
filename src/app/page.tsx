import Link from "next/link";

function formatDate(date: Date) {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function getCurrentQuarter(date: Date) {
  const month = date.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  return { year: date.getFullYear(), quarter };
}

type MandalaCell = { title: string; count: number };

type MockData = {
  streak: number;
  totalDays: number;
  todayCheckedIn: boolean;
  recentAchievements: number;
  mandala: { centerTheme: string; cells: MandalaCell[] };
};

// ダミーデータ（認証・DB実装後に差し替え）
const MOCK_DATA: MockData = {
  streak: 5,
  totalDays: 38,
  todayCheckedIn: false,
  recentAchievements: 3,
  mandala: {
    centerTheme: "自分の土台をつくる",
    cells: [
      { title: "毎日30分読書", count: 12 },
      { title: "健康的な食事", count: 8 },
      { title: "散歩・運動", count: 15 },
      { title: "創作活動", count: 5 },
      { title: "家族との時間", count: 9 },
      { title: "学びの継続", count: 7 },
      { title: "睡眠の質を上げる", count: 11 },
      { title: "感謝を伝える", count: 4 },
    ],
  },
};

// MOCK_DATA は定数なのでモジュールスコープで計算
const totalMandalaCount = MOCK_DATA.mandala.cells.reduce(
  (sum, c) => sum + c.count,
  0
);

type StatCardProps = { label: string; value: string | number; sub?: string };

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 shadow-sm">
      <span className="text-2xl font-bold text-zinc-900">
        {value}
      </span>
      <span className="text-xs text-zinc-500">{label}</span>
      {sub && (
        <span className="text-xs text-zinc-400">{sub}</span>
      )}
    </div>
  );
}

type NavCardProps = {
  href: string;
  icon: string;
  label: string;
  description: string;
};

function NavCard({ href, icon, label, description }: NavCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm hover:bg-zinc-50 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-sm text-zinc-900">
        {label}
      </span>
      <span className="text-xs text-zinc-500 leading-relaxed">
        {description}
      </span>
    </Link>
  );
}

export default function HomePage() {
  // Server Component なのでリクエスト時に現在時刻を取得
  const today = new Date();
  const { year, quarter } = getCurrentQuarter(today);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-lg px-4 pb-12 pt-8">
        {/* ヘッダー */}
        <header className="mb-8">
          <p className="text-sm text-zinc-400">
            {formatDate(today)}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">
            おはようございます
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            今日も一歩、刻みましょう。
          </p>
        </header>

        {/* 今日のチェックイン */}
        {MOCK_DATA.todayCheckedIn ? (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-semibold text-emerald-800">
                  今日の記録を残しました
                </p>
                <p className="text-sm text-emerald-600">
                  {MOCK_DATA.recentAchievements}件の達成を記録
                </p>
              </div>
            </div>
            <Link
              href="/checkin"
              className="mt-3 block text-center text-sm font-medium text-emerald-700 underline underline-offset-2"
            >
              今日の記録を見る・追記する
            </Link>
          </div>
        ) : (
          <Link
            href="/checkin"
            className="mb-6 flex flex-col gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 shadow-sm hover:bg-emerald-100 transition-colors"
          >
            <p className="text-lg font-semibold text-emerald-800">
              今日を記録する
            </p>
            <p className="text-sm text-emerald-600">
              小さなことでも、確かに生きた証を残しましょう
            </p>
            <span className="mt-1 text-xs font-medium text-emerald-500">
              タップして記録 →
            </span>
          </Link>
        )}

        {/* ストリーク・累積 */}
        <section className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            継続記録
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="連続記録"
              value={`${MOCK_DATA.streak}日`}
              sub="途切れても大丈夫"
            />
            <StatCard
              label="累計記録日数"
              value={`${MOCK_DATA.totalDays}日`}
              sub="積み重ねた日々"
            />
          </div>
        </section>

        {/* 今期のマンダラ */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {year}年 Q{quarter} マンダラ
            </h2>
            <Link
              href="/mandala"
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              詳細を見る →
            </Link>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-center text-sm font-semibold text-zinc-900">
              「{MOCK_DATA.mandala.centerTheme}」
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {MOCK_DATA.mandala.cells.map((cell, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-0.5 rounded-xl bg-zinc-50 px-1 py-2"
                >
                  <span className="text-xs font-medium text-zinc-700 text-center leading-tight line-clamp-2">
                    {cell.title}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {cell.count}回
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-zinc-400">
              今期の総記録：{totalMandalaCount}件
            </p>
          </div>
        </section>

        {/* ナビゲーション */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            メニュー
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <NavCard
              href="/bucket-list"
              icon="🗺️"
              label="やりたいことリスト"
              description="人生でやりたいことを管理する"
            />
            <NavCard
              href="/orientation"
              icon="🧭"
              label="人生の方向性"
              description="こう生きたい、という価値観の軸"
            />
            <NavCard
              href="/calendar"
              icon="📅"
              label="カレンダー"
              description="過去の記録を振り返る"
            />
            <NavCard
              href="/mandala"
              icon="🎯"
              label="四半期マンダラ"
              description="今期の注力テーマを整理する"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
