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

const totalMandalaCount = MOCK_DATA.mandala.cells.reduce(
  (sum, c) => sum + c.count,
  0
);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
        {children}
      </span>
      <span className="flex-1 border-t border-stone-200" />
    </div>
  );
}

type NavCardProps = {
  href: string;
  label: string;
  description: string;
  num: string;
};

function NavCard({ href, label, description, num }: NavCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between gap-4 rounded-xl border border-stone-200 bg-white/70 p-4 hover:border-stone-400 hover:bg-white transition-all"
    >
      <span className="text-[10px] font-mono text-stone-300 group-hover:text-stone-400 transition-colors">
        {num}
      </span>
      <div>
        <p className="font-[family-name:var(--font-serif)] text-sm font-bold text-stone-800 leading-snug">
          {label}
        </p>
        <p className="mt-1 text-xs text-stone-400 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const today = new Date();
  const { year, quarter } = getCurrentQuarter(today);

  return (
    <div className="min-h-screen bg-[#f9f6ef]">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-10">

        {/* ヘッダー */}
        <header className="mb-10 border-b border-stone-200 pb-6">
          <p className="text-xs tracking-widest text-stone-400 uppercase font-mono">
            {formatDate(today)}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-serif)] text-3xl font-bold text-stone-800 leading-tight">
            刻む
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            今日も一歩、積み重ねましょう。
          </p>
        </header>

        {/* 今日のチェックイン */}
        {MOCK_DATA.todayCheckedIn ? (
          <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
            <p className="text-xs tracking-widest text-emerald-500 uppercase font-mono mb-2">
              Today
            </p>
            <p className="font-[family-name:var(--font-serif)] text-base font-bold text-emerald-800">
              今日の記録を残しました
            </p>
            <p className="mt-1 text-sm text-emerald-600">
              {MOCK_DATA.recentAchievements}件の達成を記録
            </p>
            <Link
              href="/checkin"
              className="mt-3 inline-block text-xs font-medium text-emerald-600 underline underline-offset-4 decoration-emerald-300 hover:decoration-emerald-600 transition-colors"
            >
              記録を見る・追記する →
            </Link>
          </div>
        ) : (
          <Link
            href="/checkin"
            className="mb-8 group flex items-center justify-between rounded-xl border border-stone-800 bg-stone-800 p-5 hover:bg-stone-700 hover:border-stone-700 transition-all"
          >
            <div>
              <p className="text-xs tracking-widest text-stone-400 uppercase font-mono mb-1">
                Today
              </p>
              <p className="font-[family-name:var(--font-serif)] text-lg font-bold text-stone-50">
                今日を記録する
              </p>
              <p className="mt-1 text-xs text-stone-400">
                小さなことでも、確かに生きた証を
              </p>
            </div>
            <span className="text-stone-400 group-hover:text-stone-200 transition-colors text-xl">
              →
            </span>
          </Link>
        )}

        {/* ストリーク・累積 */}
        <section className="mb-8">
          <SectionLabel>継続記録</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "連続記録", value: `${MOCK_DATA.streak}日`, sub: "途切れても大丈夫" },
              { label: "累計記録日数", value: `${MOCK_DATA.totalDays}日`, sub: "積み重ねた日々" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-stone-200 bg-white/70 p-4"
              >
                <p className="font-[family-name:var(--font-serif)] text-2xl font-bold text-stone-800">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-stone-500">{item.label}</p>
                <p className="text-xs text-stone-300 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 今期のマンダラ */}
        <section className="mb-8">
          <SectionLabel>{year}年 Q{quarter} マンダラ</SectionLabel>
          <div className="rounded-xl border border-stone-200 bg-white/70 p-4">
            <p className="font-[family-name:var(--font-serif)] text-sm font-bold text-stone-700 text-center mb-4">
              「{MOCK_DATA.mandala.centerTheme}」
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {MOCK_DATA.mandala.cells.map((cell, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 rounded-lg border border-stone-100 bg-[#f9f6ef] px-1 py-2.5"
                >
                  <span className="text-[10px] font-medium text-stone-600 text-center leading-tight line-clamp-2">
                    {cell.title}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {cell.count}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-stone-400">
                今期の総記録 {totalMandalaCount}件
              </span>
              <Link
                href="/mandala"
                className="text-xs text-stone-400 underline underline-offset-4 decoration-stone-200 hover:text-stone-600 hover:decoration-stone-400 transition-colors"
              >
                詳細を見る →
              </Link>
            </div>
          </div>
        </section>

        {/* ナビゲーション */}
        <section>
          <SectionLabel>メニュー</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <NavCard
              href="/bucket-list"
              num="01"
              label="やりたいことリスト"
              description="死ぬまでにやりたいことを管理する"
            />
            <NavCard
              href="/orientation"
              num="02"
              label="人生の方向性"
              description="こう生きたい、という価値観の軸"
            />
            <NavCard
              href="/calendar"
              num="03"
              label="カレンダー"
              description="過去の記録を振り返る"
            />
            <NavCard
              href="/mandala"
              num="04"
              label="四半期マンダラ"
              description="今期の注力テーマを整理する"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
