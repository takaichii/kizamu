"use client";

import { useState } from "react";
import { Button, Input, Textarea, Card, Badge, SectionLabel } from "@/components/ui";

export type BucketStatus = "dream" | "inProgress" | "done";

export type BucketItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: BucketStatus;
  doneAt: string | null;
  createdAt: string;
};

const STATUS_LABELS: Record<BucketStatus, string> = {
  dream: "夢",
  inProgress: "挑戦中",
  done: "達成",
};

const STATUS_BADGE_VARIANTS: Record<BucketStatus, "violet" | "amber" | "emerald"> = {
  dream: "violet",
  inProgress: "amber",
  done: "emerald",
};

const NEXT_STATUS: Record<BucketStatus, BucketStatus> = {
  dream: "inProgress",
  inProgress: "done",
  done: "dream",
};

const FILTERS: { value: BucketStatus | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "dream", label: "夢" },
  { value: "inProgress", label: "挑戦中" },
  { value: "done", label: "達成" },
];

type FormState = {
  title: string;
  description: string;
  category: string;
  status: BucketStatus;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  status: "dream",
};

export default function BucketListClient({
  initialItems,
}: {
  initialItems: BucketItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<BucketStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered =
    filter === "all" ? items : items.filter((i) => i.status === filter);

  async function handleStatusChange(item: BucketItem) {
    const next = NEXT_STATUS[item.status];
    const doneAt = next === "done" ? new Date().toISOString() : null;
    const res = await fetch(`/api/bucket-items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, doneAt }),
    });
    if (!res.ok) return;
    const updated: BucketItem = await res.json();
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  async function handleDelete(id: string) {
    if (!confirm("このアイテムを削除しますか？")) return;
    const res = await fetch(`/api/bucket-items/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function startEdit(item: BucketItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      category: item.category,
      status: item.status,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.category.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/bucket-items/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated: BucketItem = await res.json();
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          cancelForm();
        }
      } else {
        const res = await fetch("/api/bucket-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created: BucketItem = await res.json();
          setItems((prev) => [created, ...prev]);
          cancelForm();
        }
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f6ef]">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-10">

        {/* ヘッダー */}
        <header className="mb-10 border-b border-stone-200 pb-6">
          <p className="text-[10px] tracking-[0.25em] uppercase font-mono text-stone-400 mb-3">
            Bucket List
          </p>
          <div className="flex items-end justify-between">
            <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold text-stone-800 leading-tight">
              やりたいことリスト
            </h1>
            <Button
              onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}
              size="sm"
              className="mb-1"
            >
              ＋ 追加
            </Button>
          </div>
          <p className="mt-2 text-sm text-stone-500">
            死ぬまでにやりたいことを刻もう
          </p>
        </header>

        {/* フィルタータブ */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-stone-800 text-stone-50"
                  : "border border-stone-200 text-stone-500 hover:bg-white"
              }`}
            >
              {f.label}
              {f.value !== "all" && (
                <span className="ml-1 opacity-60">
                  {items.filter((i) => i.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* フォーム */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6">
            <Card>
              <SectionLabel>{editingId ? "アイテムを編集" : "新しいアイテム"}</SectionLabel>
              <div className="flex flex-col gap-3">
                <Input
                  type="text"
                  placeholder="やりたいこと *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <Input
                  type="text"
                  placeholder="カテゴリ（旅行、スキル、体験など）*"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="詳細・メモ（任意）"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as BucketStatus })}
                  className="w-full rounded-lg border border-stone-200 bg-[#f9f6ef] px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                  <option value="dream">夢</option>
                  <option value="inProgress">挑戦中</option>
                  <option value="done">達成</option>
                </select>
              </div>
              <div className="mt-4 flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "保存中..." : editingId ? "更新" : "追加"}
                </Button>
                <Button type="button" variant="secondary" onClick={cancelForm} className="flex-1">
                  キャンセル
                </Button>
              </div>
            </Card>
          </form>
        )}

        {/* リスト */}
        {filtered.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="font-[family-name:var(--font-serif)] text-stone-400 text-sm">
              {filter === "all"
                ? "まだアイテムがありません"
                : `「${FILTERS.find((f) => f.value === filter)?.label}」のアイテムはありません`}
            </p>
            <p className="mt-1 text-xs text-stone-300">追加ボタンから登録してみましょう</p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((item) => (
              <li key={item.id}>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <Badge variant={STATUS_BADGE_VARIANTS[item.status]}>
                          {STATUS_LABELS[item.status]}
                        </Badge>
                        <span className="text-[10px] font-mono text-stone-300">
                          {item.category}
                        </span>
                      </div>
                      <p className="font-[family-name:var(--font-serif)] font-bold text-stone-800 leading-snug">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      {item.doneAt && (
                        <p className="mt-1 text-xs text-emerald-600">
                          達成: {new Date(item.doneAt).toLocaleDateString("ja-JP")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(item)}
                        title="次のステータスへ"
                        className="whitespace-nowrap"
                      >
                        → {STATUS_LABELS[NEXT_STATUS[item.status]]}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => startEdit(item)}>
                        編集
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                        削除
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {/* 統計 */}
        {items.length > 0 && (
          <Card className="mt-6">
            <SectionLabel>統計</SectionLabel>
            <div className="grid grid-cols-3 gap-3 text-center">
              {(["dream", "inProgress", "done"] as BucketStatus[]).map((s) => (
                <div key={s}>
                  <p className="font-[family-name:var(--font-serif)] text-2xl font-bold text-stone-800">
                    {items.filter((i) => i.status === s).length}
                  </p>
                  <p className="text-xs text-stone-400">{STATUS_LABELS[s]}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
