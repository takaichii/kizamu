"use client";

import { useState } from "react";

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

const STATUS_COLORS: Record<BucketStatus, string> = {
  dream: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  inProgress: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
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
    const doneAt =
      next === "done" ? new Date().toISOString() : null;

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
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
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
          setItems((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i))
          );
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg px-4 pb-12 pt-8">
        {/* ヘッダー */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              🗺️ やりたいことリスト
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              死ぬまでにやりたいことを刻もう
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY_FORM);
              setShowForm(true);
            }}
            className="rounded-xl bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            ＋ 追加
          </button>
        </header>

        {/* フィルタータブ */}
        <div className="mb-4 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              }`}
            >
              {f.label}
              {f.value !== "all" && (
                <span className="ml-1 text-zinc-400 dark:text-zinc-500">
                  {items.filter((i) => i.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* フォーム */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-2xl bg-white dark:bg-zinc-800 p-5 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {editingId ? "アイテムを編集" : "新しいアイテムを追加"}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="やりたいこと *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              <input
                type="text"
                placeholder="カテゴリ（旅行、スキル、体験など）*"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              <textarea
                placeholder="詳細・メモ（任意）"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
              />
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as BucketStatus })
                }
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="dream">夢</option>
                <option value="inProgress">挑戦中</option>
                <option value="done">達成</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-zinc-900 dark:bg-zinc-50 py-2.5 text-sm font-medium text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {saving ? "保存中..." : editingId ? "更新" : "追加"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}

        {/* リスト */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-zinc-800 p-8 text-center shadow-sm">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {filter === "all"
                ? "まだアイテムがありません。追加してみましょう！"
                : `「${FILTERS.find((f) => f.value === filter)?.label}」のアイテムはありません`}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl bg-white dark:bg-zinc-800 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status]}`}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-1.5 font-semibold text-sm text-zinc-900 dark:text-zinc-50 leading-snug">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {item.doneAt && (
                      <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                        達成:{" "}
                        {new Date(item.doneAt).toLocaleDateString("ja-JP")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleStatusChange(item)}
                      className="rounded-lg bg-zinc-50 dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
                      title="次のステータスへ"
                    >
                      → {STATUS_LABELS[NEXT_STATUS[item.status]]}
                    </button>
                    <button
                      onClick={() => startEdit(item)}
                      className="rounded-lg bg-zinc-50 dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg bg-zinc-50 dark:bg-zinc-900 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 統計 */}
        {items.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white dark:bg-zinc-800 p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              統計
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(["dream", "inProgress", "done"] as BucketStatus[]).map((s) => (
                <div key={s} className="text-center">
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {items.filter((i) => i.status === s).length}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {STATUS_LABELS[s]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
