import type { Metadata } from "next";
import BucketListClient from "./BucketListClient";
import type { BucketItem } from "./BucketListClient";

export const metadata: Metadata = {
  title: "やりたいことリスト",
};

// ダミーデータ（認証・DB実装後に差し替え）
const MOCK_ITEMS: BucketItem[] = [
  {
    id: "1",
    title: "オーロラを見る",
    description: "フィンランドかアイスランドで本物のオーロラを見たい",
    category: "旅行",
    status: "dream",
    doneAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "フルマラソンを完走する",
    description: "42.195km、自分の限界に挑戦する",
    category: "スポーツ",
    status: "inProgress",
    doneAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "富士山に登る",
    description: "日本最高峰から日の出を見る",
    category: "スポーツ",
    status: "done",
    doneAt: "2023-08-10T00:00:00.000Z",
    createdAt: new Date().toISOString(),
  },
];

export default function BucketListPage() {
  return <BucketListClient initialItems={MOCK_ITEMS} />;
}
