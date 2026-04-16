/**
 * 連続記録日数（ストリーク）を計算する。
 * @param dates - 記録のある日付の配列（降順ソート済みを期待）
 * @param today - 基準日（省略時は現在日）
 */
export function calcStreak(dates: Date[], today: Date = new Date()): number {
  if (dates.length === 0) return 0;

  const base = new Date(today);
  base.setHours(0, 0, 0, 0);

  // 降順ソート（コピーして破壊的操作を避ける）
  const sorted = [...dates]
    .map((d) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy;
    })
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(base);
    expected.setDate(base.getDate() - i);
    if (sorted[i].getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
