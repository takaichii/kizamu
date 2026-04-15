import type { Metadata } from "next";
import OrientationClient from "./OrientationClient";
import type { Orientation } from "./OrientationClient";

export const metadata: Metadata = {
  title: "人生の方向性",
};

// ダミーデータ（認証・DB実装後に差し替え）
const MOCK_ITEMS: Orientation[] = [
  {
    id: "1",
    title: "健康で長生きする",
    description: "身体と心の健康を大切にし、長く豊かな人生を歩む。食事・運動・睡眠を意識する。",
    createdAt: new Date().toISOString(),
    recordLinks: [{ id: "r1" }, { id: "r2" }, { id: "r3" }],
    bucketItems: [{ id: "b1" }],
  },
  {
    id: "2",
    title: "人に優しくある",
    description: "家族・友人・見知らぬ人にも、思いやりを持って接する。",
    createdAt: new Date().toISOString(),
    recordLinks: [{ id: "r4" }],
    bucketItems: [],
  },
  {
    id: "3",
    title: "学び続ける",
    description: "好奇心を持ち続け、新しいことに挑戦し、知識とスキルを積み重ねる。",
    createdAt: new Date().toISOString(),
    recordLinks: [],
    bucketItems: [{ id: "b2" }, { id: "b3" }],
  },
];

export default function OrientationPage() {
  return <OrientationClient initialItems={MOCK_ITEMS} />;
}
