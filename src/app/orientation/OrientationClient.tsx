"use client";

import { useState } from "react";
import { Button, Input, Textarea, Card, SectionLabel } from "@/components/ui";

export type Orientation = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  recordLinks: { id: string }[];
  bucketItems: { id: string }[];
};

type FormState = { title: string; description: string };
const EMPTY_FORM: FormState = { title: "", description: "" };


export default function OrientationClient({
  initialItems,
}: {
  initialItems: Orientation[];
}) {
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(item: Orientation) {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description ?? "" });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("この方針を削除しますか？関連するバケットアイテムとの紐付けも解除されます。")) return;
    const res = await fetch(`/api/life-orientations/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);

    try {
      if (editingId) {
        const res = await fetch(`/api/life-orientations/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated: Orientation = await res.json();
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          cancelForm();
        }
      } else {
        const res = await fetch("/api/life-orientations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created: Orientation = await res.json();
          setItems((prev) => [...prev, created]);
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
            Life Orientations
          </p>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold text-stone-800 leading-tight">
            人生の方向性
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            こう生きたい、という価値観の軸を刻む
          </p>
        </header>

        {/* 追加ボタン */}
        {!showForm && (
          <Button
            variant="dashed"
            onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}
            className="mb-8 w-full py-3"
          >
            ＋ 新しい方向性を追加
          </Button>
        )}

        {/* フォーム */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8">
            <Card>
              <SectionLabel>{editingId ? "方向性を編集" : "新しい方向性"}</SectionLabel>
              <div className="flex flex-col gap-3">
                <Input
                  type="text"
                  placeholder="例：健康で長生きする、人に優しくある *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="この方向性についての詳細・想い（任意）"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
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
        {items.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="font-[family-name:var(--font-serif)] text-stone-400 text-sm">
              まだ方向性が登録されていません
            </p>
            <p className="mt-1 text-xs text-stone-300">
              「こう生きたい」という軸を言葉にしてみましょう
            </p>
          </Card>
        ) : (
          <>
            <SectionLabel>方向性一覧 {items.length}件</SectionLabel>
            <ul className="flex flex-col gap-3">
              {items.map((item, index) => (
                <li key={item.id}>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-mono text-stone-300">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="font-[family-name:var(--font-serif)] font-bold text-stone-800 leading-snug">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-3 flex gap-3">
                          <span className="text-[10px] text-stone-400">
                            達成記録 <span className="font-mono text-stone-600">{item.recordLinks.length}</span>件
                          </span>
                          <span className="text-[10px] text-stone-400">
                            やりたいこと <span className="font-mono text-stone-600">{item.bucketItems.length}</span>件
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
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
          </>
        )}

      </div>
    </div>
  );
}
