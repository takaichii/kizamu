import type { Metadata } from "next";
import MandalaClient from "./MandalaClient";
import type { Mandala } from "./MandalaClient";

export const metadata: Metadata = {
  title: "四半期マンダラ",
};

function getCurrentQuarter(date: Date) {
  const month = date.getMonth() + 1;
  return { year: date.getFullYear(), quarter: Math.ceil(month / 3) };
}

// ダミーデータ（認証・DB実装後に差し替え）
const MOCK_MANDALA: Mandala = {
  id: "mock-1",
  year: 2026,
  quarter: 2,
  centerTheme: "自分の土台をつくる",
  cells: [
    { id: "c0", position: 0, title: "毎日30分読書", memo: "技術書・自己啓発どちらでも", orientationId: null, bucketItemId: null, recordLinks: [{ id: "r1" }, { id: "r2" }], orientation: null, bucketItem: null },
    { id: "c1", position: 1, title: "健康的な食事", memo: null, orientationId: null, bucketItemId: null, recordLinks: [{ id: "r3" }], orientation: null, bucketItem: null },
    { id: "c2", position: 2, title: "散歩・運動", memo: "週3回以上を目標", orientationId: null, bucketItemId: null, recordLinks: [{ id: "r4" }, { id: "r5" }, { id: "r6" }], orientation: null, bucketItem: null },
    { id: "c3", position: 3, title: "創作活動", memo: null, orientationId: null, bucketItemId: null, recordLinks: [], orientation: null, bucketItem: null },
    { id: "c4", position: 4, title: "家族との時間", memo: null, orientationId: null, bucketItemId: null, recordLinks: [{ id: "r7" }], orientation: null, bucketItem: null },
    { id: "c5", position: 5, title: "学びの継続", memo: "オンライン講座・読書", orientationId: null, bucketItemId: null, recordLinks: [], orientation: null, bucketItem: null },
    { id: "c6", position: 6, title: "睡眠の質を上げる", memo: null, orientationId: null, bucketItemId: null, recordLinks: [{ id: "r8" }], orientation: null, bucketItem: null },
    { id: "c7", position: 7, title: "感謝を伝える", memo: null, orientationId: null, bucketItemId: null, recordLinks: [], orientation: null, bucketItem: null },
  ],
};

export default function MandalaPage() {
  const { year, quarter } = getCurrentQuarter(new Date());

  return (
    <MandalaClient
      initialMandala={MOCK_MANDALA}
      initialYear={year}
      initialQuarter={quarter}
    />
  );
}
